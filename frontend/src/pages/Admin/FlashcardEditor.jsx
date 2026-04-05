import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { PlusCircle, Check, Trash2 } from 'lucide-react';

const FlashcardEditor = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { paramDeckId } = useParams();
  
  const [step, setStep] = useState(1);
  const [deckId, setDeckId] = useState(null);
  
  // Thông tin Bộ thẻ
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // Thông tin Thẻ con
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [addedCards, setAddedCards] = useState([]);

  React.useEffect(() => {
    if (paramDeckId) {
      const fetchDeck = async () => {
        try {
          const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/flashcards/${paramDeckId}`);
          setTitle(data.deck.title);
          setDescription(data.deck.description);
          setDeckId(data.deck._id);
          setAddedCards(data.cards);
          setStep(2);
        } catch (error) {
          console.error("Lỗi tải thông tin bộ thẻ:", error);
        }
      };
      fetchDeck();
    }
  }, [paramDeckId]);

  if (!user) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Vui lòng đăng nhập để tiếp tục.</div>;

  const handleCreateDeck = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/flashcards`, { title, description }, config);
      setDeckId(data._id);
      setStep(2);
    } catch (error) {
      alert("Lỗi tạo Flashcard Deck: " + (error.response?.data?.message || error.message));
    }
  };

  const handleAddCard = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/flashcards/${deckId}/cards`, { front, back }, config);
      
      setAddedCards([...addedCards, data]);
      setFront('');
      setBack('');
    } catch (error) {
       alert("Lỗi thêm thẻ Flashcard: " + (error.response?.data?.message || error.message));
    }
  };



  const finishDeck = () => {
    alert("Khởi tạo bộ thẻ Flashcard thành công!");
    navigate('/admin');
  };

  const handleDeleteCard = async (cardId) => {
    if (!window.confirm("Bạn có chắc muốn xoá thẻ này?")) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.delete(`${import.meta.env.VITE_API_URL}/flashcards/cards/${cardId}`, config);
      setAddedCards(addedCards.filter(c => c._id !== cardId));
    } catch (error) {
      alert("Lỗi xoá thẻ: " + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="container" style={{ marginTop: '40px', marginBottom: '80px', maxWidth: '800px' }}>
      <h2 className="title-gradient" style={{ fontSize: '2.5rem', marginBottom: '30px' }}>
        {step === 1 ? 'Khởi Tạo Bộ Thẻ Flashcard Mới' : 'Thêm Các Thẻ (Cards)'}
      </h2>

      {step === 1 && (
        <form className="glass-panel" onSubmit={handleCreateDeck} style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>Tiên Bộ Thẻ</label>
            <input type="text" className="input-field" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="VD: 500 Từ vựng IELTS phổ biến" />
          </div>
          <div>
            <label style={{ color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>Mô tả ngắn</label>
            <textarea className="input-field" value={description} onChange={(e) => setDescription(e.target.value)} rows="3" placeholder="Ví dụ về ngữ cảnh sử dụng..." />
          </div>
          <button type="submit" className="btn-primary" style={{ marginTop: '10px' }}>Tạo Bộ Thẻ (Tiếp theo)</button>
        </form>
      )}

      {step === 2 && (
        <div>
          <div className="glass-panel" style={{ padding: '20px', marginBottom: '20px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981' }}>
            <h3 style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '10px' }}><Check size={20} /> Đã tạo Bộ thẻ: {title}</h3>
            <p style={{ color: 'var(--text-muted)', marginTop: '5px' }}>Số thẻ hiện tại: {addedCards.length} thẻ</p>
          </div>

          <form className="glass-panel" onSubmit={handleAddCard} style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ color: 'var(--text-muted)', marginBottom: '8px', display: 'block', fontWeight: 'bold' }}>Mặt Trước (Front)</label>
              <textarea className="input-field" value={front} onChange={(e) => setFront(e.target.value)} required rows="2" placeholder="VD: Apple" />
            </div>
            
            <div>
              <label style={{ color: 'var(--text-muted)', marginBottom: '8px', display: 'block', fontWeight: 'bold' }}>Mặt Sau (Back - Định nghĩa)</label>
              <textarea className="input-field" value={back} onChange={(e) => setBack(e.target.value)} required rows="3" placeholder="Mở rộng ý / Kết quả dịch..." style={{ border: '1px solid var(--primary-color)' }} />
            </div>
            
            <button type="submit" className="btn-primary" style={{ marginTop: '10px', background: 'var(--secondary-color)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
              <PlusCircle size={18} /> Thêm Thẻ Này Vào Bộ
            </button>
          </form>

          {addedCards.length > 0 && (
            <div style={{ marginTop: '30px' }}>
              <h3 style={{ color: 'var(--text-muted)', marginBottom: '15px' }}>Các thẻ hiện có:</h3>
              <div style={{ display: 'grid', gap: '10px' }}>
                {addedCards.map((c, idx) => (
                  <div key={idx} className="glass-panel" style={{ padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p><strong>Mặt trước:</strong> {c.front}</p>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '5px' }}><strong>Mặt sau:</strong> {c.back}</p>
                    </div>
                    {c._id && (
                      <button onClick={() => handleDeleteCard(c._id)} style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid #ef4444', borderRadius: '8px', padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: '#ef4444' }}>
                        <Trash2 size={16} /> Xoá
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {addedCards.length > 0 && (
             <div style={{ marginTop: '40px', textAlign: 'center' }}>
                <button onClick={finishDeck} className="btn-primary" style={{ padding: '15px 40px', fontSize: '1.2rem', background: '#10b981' }}>
                  Lưu & Hoàn Tất Bộ Thẻ
                </button>
             </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FlashcardEditor;
