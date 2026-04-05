import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { ArrowLeft, Save, BookOpen, CheckSquare, Layers, Check, Trash2 } from 'lucide-react';

const CourseManager = () => {
  const { courseId } = useParams();
  const { user } = useContext(AuthContext);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  // Editable fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // Available resources
  const [allQuizzes, setAllQuizzes] = useState([]);
  const [allDecks, setAllDecks] = useState([]);
  const [selectedQuizzes, setSelectedQuizzes] = useState([]);
  const [selectedDecks, setSelectedDecks] = useState([]);
  const [saving, setSaving] = useState(false);

  const config = user ? { headers: { Authorization: `Bearer ${user.token}` } } : {};

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseRes, quizRes, deckRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/courses/${courseId}`),
          axios.get(`${import.meta.env.VITE_API_URL}/quizzes`),
          axios.get(`${import.meta.env.VITE_API_URL}/flashcards`)
        ]);
        const c = courseRes.data;
        setCourse(c);
        setTitle(c.title);
        setDescription(c.description || '');
        setSelectedQuizzes((c.quizzes || []).map(q => typeof q === 'object' ? q._id : q));
        setSelectedDecks((c.flashcardDecks || []).map(d => typeof d === 'object' ? d._id : d));
        setAllQuizzes(quizRes.data);
        setAllDecks(deckRes.data);
      } catch (error) {
        console.error('Lỗi:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseId]);

  const handleToggleQuiz = (id) => {
    setSelectedQuizzes(prev =>
      prev.includes(id) ? prev.filter(q => q !== id) : [...prev, id]
    );
  };

  const handleToggleDeck = (id) => {
    setSelectedDecks(prev =>
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await axios.put(`${import.meta.env.VITE_API_URL}/courses/${courseId}`, {
        title,
        description,
        quizzes: selectedQuizzes,
        flashcardDecks: selectedDecks
      }, config);
      setCourse(res.data);
      alert('✅ Đã lưu khoá học thành công!');
    } catch (error) {
      alert('Lỗi: ' + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '8px', padding: '12px 16px', color: 'white', width: '100%',
    marginBottom: '12px', fontSize: '1rem'
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Đang tải...</div>;
  if (!course) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Không tìm thấy khoá học!</div>;

  return (
    <div className="container" style={{ marginTop: '40px', marginBottom: '60px', maxWidth: '900px' }}>
      <Link to="/admin" style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px', textDecoration: 'none', marginBottom: '25px' }}>
        <ArrowLeft size={20} /> Quay lại Admin
      </Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2 className="title-gradient" style={{ fontSize: '2rem' }}>
          <BookOpen size={28} style={{ marginRight: '10px' }} />Chỉnh sửa Khoá Học
        </h2>
        <button onClick={handleSave} disabled={saving} className="btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#10b981', padding: '12px 24px' }}>
          <Save size={18} /> {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
        </button>
      </div>

      {/* Thông tin cơ bản */}
      <div className="glass-panel" style={{ padding: '25px', marginBottom: '25px' }}>
        <h3 style={{ color: 'white', marginBottom: '15px' }}>📝 Thông tin cơ bản</h3>
        <label style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'block', marginBottom: '5px' }}>Tên khoá học</label>
        <input style={inputStyle} value={title} onChange={e => setTitle(e.target.value)} placeholder="Tên khoá học" />
        <label style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'block', marginBottom: '5px' }}>Mô tả</label>
        <textarea style={{ ...inputStyle, minHeight: '80px' }} value={description} onChange={e => setDescription(e.target.value)} placeholder="Mô tả khoá học..." />
      </div>

      {/* Chọn Quizzes */}
      <div className="glass-panel" style={{ padding: '25px', marginBottom: '25px' }}>
        <h3 style={{ color: 'var(--primary-color)', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckSquare size={20} /> Bài kiểm tra (Quizzes) — đã chọn {selectedQuizzes.length}
        </h3>
        {allQuizzes.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>Chưa có Quiz nào.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {allQuizzes.map(q => {
              const selected = selectedQuizzes.includes(q._id);
              return (
                <div key={q._id} onClick={() => handleToggleQuiz(q._id)} style={{
                  padding: '14px 18px', borderRadius: '10px', cursor: 'pointer',
                  background: selected ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${selected ? 'var(--primary-color)' : 'rgba(255,255,255,0.08)'}`,
                  display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.2s'
                }}>
                  <div style={{
                    width: '24px', height: '24px', borderRadius: '6px',
                    background: selected ? 'var(--primary-color)' : 'transparent',
                    border: `2px solid ${selected ? 'var(--primary-color)' : 'rgba(255,255,255,0.3)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}>
                    {selected && <Check size={14} color="white" />}
                  </div>
                  <div>
                    <p style={{ color: 'white', fontWeight: selected ? 'bold' : 'normal' }}>{q.title}</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{q.category || 'Chưa phân loại'}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Chọn Flashcards */}
      <div className="glass-panel" style={{ padding: '25px', marginBottom: '25px' }}>
        <h3 style={{ color: '#ec4899', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers size={20} /> Thẻ ghi nhớ (Flashcards) — đã chọn {selectedDecks.length}
        </h3>
        {allDecks.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>Chưa có Flashcard nào.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {allDecks.map(d => {
              const selected = selectedDecks.includes(d._id);
              return (
                <div key={d._id} onClick={() => handleToggleDeck(d._id)} style={{
                  padding: '14px 18px', borderRadius: '10px', cursor: 'pointer',
                  background: selected ? 'rgba(236,72,153,0.15)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${selected ? '#ec4899' : 'rgba(255,255,255,0.08)'}`,
                  display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.2s'
                }}>
                  <div style={{
                    width: '24px', height: '24px', borderRadius: '6px',
                    background: selected ? '#ec4899' : 'transparent',
                    border: `2px solid ${selected ? '#ec4899' : 'rgba(255,255,255,0.3)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}>
                    {selected && <Check size={14} color="white" />}
                  </div>
                  <div>
                    <p style={{ color: 'white', fontWeight: selected ? 'bold' : 'normal' }}>{d.title}</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{d.description || ''}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Nút lưu dưới cùng */}
      <div style={{ textAlign: 'center', marginTop: '10px' }}>
        <button onClick={handleSave} disabled={saving} className="btn-primary"
          style={{ padding: '14px 40px', fontSize: '1.1rem', background: '#10b981', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <Save size={20} /> {saving ? 'Đang lưu...' : 'Lưu tất cả thay đổi'}
        </button>
      </div>
    </div>
  );
};

export default CourseManager;
