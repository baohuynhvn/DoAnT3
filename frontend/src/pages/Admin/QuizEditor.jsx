import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { PlusCircle, List, Check } from 'lucide-react';

const QuizEditor = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [quizId, setQuizId] = useState(null);
  
  // Thông tin Quiz
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General');

  // Thông tin Câu hỏi
  const [content, setContent] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [addedQuestions, setAddedQuestions] = useState([]);


  if (!user) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Vui lòng đăng nhập để tiếp tục.</div>;

  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/quizzes`, { title, description, category }, config);
      setQuizId(data._id);
      setStep(2);
    } catch (error) {
      alert("Lỗi tạo Quiz: " + (error.response?.data?.message || error.message));
    }
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    if (!options.includes(correctAnswer)) {
      return alert("Đáp án đúng phải khớp với một trong 4 lựa chọn!");
    }
    
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const payload = { content, options, correctAnswer };
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/quizzes/${quizId}/questions`, payload, config);
      
      setAddedQuestions([...addedQuestions, data]);
      // Reset form câu hỏi
      setContent('');
      setOptions(['', '', '', '']);
      setCorrectAnswer('');
    } catch (error) {
       alert("Lỗi tạo Câu hỏi: " + (error.response?.data?.message || error.message));
    }
  };



  const finishQuiz = () => {
    alert("Khởi tạo bộ Quiz thành công!");
    navigate('/admin');
  };

  return (
    <div className="container" style={{ marginTop: '40px', marginBottom: '80px', maxWidth: '800px' }}>
      <h2 className="title-gradient" style={{ fontSize: '2.5rem', marginBottom: '30px' }}>
        {step === 1 ? 'Khởi Tạo Quiz Mới' : 'Thêm Câu Hỏi Vào Quiz'}
      </h2>

      {step === 1 && (
        <form className="glass-panel" onSubmit={handleCreateQuiz} style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>Tiêu đề Quiz</label>
            <input type="text" className="input-field" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="VD: Kiểm tra kiến thức Node.js" />
          </div>
          <div>
            <label style={{ color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>Mô tả ngắn</label>
            <textarea className="input-field" value={description} onChange={(e) => setDescription(e.target.value)} rows="3" placeholder="Nhập mô tả chi tiết bài thi" />
          </div>
          <div>
            <label style={{ color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>Chủ đề (Category)</label>
            <input type="text" className="input-field" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="VD: Lập trình, Tiếng Anh..." />
          </div>
          <button type="submit" className="btn-primary" style={{ marginTop: '10px' }}>Tạo Bộ Câu Hỏi (Tiếp theo)</button>
        </form>
      )}

      {step === 2 && (
        <div>
          <div className="glass-panel" style={{ padding: '20px', marginBottom: '20px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981' }}>
            <h3 style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '10px' }}><Check size={20} /> Đã lưu Quiz: {title}</h3>
            <p style={{ color: 'var(--text-muted)', marginTop: '5px' }}>Đang có: {addedQuestions.length} câu hỏi</p>
          </div>

          <form className="glass-panel" onSubmit={handleAddQuestion} style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>Nội dung câu hỏi</label>
              <textarea className="input-field" value={content} onChange={(e) => setContent(e.target.value)} required rows="2" placeholder="VD: Mệnh đề nào sau đây biểu diễn chu trình sống của React?" />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '15px' }}>
              {options.map((opt, idx) => (
                <div key={idx}>
                  <label style={{ color: 'var(--text-muted)', marginBottom: '5px', display: 'block', fontSize: '0.9rem' }}>Lựa chọn {idx + 1}</label>
                  <input type="text" className="input-field" value={opt} onChange={(e) => {
                    const newOpts = [...options];
                    newOpts[idx] = e.target.value;
                    setOptions(newOpts);
                  }} required />
                </div>
              ))}
            </div>

            <div>
              <label style={{ color: 'var(--text-muted)', marginBottom: '8px', display: 'block', fontWeight: 'bold' }}>Chỉ định lại TRÍNH XÁC đáp án đúng (copy nội dung 1 trong 4 lựa chọn phía trên)</label>
              <input type="text" className="input-field" value={correctAnswer} onChange={(e) => setCorrectAnswer(e.target.value)} required style={{ border: '1px solid #10b981' }} />
            </div>
            
            <button type="submit" className="btn-primary" style={{ marginTop: '10px', background: 'var(--secondary-color)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
              <PlusCircle size={18} /> Thêm Câu Hỏi Này
            </button>
          </form>

          {addedQuestions.length > 0 && (
             <div style={{ marginTop: '40px', textAlign: 'center' }}>
                <button onClick={finishQuiz} className="btn-primary" style={{ padding: '15px 40px', fontSize: '1.2rem', background: '#10b981' }}>
                  Lưu Bài Giảng & Hoàn Tất
                </button>
             </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuizEditor;
