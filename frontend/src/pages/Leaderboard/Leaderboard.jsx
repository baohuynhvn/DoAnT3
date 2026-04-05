import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { Trophy, Medal, Star, Award, X, Target, Zap, BookOpen, TrendingUp } from 'lucide-react';

const Leaderboard = () => {
  const [leaders, setLeaders] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAch, setSelectedAch] = useState(null);
  const { user: currentUser } = useContext(AuthContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [lbRes, achRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/users/leaderboard`),
          axios.get(`${import.meta.env.VITE_API_URL}/achievements`)
        ]);
        setLeaders(lbRes.data);
        setAchievements(achRes.data);
      } catch (error) {
        console.error("Lỗi lấy dữ liệu Leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getRankIcon = (index) => {
    if (index === 0) return <Trophy size={24} style={{ color: '#fbbf24' }} />;
    if (index === 1) return <Medal size={24} style={{ color: '#94a3b8' }} />;
    if (index === 2) return <Award size={24} style={{ color: '#cd7f32' }} />;
    return <span style={{ color: 'var(--text-muted)', fontWeight: 'bold', width: '24px', textAlign: 'center', display: 'inline-block' }}>{index + 1}</span>;
  };

  const getIconSrc = (iconUrl) => {
    if (!iconUrl) return '';
    if (iconUrl.startsWith('/uploads')) {
      return `${import.meta.env.VITE_API_URL?.replace('/api', '')}${iconUrl}`;
    }
    return iconUrl;
  };

  const getKpiLabel = (kpiType, requiredKpi) => {
    switch(kpiType) {
      case 'streak': return `${requiredKpi || '?'} lần nộp bài liên tiếp (Streak)`;
      case 'exp': return `Đạt ${requiredKpi || '?'} điểm EXP`;
      case 'courses_completed': return `Hoàn thành ${requiredKpi || '?'} khoá học`;
      default: return requiredKpi || 'Không xác định';
    }
  };

  const getKpiIcon = (kpiType) => {
    switch(kpiType) {
      case 'streak': return <TrendingUp size={20} color="#f59e0b" />;
      case 'exp': return <Zap size={20} color="#8b5cf6" />;
      case 'courses_completed': return <BookOpen size={20} color="#3b82f6" />;
      default: return <Target size={20} color="#10b981" />;
    }
  };

  const getKpiColor = (kpiType) => {
    switch(kpiType) {
      case 'streak': return { text: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)' };
      case 'exp': return { text: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.3)' };
      case 'courses_completed': return { text: '#3b82f6', bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.3)' };
      default: return { text: '#10b981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)' };
    }
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Đang tải bảng xếp hạng...</div>;

  return (
    <div className="container" style={{ marginTop: '40px', marginBottom: '60px', maxWidth: '1000px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h2 className="title-gradient" style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🏆 Bảng Xếp Hạng</h2>
        <p style={{ color: 'var(--text-muted)' }}>Top học viên có điểm kinh nghiệm (EXP) cao nhất hệ thống</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px', alignItems: 'start' }}>
        
        {/* Cột Trái: Bảng Xếp Hạng */}
        <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '20px', background: 'rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', color: 'var(--text-muted)' }}>
            <span>Thứ hạng</span>
            <span style={{ flex: 1, marginLeft: '40px' }}>Học viên</span>
            <span>EXP</span>
          </div>
          
          <div className="leaderboard-scroll" style={{ maxHeight: '560px', overflowY: 'auto' }}>
          {leaders.length === 0 ? (
            <p style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>Chưa có dữ liệu xếp hạng.</p>
          ) : (
            leaders.map((user, index) => (
              <div key={user._id} style={{ 
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                padding: '20px', borderTop: '1px solid var(--glass-border)',
                background: index === 0 ? 'rgba(251, 191, 36, 0.1)' : index === 1 ? 'rgba(156, 163, 175, 0.1)' : index === 2 ? 'rgba(180, 83, 9, 0.1)' : 'transparent'
              }}>
                <div style={{ width: '40px', display: 'flex', justifyContent: 'center' }}>
                  {getRankIcon(index)}
                </div>
                <div style={{ flex: 1, marginLeft: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p style={{ fontWeight: 'bold', color: 'white', fontSize: '1.1rem' }}>{user.name}</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Chuỗi bài thi (Streak): {user.streak || 0}</p>
                  </div>
                </div>
                <div style={{ fontWeight: 'bold', color: '#fbbf24', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Star size={18} /> {user.exp || 0}
                </div>
              </div>
            ))
          )}
          </div>
        </div>

        {/* Cột Phải: Bộ sưu tập Huy Hiệu */}
        <div className="glass-panel" style={{ padding: '25px' }}>
          <h3 style={{ color: '#fbbf24', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.3rem' }}>
            <Award size={24} /> Bí kíp Huy Hiệu
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '20px', lineHeight: '1.5' }}>
            Nhấn vào huy hiệu để xem chi tiết điều kiện đạt được!
          </p>
          
          <div className="achievement-scroll" style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxHeight: '430px', overflowY: 'auto', paddingRight: '5px' }}>
            {achievements.length === 0 ? (
              <p style={{ color: 'var(--text-light)', fontStyle: 'italic' }}>Quản trị viên chưa cập nhật danh hiệu nào.</p>
            ) : (
              achievements.map((ach) => (
                <div
                  key={ach._id}
                  onClick={() => setSelectedAch(ach)}
                  style={{
                    display: 'flex', gap: '15px', alignItems: 'center', padding: '15px',
                    background: 'rgba(255,255,255,0.05)', borderRadius: '12px',
                    border: '1px solid rgba(251, 191, 36, 0.3)',
                    cursor: 'pointer', transition: 'all 0.25s ease',
                    position: 'relative'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = 'rgba(251,191,36,0.1)';
                    e.currentTarget.style.borderColor = 'rgba(251,191,36,0.6)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(251,191,36,0.15)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                    e.currentTarget.style.borderColor = 'rgba(251,191,36,0.3)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ width: '50px', height: '50px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {ach.iconUrl ? (
                      <img src={getIconSrc(ach.iconUrl)} alt={ach.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <Award size={28} color="#fbbf24" />
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ color: '#fbbf24', fontSize: '1.05rem', marginBottom: '4px' }}>{ach.name}</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Nhấn để xem điều kiện →</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* ========== MODAL Chi tiết Huy hiệu ========== */}
      {selectedAch && (
        <div
          onClick={() => setSelectedAch(null)}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999,
            animation: 'fadeIn 0.2s ease'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'linear-gradient(145deg, rgba(30,30,50,0.98), rgba(20,20,35,0.98))',
              border: '1px solid rgba(251,191,36,0.3)',
              borderRadius: '24px',
              padding: '0',
              maxWidth: '420px',
              width: '90%',
              overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(251,191,36,0.1)',
              animation: 'slideUp 0.3s ease'
            }}
          >
            {/* Header với gradient */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(251,191,36,0.2), rgba(245,158,11,0.1))',
              padding: '30px', textAlign: 'center',
              borderBottom: '1px solid rgba(251,191,36,0.15)',
              position: 'relative'
            }}>
              <button
                onClick={() => setSelectedAch(null)}
                style={{
                  position: 'absolute', top: '15px', right: '15px',
                  background: 'rgba(255,255,255,0.1)', border: 'none',
                  borderRadius: '50%', width: '32px', height: '32px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.3)'; }}
                onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
              >
                <X size={18} color="white" />
              </button>

              {/* Icon lớn */}
              <div style={{
                width: '100px', height: '100px', borderRadius: '50%',
                background: 'rgba(251,191,36,0.15)',
                border: '3px solid #fbbf24',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden', margin: '0 auto 15px auto',
                boxShadow: '0 0 30px rgba(251,191,36,0.2)'
              }}>
                {selectedAch.iconUrl ? (
                  <img src={getIconSrc(selectedAch.iconUrl)} alt={selectedAch.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <Award size={48} color="#fbbf24" />
                )}
              </div>

              <h3 style={{ color: '#fbbf24', fontSize: '1.4rem', margin: 0 }}>{selectedAch.name}</h3>
            </div>

            {/* Body */}
            <div style={{ padding: '25px' }}>
              {/* Mô tả */}
              <div style={{ marginBottom: '20px' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>📜 Thông điệp</p>
                <p style={{ color: 'white', fontSize: '1rem', lineHeight: '1.6', fontStyle: 'italic' }}>
                  "{selectedAch.description}"
                </p>
              </div>

              {/* Điều kiện đạt được */}
              <div style={{
                background: getKpiColor(selectedAch.kpiType).bg,
                border: `1px solid ${getKpiColor(selectedAch.kpiType).border}`,
                borderRadius: '14px',
                padding: '18px',
                marginBottom: '15px'
              }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>🎯 Điều kiện đạt được</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '42px', height: '42px', borderRadius: '12px',
                    background: getKpiColor(selectedAch.kpiType).bg,
                    border: `1px solid ${getKpiColor(selectedAch.kpiType).border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {getKpiIcon(selectedAch.kpiType)}
                  </div>
                  <div>
                    <p style={{ color: getKpiColor(selectedAch.kpiType).text, fontWeight: 'bold', fontSize: '1.05rem' }}>
                      {getKpiLabel(selectedAch.kpiType, selectedAch.requiredKpi)}
                    </p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '2px' }}>
                      Loại: {selectedAch.kpiType === 'streak' ? 'Chuỗi bài làm' : selectedAch.kpiType === 'exp' ? 'Điểm kinh nghiệm' : selectedAch.kpiType === 'courses_completed' ? 'Khoá học hoàn thành' : 'Khác'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Chỉ số KPI */}
              <div style={{
                display: 'flex', justifyContent: 'center', gap: '20px',
                padding: '15px', background: 'rgba(255,255,255,0.03)',
                borderRadius: '12px'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ color: '#fbbf24', fontSize: '1.8rem', fontWeight: 'bold', margin: 0 }}>{selectedAch.requiredKpi || '?'}</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Chỉ số cần đạt</p>
                </div>
                <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ color: '#22c55e', fontSize: '1.8rem', fontWeight: 'bold', margin: 0 }}>{selectedAch.earnedByUsers?.length || 0}</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Người đã đạt</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSS Animation */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0 }
          to { opacity: 1 }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px) scale(0.95) }
          to { opacity: 1; transform: translateY(0) scale(1) }
        }
        .leaderboard-scroll::-webkit-scrollbar,
        .achievement-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .leaderboard-scroll::-webkit-scrollbar-track,
        .achievement-scroll::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.05);
          border-radius: 3px;
        }
        .leaderboard-scroll::-webkit-scrollbar-thumb,
        .achievement-scroll::-webkit-scrollbar-thumb {
          background: rgba(251,191,36,0.3);
          border-radius: 3px;
        }
        .leaderboard-scroll::-webkit-scrollbar-thumb:hover,
        .achievement-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(251,191,36,0.5);
        }
      `}</style>
    </div>
  );
};

export default Leaderboard;
