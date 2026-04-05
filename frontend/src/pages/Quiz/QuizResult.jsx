import React, { useState, useContext } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Star, Send } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';

const QuizResult = () => {
  const location = useLocation();
  const { result, quizData, userAnswers } = location.state || {};

  if (!result || !quizData) return <div style={{textAlign:'center', marginTop:'50px'}}>Không tìm thấy kết quả. Dường như bạn chưa làm bài?</div>;

  const { user } = useContext(AuthContext);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewSent, setReviewSent] = useState(false);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert('Bạn cần đăng nhập để đánh giá');
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post(`${import.meta.env.VITE_API_URL}/reviews`, {
        targetType: 'Quiz',
        targetId: quizData.quiz._id,
        rating,
        comment
      }, config);
      setReviewSent(true);
    } catch (error) {
      alert("Lỗi đăng đánh giá: " + (error.response?.data?.message || error.message));
    }
  };

  const percentage = ((result.score / result.total) * 100).toFixed(0);
  const isGood = percentage >= 70;

  return (
    <div className="container" style={{ marginTop: '40px', marginBottom: '60px', maxWidth: '800px' }}>
      <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
        <h2 className="title-gradient" style={{ fontSize: '2.5rem', marginBottom: '20px' }}>Đã Hoàn Thành Bài Quiz!</h2>
        <h3 style={{ color: 'white', marginBottom: '30px' }}>{quizData.quiz.title}</h3>
        
        <div style={{ display: 'flex', justifyContent: 'center', margin: '40px 0' }}>
          <div style={{ 
            width: '150px', 
            height: '150px', 
            borderRadius: '50%', 
            border: `8px solid ${isGood ? '#10b981' : '#fbbf24'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            boxShadow: `0 0 20px ${isGood ? 'rgba(16, 185, 129, 0.4)' : 'rgba(251, 191, 36, 0.4)'}`
          }}>
            <span style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white' }}>{percentage}%</span>
            <span style={{ color: 'var(--text-muted)' }}>{result.score} / {result.total}</span>
          </div>
        </div>

        <p style={{ fontSize: '1.2rem', color: isGood ? '#10b981' : '#fbbf24', marginBottom: '40px' }}>
          {isGood ? 'Tuyệt vời! Bạn đã nhận được điểm kinh nghiệm (EXP)!' : 'Cố gắng lên! Hãy học thuộc và thử lại nhé!'}
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
          <Link to="/quizzes" className="btn-primary" style={{ textDecoration: 'none', background: 'transparent', border: '1px solid var(--text-muted)' }}>
            Làm Bài Khác
          </Link>
          <Link to="/dashboard" className="btn-primary" style={{ textDecoration: 'none' }}>
            Xem Hồ Sơ của tôi
          </Link>
        </div>
      </div>

      {/* Khu vực Gửi Tham khảo Review Model */}
      <div className="glass-panel" style={{ padding: '30px', marginTop: '30px', textAlign: 'center', border: '1px solid rgba(251, 191, 36, 0.5)' }}>
        <h3 style={{ color: '#fbbf24', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
           Đánh giá chất lượng Bài thi này
        </h3>
        {reviewSent ? (
          <p style={{ color: '#10b981', fontWeight: 'bold' }}>✅ Đánh giá của bạn đã được ghi nhận vào cơ sở dữ liệu (Review Model)!</p>
        ) : (
          <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', maxWidth: '500px', margin: '0 auto' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
               {[1,2,3,4,5].map(star => (
                 <Star 
                   key={star} 
                   size={32} 
                   onClick={() => setRating(star)} 
                   fill={star <= rating ? "#fbbf24" : "transparent"} 
                   color={star <= rating ? "#fbbf24" : "var(--text-muted)"}
                   style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                 />
               ))}
            </div>
            <textarea 
              value={comment} 
              onChange={(e) => setComment(e.target.value)} 
              placeholder="Chia sẻ nhận xét của bạn về đề thi này (Model: Review)..." 
              className="input-field" 
              rows="3" 
              style={{ width: '100%', resize: 'none' }}
              required
            />
            <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(45deg, #fbbf24, #f59e0b)' }}>
               <Send size={18} /> Gửi Đánh Giá
            </button>
          </form>
        )}
      </div>

      {/* Chi tiết từng câu hỏi */}
      {result.results && quizData.questions && (
        <div style={{ marginTop: '40px' }}>
          <h3 className="title-gradient" style={{ fontSize: '1.8rem', marginBottom: '20px' }}>📋 Xem Lại Chi Tiết Từng Câu</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {quizData.questions.map((q, idx) => {
              const r = result.results.find(res => res.questionId === q._id);
              const isCorrect = r ? r.isCorrect : false;
              const userAnswer = userAnswers ? userAnswers[q._id] : '(Không trả lời)';

              return (
                <div key={q._id} className="glass-panel" style={{ padding: '20px', border: `1px solid ${isCorrect ? '#10b981' : '#ef4444'}` }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
                    {isCorrect ? <CheckCircle size={22} style={{ color: '#10b981', flexShrink: 0, marginTop: '2px' }} /> : <XCircle size={22} style={{ color: '#ef4444', flexShrink: 0, marginTop: '2px' }} />}
                    <p style={{ fontWeight: '600', color: 'white' }}>Câu {idx + 1}: {q.content}</p>
                  </div>
                  
                  <div style={{ marginLeft: '34px' }}>
                    <p style={{ color: isCorrect ? '#10b981' : '#ef4444', fontSize: '0.9rem' }}>
                      Bạn chọn: <strong>{userAnswer || '(Bỏ trống)'}</strong>
                    </p>
                    {!isCorrect && r && (
                      <p style={{ color: '#10b981', fontSize: '0.9rem', marginTop: '4px' }}>
                        Đáp án đúng: <strong>{r.correctAnswer}</strong>
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizResult;
