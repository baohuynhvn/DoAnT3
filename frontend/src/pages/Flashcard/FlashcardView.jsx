import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Volume2 } from 'lucide-react';

const FlashcardView = () => {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [deckData, setDeckData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentCardIdx, setCurrentCardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    const fetchDeckData = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/flashcards/${deckId}`);
        setDeckData(data);
      } catch (error) {
        console.error("Lỗi khi tải thẻ:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDeckData();
  }, [deckId]);

  // Load danh sách giọng đọc trước để tránh lỗi mảng rỗng lần đầu click
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, []);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const speak = (text, lang, e) => {
    e.stopPropagation();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      
      const voices = window.speechSynthesis.getVoices();
      let selectedVoice;
      if (lang === 'vi-VN') {
         selectedVoice = voices.find(v => v.lang.includes('vi') || v.lang.includes('VI'));
      } else {
         selectedVoice = voices.find(v => v.lang.includes('en-US') || v.lang.includes('en_US') || v.lang.includes('en'));
      }
      
      if (selectedVoice) {
         utterance.voice = selectedVoice;
      }

      utterance.rate = 0.85;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Trình duyệt của bạn không hỗ trợ phát âm.");
    }
  };

  const markProgress = async (isRemembered) => {
    if(!user) {
        alert('Bạn cần đăng nhập để hệ thống lưu lại quá trình học của mình!');
        handleNextCard();
        return;
    }
    
    try {
      const card = deckData.cards[currentCardIdx];
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`${import.meta.env.VITE_API_URL}/flashcards/cards/${card._id}/progress`, { isRemembered }, config);
      handleNextCard();
    } catch (error) {
      console.error("Lỗi khi lưu tiến độ:", error);
    }
  };

  const handleNextCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      if (currentCardIdx < deckData.cards.length - 1) {
        setCurrentCardIdx(prev => prev + 1);
      } else {
        alert("🎉 Chúc mừng! Bạn đã hoàn thành bộ thẻ này.");
        navigate('/flashcards');
      }
    }, 400);
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Đang tải bộ Flashcards...</div>;
  if (!deckData || !deckData.cards.length) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Bộ bài này chưa có thẻ nào.</div>;

  const currentCard = deckData.cards[currentCardIdx];
  if (!currentCard) return <div style={{ textAlign: 'center', marginTop: '50px' }}>🎉 Đã hoàn thành bộ thẻ!</div>;

  return (
    <div className="container" style={{ marginTop: '40px', marginBottom: '60px', maxWidth: '800px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h2 className="title-gradient" style={{ marginBottom: '10px' }}>{deckData.deck.title}</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '40px' }}>Thẻ số {currentCardIdx + 1} / {deckData.cards.length}</p>

      {/* Container Hiệu ứng 3D */}
      <div 
        style={{ 
          width: '100%', 
          maxWidth: '500px', 
          height: '300px', 
          perspective: '1000px',
          cursor: 'pointer'
        }}
        onClick={handleFlip}
      >
        <div 
          style={{
            width: '100%',
            height: '100%',
            position: 'relative',
            transition: 'transform 0.6s cubic-bezier(0.4, 0.2, 0.2, 1)',
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
          }}
        >
          {/* Mặt trước thẻ */}
          <div className="glass-panel" style={{
            position: 'absolute', width: '100%', height: '100%',
            backfaceVisibility: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.8rem', padding: '20px', textAlign: 'center', color: 'white', fontWeight: '500'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
              {currentCard.front}
              <button 
                onClick={(e) => speak(currentCard.front, 'en-US', e)} 
                style={{ background: 'rgba(99,102,241,0.2)', border: '1px solid var(--primary-color)', borderRadius: '50%', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                title="Nghe phát âm"
              >
                <Volume2 size={22} style={{ color: 'var(--primary-color)' }} />
              </button>
            </div>
          </div>
          
          {/* Mặt sau thẻ */}
          <div className="glass-panel" style={{
            position: 'absolute', width: '100%', height: '100%',
            backfaceVisibility: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.8rem', padding: '20px', textAlign: 'center', fontWeight: '500',
            transform: 'rotateY(180deg)', background: 'rgba(99, 102, 241, 0.15)', border: '2px solid var(--primary-color)'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
              {currentCard.back}
              <button 
                onClick={(e) => speak(currentCard.back, 'vi-VN', e)} 
                style={{ background: 'rgba(99,102,241,0.2)', border: '1px solid var(--primary-color)', borderRadius: '50%', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                title="Nghe phát âm"
              >
                <Volume2 size={22} style={{ color: 'var(--primary-color)' }} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <p style={{ marginTop: '20px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Bấm vào Thẻ để lật xem mặt sau | 🔊 Bấm loa để nghe phát âm</p>

      {/* Button Đánh Giá Học Tập */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}>
        <button 
          onClick={(e) => { e.stopPropagation(); markProgress(true); }}
          className="btn-primary" 
          style={{ background: '#10b981', color: 'white', width: '150px', border: 'none' }}
        >
          Tiếp tục ⏭
        </button>
      </div>

    </div>
  );
};
export default FlashcardView;
