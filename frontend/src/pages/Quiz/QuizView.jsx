import React, { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Clock, Star } from 'lucide-react';

const QuizView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [reviews, setReviews] = useState([]);
  
  // Timer state (30s per question)
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/quizzes/${id}`);
        setQuizData(data);
        setTimeLeft(data.questions.length * 30); // 30 giây mỗi câu

        const revRes = await axios.get(`${import.meta.env.VITE_API_URL}/reviews/${id}`).catch(() => ({ data: [] }));
        setReviews(revRes.data);
      } catch (error) {
        console.error("Lỗi tải bài làm:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuizData();
  }, [id]);

  // Đồng hồ đếm ngược
  useEffect(() => {
    if (timeLeft <= 0 && quizData) {
      // Hết giờ -> tự nộp
      submitQuiz();
      return;
    }
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [timeLeft > 0]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (questionId, option) => {
    setAnswers({ ...answers, [questionId]: option });
  };

  const submitQuiz = async () => {
    clearInterval(timerRef.current);
    const formattedAnswers = quizData.questions.map(q => ({
      questionId: q._id,
      selectedOption: answers[q._id] || ''
    }));

    try {
      const config = user ? { headers: { Authorization: `Bearer ${user.token}` } } : {};
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/quizzes/${id}/submit`, { answers: formattedAnswers }, config);
      
      // LƯU LỊCH SỬ VÀO QuizAttempt Model
      if (user) {
        try {
           const timeSpent = (quizData.questions.length * 30) - timeLeft;
           await axios.post(`${import.meta.env.VITE_API_URL}/attempts`, {
             quizId: id,
             score: data.score,
             totalQuestions: data.total,
             timeSpent,
             answers: formattedAnswers
           }, config);
        } catch (e) {
           console.error("Lỗi khi lưu QuizAttempt:", e);
        }
      }

      navigate(`/quizzes/${id}/result`, { state: { result: data, quizData, userAnswers: answers } });
    } catch (error) {
      console.error("Error submitting quiz:", error);
      alert("Lỗi từ máy chủ: " + (error.response?.data?.message || error.message));
    }
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Đang tải câu hỏi...</div>;
  if (!quizData || !quizData.questions.length) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Bài Quiz này chưa có câu hỏi nào.</div>;

  const currentQ = quizData.questions[currentQuestionIdx];
  const totalQ = quizData.questions.length;
  const progress = ((currentQuestionIdx) / totalQ) * 100;
  const isUrgent = timeLeft <= 30;

  return (
    <div className="container" style={{ marginTop: '40px', marginBottom: '60px', maxWidth: '800px' }}>
      <div style={{ marginBottom: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="title-gradient">{quizData.quiz.title}</h2>
          {/* Timer */}
          <div style={{ 
            display: 'flex', alignItems: 'center', gap: '8px', 
            padding: '8px 16px', borderRadius: '12px',
            background: isUrgent ? 'rgba(239,68,68,0.15)' : 'rgba(99,102,241,0.15)', 
            border: `1px solid ${isUrgent ? '#ef4444' : 'var(--primary-color)'}`,
            color: isUrgent ? '#ef4444' : 'var(--primary-color)',
            fontWeight: 'bold', fontSize: '1.1rem',
            animation: isUrgent ? 'pulse 1s infinite' : 'none'
          }}>
            <Clock size={18} /> {formatTime(timeLeft)}
          </div>
        </div>
        <p style={{ color: 'var(--text-muted)' }}>Câu hỏi {currentQuestionIdx + 1} trên tổng số {totalQ}</p>
        
        {/* Progress Bar */}
        <div style={{ width: '100%', height: '8px', background: 'var(--glass-border)', borderRadius: '4px', marginTop: '15px', overflow: 'hidden' }}>
          <div style={{ width: `${progress}%`, height: '100%', background: 'var(--primary-color)', transition: 'width 0.3s' }}></div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '40px' }}>
        <h3 style={{ fontSize: '1.4rem', marginBottom: '30px' }}>{currentQ.content}</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {currentQ.options.map((opt, idx) => (
            <button 
              key={idx}
              onClick={() => handleSelectOption(currentQ._id, opt)}
              className="glass-panel"
              style={{
                padding: '15px 20px', 
                textAlign: 'left', 
                border: answers[currentQ._id] === opt ? '2px solid var(--primary-color)' : '1px solid var(--glass-border)',
                background: answers[currentQ._id] === opt ? 'rgba(99, 102, 241, 0.1)' : 'var(--card-bg)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                color: 'white',
                fontSize: '1.1rem'
              }}
            >
              {opt}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px' }}>
          <button 
            className="btn-primary" 
            style={{ background: 'transparent', border: '1px solid var(--text-muted)', visibility: currentQuestionIdx === 0 ? 'hidden' : 'visible' }}
            onClick={() => setCurrentQuestionIdx(prev => prev - 1)}
          >
            Câu trước
          </button>
          
          {currentQuestionIdx < totalQ - 1 ? (
             <button className="btn-primary" onClick={() => setCurrentQuestionIdx(prev => prev + 1)}>
             Câu kế tiếp
             </button>
          ) : (
            <button className="btn-primary" onClick={submitQuiz} style={{ background: '#10b981' }}>
             Nộp Bài Điểm Số
             </button>
          )}
        </div>
      </div>

      {/* HIỂN THỊ CÁC REVIEW VỀ BÀI THI NÀY DÀNH CHO CỘNG ĐỒNG */}
      <div style={{ marginTop: '50px' }}>
        <h3 className="title-gradient" style={{ fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Star size={24} color="#fbbf24" /> Đánh Giá Của Người Chơi Khác ({reviews.length})
        </h3>
        {reviews.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', marginTop: '15px' }}>Chưa có ai đánh giá bài thi này. Hãy là người đầu tiên sau khi hoàn thành nhé!</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
            {reviews.slice().reverse().map(rev => (
              <div key={rev._id} className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid #fbbf24' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontWeight: 'bold', color: 'white' }}>{rev.userId?.name || 'Người dùng ẩn danh'}</span>
                  <div style={{ display: 'flex' }}>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} fill={i < rev.rating ? "#fbbf24" : "transparent"} color={i < rev.rating ? "#fbbf24" : "var(--text-muted)"} />
                    ))}
                  </div>
                </div>
                <p style={{ color: 'var(--text-light)', fontStyle: 'italic', fontSize: '0.95rem' }}>"{rev.comment}"</p>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
export default QuizView;
