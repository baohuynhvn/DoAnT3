import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { CheckSquare, Layers, BookOpen, UserPlus, FileText } from 'lucide-react';

const CourseView = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/courses/${id}`);
        setCourse(data);
      } catch (error) {
        console.error("Lỗi lấy thông tin khoá học", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  const handleEnroll = async () => {
    if (!user) return alert("Vui lòng đăng nhập để tham gia khoá học!");
    setEnrolling(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/courses/${id}/enroll`, {}, config);
      setCourse(data);
    } catch (error) {
      alert("Lỗi tham gia: " + (error.response?.data?.message || error.message));
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Đang tải lộ trình...</div>;
  if (!course) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Không tìm thấy Khoá học!</div>;

  const isEnrolled = user && (course.studentsEnrolled || []).includes(user._id);

  return (
    <div className="container" style={{ marginTop: '40px', marginBottom: '80px', maxWidth: '900px' }}>
      
      {/* Banner */}
      <div className="glass-panel" style={{ padding: '40px', background: 'linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(59,130,246,0.15) 100%)', border: '1px solid rgba(139,92,246,0.3)', marginBottom: '30px' }}>
        <h2 className="title-gradient" style={{ fontSize: '2.5rem', marginBottom: '15px' }}>{course.title}</h2>
        <p style={{ color: 'var(--text-light)', fontSize: '1.1rem', marginBottom: '25px', lineHeight: '1.6' }}>{course.description}</p>
        
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
           {!isEnrolled ? (
             <button onClick={handleEnroll} disabled={enrolling} className="btn-primary" style={{ background: '#10b981', display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 25px', fontSize: '1.1rem' }}>
               <UserPlus size={20} /> Tham Gia Ngay (Miễn phí)
             </button>
           ) : (
             <div style={{ display: 'inline-block', padding: '10px 20px', background: 'rgba(16,185,129,0.2)', border: '1px solid #10b981', color: '#10b981', borderRadius: '8px', fontWeight: 'bold' }}>
                🎉 Bạn đã tham gia khoá học này
             </div>
           )}
           <span style={{ color: 'var(--text-muted)' }}>{(course.studentsEnrolled || []).length} học viên theo học</span>
        </div>
      </div>

      {/* Nội dung bài học */}
      <h3 style={{ fontSize: '1.8rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <BookOpen color="#3b82f6" /> Lộ trình nội dung chi tiết
      </h3>

      {!isEnrolled && (
        <div style={{ padding: '15px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px dashed #ef4444', borderRadius: '8px', marginBottom: '20px' }}>
          Bạn cần nhấn <strong>Tham Gia Ngay</strong> ở trên để hệ thống ghi nhận tiến độ vào Hồ sơ cá nhân của bạn.
        </div>
      )}

      {/* Danh sách Quizzes */}
      {course.quizzes && course.quizzes.length > 0 && (
        <div className="glass-panel" style={{ padding: '25px', marginBottom: '20px' }}>
          <h4 style={{ color: 'var(--primary-color)', marginBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckSquare size={20} /> Phần 1: Các bài kiểm tra trắc nghiệm
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {course.quizzes.map((q, i) => (
              <div key={q._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(99,102,241,0.2)', color: '#a78bfa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                      {i + 1}
                    </div>
                    <span style={{ color: 'white', fontWeight: '500' }}>{q.title}</span>
                 </div>
                 <Link to={`/quizzes/${q._id}`} className="btn-primary" style={{ padding: '6px 15px', fontSize: '0.9rem', textDecoration: 'none' }}>Vào Thi</Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Danh sách Flashcards */}
      {course.flashcardDecks && course.flashcardDecks.length > 0 && (
        <div className="glass-panel" style={{ padding: '25px', marginBottom: '20px' }}>
          <h4 style={{ color: '#ec4899', marginBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={20} /> Phần 2: Thẻ ghi nhớ từ vựng / lý thuyết
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {course.flashcardDecks.map((d, i) => (
              <div key={d._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(236,72,153,0.2)', color: '#f472b6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                      {i + 1}
                    </div>
                    <span style={{ color: 'white', fontWeight: '500' }}>{d.title}</span>
                 </div>
                 <Link to={`/flashcards/${d._id}`} className="btn-primary" style={{ padding: '6px 15px', fontSize: '0.9rem', textDecoration: 'none', background: 'rgba(236,72,153,0.2)', color: '#f472b6', border: '1px solid #f472b6' }}>Học Thẻ</Link>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
export default CourseView;
