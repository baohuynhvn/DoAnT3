import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Search, Star } from 'lucide-react';

const QuizList = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [reviewStats, setReviewStats] = useState({});

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/quizzes`);
        setQuizzes(data);

        // Fetch riêng Review cho từng Quiz để làm tính năng Hiển thị Sao (Frontend MERN approach)
        const stats = {};
        await Promise.all(data.map(async (quiz) => {
          try {
             const revRes = await axios.get(`${import.meta.env.VITE_API_URL}/reviews/${quiz._id}`);
             const reviews = revRes.data;
             if(reviews.length > 0) {
               const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
               stats[quiz._id] = { avg: avg.toFixed(1), total: reviews.length };
             }
          } catch(e) {}
        }));
        setReviewStats(stats);

      } catch (error) {
        console.error("Lỗi khi tải danh sách quizzes:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, []);

  const filtered = quizzes.filter(q =>
    q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (q.category && q.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Đang tải danh sách Quiz...</div>;

  return (
    <div className="container" style={{ marginTop: '40px', marginBottom: '60px' }}>
      <h2 className="title-gradient" style={{ fontSize: '2.5rem', marginBottom: '20px' }}>Danh Sách Bài Thi Quizzes</h2>
      
      {/* Thanh tìm kiếm */}
      <div style={{ position: 'relative', marginBottom: '30px', maxWidth: '500px' }}>
        <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input 
          type="text" 
          className="input-field" 
          placeholder="Tìm kiếm theo tên hoặc chủ đề..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ paddingLeft: '42px' }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {filtered.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>{searchTerm ? 'Không tìm thấy kết quả phù hợp.' : 'Chưa có bài Quiz nào trong hệ thống.'}</p>
        ) : (
          filtered.map((quiz) => (
            <div key={quiz._id} className="glass-panel" style={{ padding: '25px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 style={{ fontSize: '1.2rem', color: 'white' }}>{quiz.title}</h3>
                {reviewStats[quiz._id] && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(251, 191, 36, 0.1)', padding: '4px 8px', borderRadius: '12px', border: '1px solid rgba(251, 191, 36, 0.3)' }}>
                    <Star size={14} color="#fbbf24" fill="#fbbf24" />
                    <span style={{ color: '#fbbf24', fontWeight: 'bold', fontSize: '0.9rem' }}>{reviewStats[quiz._id].avg}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>({reviewStats[quiz._id].total})</span>
                  </div>
                )}
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', flex: 1 }}>{quiz.description || "Chưa có mô tả."}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ background: 'rgba(99, 102, 241, 0.2)', color: 'var(--primary-color)', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                  {quiz.category}
                </span>
                <Link to={`/quizzes/${quiz._id}`} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.9rem', textDecoration: 'none' }}>Làm bài ngay</Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default QuizList;
