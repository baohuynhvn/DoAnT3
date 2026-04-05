import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import { PlusCircle, Layers, CheckSquare, Trash2, RefreshCw, Edit, BookOpen, Award, Save, X, Image as ImageIcon, Users } from 'lucide-react';

const AdminPanel = () => {
  const { user } = useContext(AuthContext);
  const [quizzes, setQuizzes] = useState([]);
  const [decks, setDecks] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // State chỉnh sửa Achievement
  const [editingAchId, setEditingAchId] = useState(null);
  const [editAchName, setEditAchName] = useState('');
  const [editAchDesc, setEditAchDesc] = useState('');
  const [editAchFile, setEditAchFile] = useState(null);

  // State chỉnh sửa Course
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [editCourseTitle, setEditCourseTitle] = useState('');
  const [editCourseDesc, setEditCourseDesc] = useState('');

  // State chỉnh sửa Quiz
  const [editingQuizId, setEditingQuizId] = useState(null);
  const [editQuizTitle, setEditQuizTitle] = useState('');
  const [editQuizCategory, setEditQuizCategory] = useState('');

  const config = user ? { headers: { Authorization: `Bearer ${user.token}` } } : {};

  const fetchData = async () => {
    setLoading(true);
    try {
      const [qRes, fRes, achRes, cRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/quizzes`),
        axios.get(`${import.meta.env.VITE_API_URL}/flashcards`),
        axios.get(`${import.meta.env.VITE_API_URL}/achievements`),
        axios.get(`${import.meta.env.VITE_API_URL}/courses`),
      ]);
      setQuizzes(qRes.data);
      setDecks(fRes.data);
      setAchievements(achRes.data);
      setCourses(cRes.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  if (!user) return <div style={{textAlign: 'center', marginTop: '50px'}}>Đang tải...</div>;

  // ===== QUIZ =====
  const handleDeleteQuiz = async (id, title) => {
    if (!window.confirm(`Bạn chắc chắn muốn xoá Quiz "${title}" và toàn bộ câu hỏi bên trong?`)) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/quizzes/${id}`, config);
      setQuizzes(quizzes.filter(q => q._id !== id));
    } catch (error) {
      alert("Lỗi xoá: " + (error.response?.data?.message || error.message));
    }
  };

  const startEditQuiz = (q) => {
    setEditingQuizId(q._id);
    setEditQuizTitle(q.title);
    setEditQuizCategory(q.category || '');
  };

  const cancelEditQuiz = () => {
    setEditingQuizId(null);
    setEditQuizTitle('');
    setEditQuizCategory('');
  };

  const handleSaveQuiz = async (id) => {
    try {
      const res = await axios.put(`${import.meta.env.VITE_API_URL}/quizzes/${id}`, {
        title: editQuizTitle,
        category: editQuizCategory
      }, config);
      setQuizzes(quizzes.map(q => q._id === id ? res.data : q));
      cancelEditQuiz();
    } catch (error) {
      alert("Lỗi cập nhật: " + (error.response?.data?.message || error.message));
    }
  };

  // ===== FLASHCARD =====
  const handleDeleteDeck = async (id, title) => {
    if (!window.confirm(`Bạn chắc chắn muốn xoá Bộ thẻ "${title}" và toàn bộ thẻ bên trong?`)) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/flashcards/${id}`, config);
      setDecks(decks.filter(d => d._id !== id));
    } catch (error) {
      alert("Lỗi xoá: " + (error.response?.data?.message || error.message));
    }
  };

  // ===== ACHIEVEMENT =====
  const handleDeleteAchievement = async (id, name) => {
    if (!window.confirm(`Bạn chắc chắn muốn xoá Huy hiệu "${name}"?`)) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/achievements/${id}`, config);
      setAchievements(achievements.filter(a => a._id !== id));
    } catch (error) {
      alert("Lỗi xoá: " + (error.response?.data?.message || error.message));
    }
  };

  const startEditAchievement = (ach) => {
    setEditingAchId(ach._id);
    setEditAchName(ach.name);
    setEditAchDesc(ach.description);
    setEditAchFile(null);
  };

  const cancelEditAchievement = () => {
    setEditingAchId(null);
    setEditAchName('');
    setEditAchDesc('');
    setEditAchFile(null);
  };

  const handleSaveAchievement = async (id) => {
    try {
      const formData = new FormData();
      formData.append('name', editAchName);
      formData.append('description', editAchDesc);
      if (editAchFile) formData.append('icon', editAchFile);

      const res = await axios.put(`${import.meta.env.VITE_API_URL}/achievements/${id}`, formData, {
        headers: { Authorization: `Bearer ${user.token}`, 'Content-Type': 'multipart/form-data' }
      });
      setAchievements(achievements.map(a => a._id === id ? res.data : a));
      cancelEditAchievement();
    } catch (error) {
      alert("Lỗi cập nhật: " + (error.response?.data?.message || error.message));
    }
  };

  // ===== COURSE =====
  const handleDeleteCourse = async (id, title) => {
    if (!window.confirm(`Bạn chắc chắn muốn xoá Khoá học "${title}"?`)) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/courses/${id}`, config);
      setCourses(courses.filter(c => c._id !== id));
    } catch (error) {
      alert("Lỗi xoá: " + (error.response?.data?.message || error.message));
    }
  };

  const startEditCourse = (course) => {
    setEditingCourseId(course._id);
    setEditCourseTitle(course.title);
    setEditCourseDesc(course.description || '');
  };

  const cancelEditCourse = () => {
    setEditingCourseId(null);
    setEditCourseTitle('');
    setEditCourseDesc('');
  };

  const handleSaveCourse = async (id) => {
    try {
      const res = await axios.put(`${import.meta.env.VITE_API_URL}/courses/${id}`, {
        title: editCourseTitle,
        description: editCourseDesc
      }, config);
      setCourses(courses.map(c => c._id === id ? res.data : c));
      cancelEditCourse();
    } catch (error) {
      alert("Lỗi cập nhật: " + (error.response?.data?.message || error.message));
    }
  };

  const getIconSrc = (iconUrl) => {
    if (!iconUrl) return '';
    if (iconUrl.startsWith('/uploads')) {
      return `${import.meta.env.VITE_API_URL?.replace('/api', '')}${iconUrl}`;
    }
    return iconUrl;
  };

  // ===== Styles =====
  const sectionTitleStyle = { marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' };
  const cardStyle = { padding: '15px 20px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
  const btnEditStyle = { background: 'rgba(59,130,246,0.15)', border: '1px solid #3b82f6', borderRadius: '8px', padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: '#3b82f6', fontSize: '0.85rem', textDecoration: 'none' };
  const btnDeleteStyle = { background: 'rgba(239,68,68,0.15)', border: '1px solid #ef4444', borderRadius: '8px', padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: '#ef4444', fontSize: '0.85rem' };
  const btnSaveStyle = { background: 'rgba(34,197,94,0.15)', border: '1px solid #22c55e', borderRadius: '8px', padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: '#22c55e', fontSize: '0.85rem' };
  const btnCancelStyle = { background: 'rgba(156,163,175,0.15)', border: '1px solid #9ca3af', borderRadius: '8px', padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: '#9ca3af', fontSize: '0.85rem' };
  const editInputStyle = { background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', padding: '8px 12px', color: 'white', width: '100%', marginBottom: '8px', fontSize: '0.9rem' };

  return (
    <div className="container" style={{ marginTop: '40px', marginBottom: '60px' }}>
      <h2 className="title-gradient" style={{ fontSize: '2.5rem', marginBottom: '30px' }}>Trang Tạo Nội Dung học</h2>
      
      {/* Khu vực Tạo mới */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '50px' }}>
        <div className="glass-panel" style={{ padding: '30px', textAlign: 'center' }}>
          <CheckSquare size={48} style={{ color: 'var(--primary-color)', marginBottom: '15px' }} />
          <h3>Tạo Bài Thi Quiz</h3>
          <p style={{ color: 'var(--text-muted)', margin: '10px 0 20px 0' }}>Khởi tạo đề kiểm tra trắc nghiệm và biên soạn ngân hàng câu hỏi.</p>
          <Link to="/admin/quiz-editor" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', textDecoration: 'none' }}>
            <PlusCircle size={18} /> Tạo Quiz Ngay
          </Link>
        </div>

        <div className="glass-panel" style={{ padding: '30px', textAlign: 'center' }}>
          <Layers size={48} style={{ color: 'var(--primary-color)', marginBottom: '15px' }} />
          <h3>Tạo Bộ Flashcard</h3>
          <p style={{ color: 'var(--text-muted)', margin: '10px 0 20px 0' }}>Thiết kế thẻ ghi nhớ, nhập định nghĩa mặt trước và mặt sau.</p>
          <Link to="/admin/flashcard-editor" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', textDecoration: 'none' }}>
            <PlusCircle size={18} /> Soạn Flashcard
          </Link>
        </div>

        <div className="glass-panel" style={{ padding: '30px', textAlign: 'center' }}>
          <BookOpen size={48} style={{ color: '#8b5cf6', marginBottom: '15px' }} />
          <h3>Tạo Lộ Trình Khoá Học</h3>
          <p style={{ color: 'var(--text-muted)', margin: '10px 0 20px 0' }}>Gom nhóm Quizzes và Flashcards thành bộ khoá học (Course) hoàn chỉnh.</p>
          <Link to="/admin/course-editor" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'linear-gradient(45deg, #8b5cf6, #3b82f6)', textDecoration: 'none' }}>
            <PlusCircle size={18} /> Quản Lý Khoá Học
          </Link>
        </div>

        <div className="glass-panel" style={{ padding: '30px', textAlign: 'center' }}>
          <Award size={48} style={{ color: '#fbbf24', marginBottom: '15px' }} />
          <h3>Phát Hành Huy Hiệu</h3>
          <p style={{ color: 'var(--text-muted)', margin: '10px 0 20px 0' }}>Tạo huy hiệu (Achievement) khen thưởng người chơi trên Bảng Xếp Hạng.</p>
          <Link to="/admin/achievement-editor" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'linear-gradient(45deg, #fbbf24, #f59e0b)', textDecoration: 'none', color: '#000', fontWeight: 'bold' }}>
            <PlusCircle size={18} /> Tạo Nhãn Huy Hiệu
          </Link>
        </div>

        <div className="glass-panel" style={{ padding: '30px', textAlign: 'center' }}>
          <Users size={48} style={{ color: '#06b6d4', marginBottom: '15px' }} />
          <h3>Quản Lý Tài Khoản</h3>
          <p style={{ color: 'var(--text-muted)', margin: '10px 0 20px 0' }}>Xem, khoá hoặc xoá tài khoản người dùng trên hệ thống.</p>
          <Link to="/admin/users" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'linear-gradient(45deg, #06b6d4, #0891b2)', textDecoration: 'none' }}>
            <Users size={18} /> Quản Lý Users
          </Link>
        </div>
      </div>
      
      {/* Danh sách Quản lý */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 className="title-gradient" style={{ fontSize: '2rem' }}>Quản Lý Nội Dung Hiện Có</h2>
        <button onClick={fetchData} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', padding: '8px 16px' }}>
          <RefreshCw size={16} /> Làm mới
        </button>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Đang tải danh sách...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
          {/* Cột Quizzes */}
          <div>
            <h3 style={sectionTitleStyle}>
              <CheckSquare size={20} style={{ color: 'var(--primary-color)' }} /> Danh sách Quiz ({quizzes.length})
            </h3>
            {quizzes.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>Chưa có Quiz nào.</p>
            ) : (
              quizzes.map(q => (
                <div key={q._id} className="glass-panel" style={cardStyle}>
                  <div>
                    <p style={{ fontWeight: 'bold', color: 'white' }}>{q.title}</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{q.category || 'Chưa phân loại'}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
                    <Link to={`/admin/quiz/${q._id}/questions`} style={btnEditStyle}>
                      <Edit size={16} /> Sửa câu hỏi
                    </Link>
                    <button onClick={() => handleDeleteQuiz(q._id, q.title)} style={btnDeleteStyle}>
                      <Trash2 size={16} /> Xoá
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {/* Cột Flashcards */}
          <div>
            <h3 style={sectionTitleStyle}>
              <Layers size={20} style={{ color: 'var(--primary-color)' }} /> Danh sách Flashcard ({decks.length})
            </h3>
            {decks.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>Chưa có Bộ thẻ nào.</p>
            ) : (
              decks.map(d => (
                <div key={d._id} className="glass-panel" style={cardStyle}>
                  <div>
                    <p style={{ fontWeight: 'bold', color: 'white' }}>{d.title}</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{d.description || 'Không có mô tả'}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <Link to={`/admin/flashcard-editor/${d._id}`} style={btnEditStyle}>
                      <Edit size={16} /> Sửa
                    </Link>
                    <button onClick={() => handleDeleteDeck(d._id, d.title)} style={btnDeleteStyle}>
                      <Trash2 size={16} /> Xoá
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* ===== Cột Huy Hiệu ===== */}
          <div>
            <h3 style={sectionTitleStyle}>
              <Award size={20} style={{ color: '#fbbf24' }} /> Danh sách Huy Hiệu ({achievements.length})
            </h3>
            {achievements.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>Chưa có Huy hiệu nào.</p>
            ) : (
              achievements.map(ach => (
                <div key={ach._id} className="glass-panel" style={cardStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '45px', height: '45px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0, background: 'rgba(251,191,36,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {ach.iconUrl ? (
                        <img src={getIconSrc(ach.iconUrl)} alt={ach.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <Award size={22} color="#fbbf24" />
                      )}
                    </div>
                    <div>
                      <p style={{ fontWeight: 'bold', color: '#fbbf24' }}>{ach.name}</p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {ach.kpiType === 'streak' ? '🔥' : ach.kpiType === 'exp' ? '⚡' : '📚'} {ach.requiredKpi || '?'} {ach.kpiType || ''} • {ach.earnedByUsers?.length || 0} người đạt
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
                    <Link to={`/admin/achievement/${ach._id}`} style={btnEditStyle}>
                      <Edit size={16} /> Sửa
                    </Link>
                    <button onClick={() => handleDeleteAchievement(ach._id, ach.name)} style={btnDeleteStyle}>
                      <Trash2 size={16} /> Xoá
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* ===== Cột Khoá Học ===== */}
          <div>
            <h3 style={sectionTitleStyle}>
              <BookOpen size={20} style={{ color: '#8b5cf6' }} /> Danh sách Khoá Học ({courses.length})
            </h3>
            {courses.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>Chưa có Khoá học nào.</p>
            ) : (
              courses.map(c => (
                <div key={c._id} className="glass-panel" style={cardStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '45px', height: '45px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0, background: 'rgba(139,92,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <BookOpen size={22} color="#8b5cf6" />
                    </div>
                    <div>
                      <p style={{ fontWeight: 'bold', color: '#8b5cf6' }}>{c.title}</p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {c.description || 'Không có mô tả'} • {c.quizzes?.length || 0} Quiz, {c.flashcardDecks?.length || 0} Flashcard
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
                    <Link to={`/admin/course/${c._id}`} style={btnEditStyle}>
                      <Edit size={16} /> Sửa
                    </Link>
                    <button onClick={() => handleDeleteCourse(c._id, c.title)} style={btnDeleteStyle}>
                      <Trash2 size={16} /> Xoá
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminPanel;
