import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { BookOpen, LogIn, LogOut, User, CheckSquare, Layers, PenTool, Trophy } from 'lucide-react';

const Header = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <header className="glass-panel" style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      padding: '15px 30px', 
      margin: '20px auto', 
      maxWidth: '1200px', 
      width: 'calc(100% - 40px)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'white', fontWeight: 'bold', fontSize: '1.2rem' }}>
          <BookOpen className="icon" style={{ color: 'var(--primary-color)' }} /> Góc Học Tập
        </Link>
        <nav style={{ display: 'flex', gap: '20px' }}>
          <Link to="/courses" style={{ color: '#8b5cf6', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold' }}>
            <BookOpen size={16} /> Lộ Trình
          </Link>
          <Link to="/quizzes" style={{ color: 'var(--text-light)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <CheckSquare size={16} /> Trắc Nghiệm
          </Link>
          <Link to="/flashcards" style={{ color: 'var(--text-light)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Layers size={16} /> Thẻ Ghi Nhớ
          </Link>
          <Link to="/leaderboard" style={{ color: '#fbbf24', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Trophy size={16} /> Xếp Hạng
          </Link>
          {user && user.role === 'admin' && (
            <Link to="/admin" style={{ color: '#fbbf24', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px' }}>
               <PenTool size={16} /> Soạn Bài
            </Link>
          )}
        </nav>
      </div>

      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        {user ? (
          <>
            <Link to="/dashboard" style={{ textDecoration: 'none', color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <User size={18} style={{ color: 'var(--primary-color)'}} /> <span style={{ fontWeight: '500' }}>{user.name}</span>
            </Link>
            <button onClick={logout} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', padding: '8px 16px' }}>
              <LogOut size={16} /> Đăng xuất
            </button>
          </>
        ) : (
          <Link to="/login" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', padding: '8px 20px' }}>
            <LogIn size={16} /> Đăng nhập
          </Link>
        )}
      </div>
    </header>
  );
};
export default Header;
