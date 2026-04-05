import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Edit, Trash2, Save, X, PlusCircle, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';

const QuizQuestionManager = () => {
  const { quizId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  // State sửa câu hỏi
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [editOptions, setEditOptions] = useState(['', '', '', '']);
  const [editCorrectAnswer, setEditCorrectAnswer] = useState('');

  // State thêm câu hỏi mới
  const [showAdd, setShowAdd] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [newOptions, setNewOptions] = useState(['', '', '', '']);
  const [newCorrectAnswer, setNewCorrectAnswer] = useState('');

  const config = user ? { headers: { Authorization: `Bearer ${user.token}` } } : {};

  useEffect(() => {
    fetchData();
  }, [quizId]);

  const fetchData = async () => {
    try {
      const [quizRes, questionsRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/quizzes/${quizId}`),
        axios.get(`${import.meta.env.VITE_API_URL}/quizzes/${quizId}/questions`, config)
      ]);
      setQuiz(quizRes.data.quiz);
      setQuestions(questionsRes.data);
    } catch (error) {
      console.error('Lỗi:', error);
    } finally {
      setLoading(false);
    }
  };

  // === SỬA ===
  const startEdit = (q) => {
    setEditingId(q._id);
    setEditContent(q.content);
    setEditOptions([...q.options]);
    setEditCorrectAnswer(q.correctAnswer);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditContent('');
    setEditOptions(['', '', '', '']);
    setEditCorrectAnswer('');
  };

  const handleSave = async (id) => {
    if (!editOptions.includes(editCorrectAnswer)) {
      return alert('Đáp án đúng phải khớp với một trong 4 lựa chọn!');
    }
    try {
      const res = await axios.put(`${import.meta.env.VITE_API_URL}/quizzes/questions/${id}`, {
        content: editContent,
        options: editOptions,
        correctAnswer: editCorrectAnswer
      }, config);
      setQuestions(questions.map(q => q._id === id ? res.data : q));
      cancelEdit();
    } catch (error) {
      alert('Lỗi cập nhật: ' + (error.response?.data?.message || error.message));
    }
  };

  // === XOÁ ===
  const handleDelete = async (id) => {
    if (!window.confirm('Bạn chắc chắn muốn xoá câu hỏi này?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/quizzes/questions/${id}`, config);
      setQuestions(questions.filter(q => q._id !== id));
    } catch (error) {
      alert('Lỗi xoá: ' + (error.response?.data?.message || error.message));
    }
  };

  // === THÊM MỚI ===
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newOptions.includes(newCorrectAnswer)) {
      return alert('Đáp án đúng phải khớp với một trong 4 lựa chọn!');
    }
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/quizzes/${quizId}/questions`, {
        content: newContent,
        options: newOptions,
        correctAnswer: newCorrectAnswer
      }, config);
      setQuestions([...questions, data]);
      setNewContent('');
      setNewOptions(['', '', '', '']);
      setNewCorrectAnswer('');
      setShowAdd(false);
    } catch (error) {
      alert('Lỗi thêm: ' + (error.response?.data?.message || error.message));
    }
  };

  // === STYLES ===
  const inputStyle = {
    background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '8px', padding: '10px 14px', color: 'white', width: '100%',
    marginBottom: '10px', fontSize: '0.95rem'
  };
  const btnSave = {
    background: 'rgba(34,197,94,0.15)', border: '1px solid #22c55e', borderRadius: '8px',
    padding: '8px 16px', cursor: 'pointer', color: '#22c55e', display: 'flex',
    alignItems: 'center', gap: '6px', fontSize: '0.9rem'
  };
  const btnCancel = {
    background: 'rgba(156,163,175,0.15)', border: '1px solid #9ca3af', borderRadius: '8px',
    padding: '8px 16px', cursor: 'pointer', color: '#9ca3af', display: 'flex',
    alignItems: 'center', gap: '6px', fontSize: '0.9rem'
  };
  const btnEdit = {
    background: 'rgba(59,130,246,0.15)', border: '1px solid #3b82f6', borderRadius: '8px',
    padding: '8px 12px', cursor: 'pointer', color: '#3b82f6', display: 'flex',
    alignItems: 'center', gap: '6px', fontSize: '0.85rem'
  };
  const btnDelete = {
    background: 'rgba(239,68,68,0.15)', border: '1px solid #ef4444', borderRadius: '8px',
    padding: '8px 12px', cursor: 'pointer', color: '#ef4444', display: 'flex',
    alignItems: 'center', gap: '6px', fontSize: '0.85rem'
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Đang tải...</div>;
  if (!quiz) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Không tìm thấy Quiz!</div>;

  return (
    <div className="container" style={{ marginTop: '40px', marginBottom: '60px', maxWidth: '900px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
        <Link to="/admin" style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px', textDecoration: 'none' }}>
          <ArrowLeft size={20} /> Quay lại
        </Link>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <div>
          <h2 className="title-gradient" style={{ fontSize: '2rem', marginBottom: '5px' }}>📝 {quiz.title}</h2>
          <p style={{ color: 'var(--text-muted)' }}>{questions.length} câu hỏi • {quiz.category || 'Chưa phân loại'}</p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#10b981' }}
        >
          <PlusCircle size={18} /> Thêm câu hỏi
        </button>
      </div>

      {/* Form thêm câu hỏi mới */}
      {showAdd && (
        <form onSubmit={handleAdd} className="glass-panel" style={{
          padding: '25px', marginBottom: '25px',
          border: '1px solid rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.05)'
        }}>
          <h4 style={{ color: '#10b981', marginBottom: '15px' }}>➕ Thêm câu hỏi mới</h4>
          <textarea
            style={{ ...inputStyle, minHeight: '60px' }} value={newContent}
            onChange={(e) => setNewContent(e.target.value)} required
            placeholder="Nội dung câu hỏi..."
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {newOptions.map((opt, i) => (
              <input key={i} style={inputStyle} value={opt}
                onChange={(e) => { const o = [...newOptions]; o[i] = e.target.value; setNewOptions(o); }}
                required placeholder={`Lựa chọn ${i + 1}`}
              />
            ))}
          </div>
          <input style={{ ...inputStyle, borderColor: '#10b981' }} value={newCorrectAnswer}
            onChange={(e) => setNewCorrectAnswer(e.target.value)} required
            placeholder="Đáp án đúng (copy chính xác 1 trong 4 lựa chọn)"
          />
          <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
            <button type="submit" style={btnSave}><Save size={16} /> Thêm</button>
            <button type="button" onClick={() => setShowAdd(false)} style={btnCancel}><X size={16} /> Huỷ</button>
          </div>
        </form>
      )}

      {/* Danh sách câu hỏi */}
      {questions.length === 0 ? (
        <div className="glass-panel" style={{ padding: '30px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)' }}>Quiz này chưa có câu hỏi nào. Bấm "Thêm câu hỏi" ở trên!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {questions.map((q, idx) => (
            <div key={q._id} className="glass-panel" style={{ padding: '20px' }}>
              {editingId === q._id ? (
                /* === CHẾ ĐỘ SỬA === */
                <div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '10px' }}>Sửa câu {idx + 1}</p>
                  <textarea
                    style={{ ...inputStyle, minHeight: '60px' }} value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                  />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    {editOptions.map((opt, i) => (
                      <div key={i} style={{ position: 'relative' }}>
                        <input style={{
                          ...inputStyle,
                          borderColor: opt === editCorrectAnswer ? '#22c55e' : 'rgba(255,255,255,0.2)'
                        }} value={opt}
                          onChange={(e) => {
                            const o = [...editOptions];
                            // Nếu đang sửa option mà nó là đáp án đúng thì cập nhật luôn
                            if (o[i] === editCorrectAnswer) setEditCorrectAnswer(e.target.value);
                            o[i] = e.target.value;
                            setEditOptions(o);
                          }}
                          placeholder={`Lựa chọn ${i + 1}`}
                        />
                        <button
                          type="button"
                          onClick={() => setEditCorrectAnswer(opt)}
                          style={{
                            position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-70%)',
                            background: opt === editCorrectAnswer ? '#22c55e' : 'transparent',
                            border: `1px solid ${opt === editCorrectAnswer ? '#22c55e' : 'rgba(255,255,255,0.3)'}`,
                            borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                          }}
                          title="Đặt làm đáp án đúng"
                        >
                          {opt === editCorrectAnswer && <CheckCircle size={14} color="white" />}
                        </button>
                      </div>
                    ))}
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '10px' }}>
                    💡 Bấm vào nút tròn bên phải để chọn đáp án đúng. Đáp án hiện tại: <strong style={{ color: '#22c55e' }}>{editCorrectAnswer}</strong>
                  </p>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => handleSave(q._id)} style={btnSave}><Save size={16} /> Lưu</button>
                    <button onClick={cancelEdit} style={btnCancel}><X size={16} /> Huỷ</button>
                  </div>
                </div>
              ) : (
                /* === CHẾ ĐỘ XEM === */
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <p style={{ color: 'white', fontWeight: 'bold', fontSize: '1rem' }}>
                      <span style={{ color: 'var(--primary-color)', marginRight: '8px' }}>Câu {idx + 1}.</span>
                      {q.content}
                    </p>
                    <div style={{ display: 'flex', gap: '8px', flexShrink: 0, marginLeft: '10px' }}>
                      <button onClick={() => startEdit(q)} style={btnEdit}><Edit size={14} /> Sửa</button>
                      <button onClick={() => handleDelete(q._id)} style={btnDelete}><Trash2 size={14} /> Xoá</button>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    {q.options.map((opt, i) => (
                      <div key={i} style={{
                        padding: '8px 14px', borderRadius: '8px', fontSize: '0.9rem',
                        background: opt === q.correctAnswer ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${opt === q.correctAnswer ? '#22c55e' : 'rgba(255,255,255,0.1)'}`,
                        color: opt === q.correctAnswer ? '#22c55e' : 'var(--text-light)',
                        display: 'flex', alignItems: 'center', gap: '8px'
                      }}>
                        {opt === q.correctAnswer ? <CheckCircle size={14} /> : <AlertCircle size={14} style={{ opacity: 0.3 }} />}
                        {opt}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuizQuestionManager;
