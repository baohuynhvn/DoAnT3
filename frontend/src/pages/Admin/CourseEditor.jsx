import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { BookOpen, Check } from 'lucide-react';

const CourseEditor = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  
  const [allQuizzes, setAllQuizzes] = useState([]);
  const [allDecks, setAllDecks] = useState([]);
  
  const [selectedQuizzes, setSelectedQuizzes] = useState([]);
  const [selectedDecks, setSelectedDecks] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [quizRes, deckRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/quizzes`),
          axios.get(`${import.meta.env.VITE_API_URL}/flashcards`)
        ]);
        setAllQuizzes(quizRes.data);
        setAllDecks(deckRes.data);
      } catch (error) {
        console.error("Lỗi lấy dữ liệu tài nguyên:", error);
      }
    };
    fetchData();
  }, []);

  if (!user || user.role !== 'admin') return <div style={{textAlign: 'center', marginTop: '50px'}}>Quyền truy cập bị từ chối</div>;

  const handleToggleQuiz = (id) => {
    if (selectedQuizzes.includes(id)) {
      setSelectedQuizzes(selectedQuizzes.filter(q => q !== id));
    } else {
      setSelectedQuizzes([...selectedQuizzes, id]);
    }
  };

  const handleToggleDeck = (id) => {
    if (selectedDecks.includes(id)) {
      setSelectedDecks(selectedDecks.filter(d => d !== id));
    } else {
      setSelectedDecks([...selectedDecks, id]);
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    if (selectedQuizzes.length === 0 && selectedDecks.length === 0) {
      return alert("Vui lòng chọn ít nhất 1 bài Quiz hoặc Flashcard cho Khoá học!");
    }
    
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post(`${import.meta.env.VITE_API_URL}/courses`, {
        title,
        description,
        quizzes: selectedQuizzes,
        flashcardDecks: selectedDecks
      }, config);
      alert("Tạo khoá học thành công!");
      navigate('/admin');
    } catch (error) {
      alert("Lỗi tạo khoá học: " + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="container" style={{ marginTop: '40px', marginBottom: '80px', maxWidth: '800px' }}>
      <h2 className="title-gradient" style={{ fontSize: '2.5rem', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '15px' }}>
        <BookOpen size={36} color="#8b5cf6" /> Trình Soạn Khóa Học
      </h2>

      <form className="glass-panel" onSubmit={handleCreateCourse} style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '25px' }}>
        <div>
          <label style={{ color: 'white', marginBottom: '8px', display: 'block', fontWeight: 'bold' }}>Tên Khoá Học</label>
          <input type="text" className="input-field" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="VD: Tiếng Anh Giao Tiếp Cơ Bản" />
        </div>
        <div>
          <label style={{ color: 'white', marginBottom: '8px', display: 'block', fontWeight: 'bold' }}>Mô tả Khoá Học</label>
          <textarea className="input-field" value={description} onChange={(e) => setDescription(e.target.value)} rows="3" placeholder="Sơ lược về kết quả đạt được..." />
        </div>

        <div>
          <h3 style={{ color: 'var(--primary-color)', marginBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>1. Chọn Bài Thi (Quizzes)</h3>
          {allQuizzes.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>Chưa có Quizzes nào trên hệ thống.</p> : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
              {allQuizzes.map(q => (
                <div key={q._id} onClick={() => handleToggleQuiz(q._id)} style={{ padding: '15px', background: selectedQuizzes.includes(q._id) ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)', border: `1px solid ${selectedQuizzes.includes(q._id) ? 'var(--primary-color)' : 'transparent'}`, borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {selectedQuizzes.includes(q._id) ? <Check size={20} color="var(--primary-color)" /> : <div style={{width:'20px', height:'20px', border:'1px solid var(--text-muted)', borderRadius:'4px'}}></div>}
                  <span style={{ color: 'white' }}>{q.title}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 style={{ color: '#ec4899', marginBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>2. Chọn Thẻ Ghi Nhớ (Flashcards)</h3>
          {allDecks.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>Chưa có Flashcards nào trên hệ thống.</p> : (
             <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
             {allDecks.map(d => (
               <div key={d._id} onClick={() => handleToggleDeck(d._id)} style={{ padding: '15px', background: selectedDecks.includes(d._id) ? 'rgba(236,72,153,0.2)' : 'rgba(255,255,255,0.05)', border: `1px solid ${selectedDecks.includes(d._id) ? '#ec4899' : 'transparent'}`, borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
                 {selectedDecks.includes(d._id) ? <Check size={20} color="#ec4899" /> : <div style={{width:'20px', height:'20px', border:'1px solid var(--text-muted)', borderRadius:'4px'}}></div>}
                 <span style={{ color: 'white' }}>{d.title}</span>
               </div>
             ))}
           </div>
          )}
        </div>

        <button type="submit" className="btn-primary" style={{ marginTop: '20px', background: 'linear-gradient(45deg, #8b5cf6, #3b82f6)', fontSize: '1.1rem', padding: '15px' }}>
          Đóng Gói Khoá Học
        </button>
      </form>
    </div>
  );
};
export default CourseEditor;
