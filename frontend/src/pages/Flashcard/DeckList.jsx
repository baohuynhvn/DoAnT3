import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';

const DeckList = () => {
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchDecks = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/flashcards`);
        setDecks(data);
      } catch (error) {
        console.error("Lỗi khi tải bộ bài Flashcards:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDecks();
  }, []);

  const filtered = decks.filter(d =>
    (d.title && d.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (d.description && d.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Đang tải thư viện thẻ...</div>;

  return (
    <div className="container" style={{ marginTop: '40px', marginBottom: '60px' }}>
      <h2 className="title-gradient" style={{ fontSize: '2.5rem', marginBottom: '20px' }}>Thư Viện Flashcards</h2>
      
      {/* Thanh tìm kiếm */}
      <div style={{ position: 'relative', marginBottom: '30px', maxWidth: '500px' }}>
        <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input 
          type="text" 
          className="input-field" 
          placeholder="Tìm kiếm bộ thẻ..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ paddingLeft: '42px' }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {filtered.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>{searchTerm ? 'Không tìm thấy bộ thẻ phù hợp.' : 'Chưa có bộ thẻ Flashcard nào.'}</p>
        ) : (
          filtered.map((deck) => (
            <div key={deck._id} className="glass-panel" style={{ padding: '25px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <h3 style={{ fontSize: '1.2rem', color: 'white' }}>{deck.title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', flex: 1 }}>{deck.description || "Không có mô tả chi tiết."}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                <Link to={`/flashcards/${deck._id}`} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.9rem', textDecoration: 'none', width: '100%', textAlign: 'center', background: 'var(--secondary-color)' }}>
                  Học Ngay
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
export default DeckList;
