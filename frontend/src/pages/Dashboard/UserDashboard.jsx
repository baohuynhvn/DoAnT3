import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { History, Star, Award, Trophy } from 'lucide-react';
import axios from 'axios';

const UserDashboard = () => {
  const { user, fetchProfile } = useContext(AuthContext);

  const [attempts, setAttempts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [profileData, setProfileData] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loadingAttempts, setLoadingAttempts] = useState(true);

  useEffect(() => {
    if (fetchProfile) {
      fetchProfile().then(updated => {
        if (updated) setProfileData(updated);
      });
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user) return;
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        
        // Fetch profile mới nhất + attempts + reviews
        const [profileRes, attRes, revRes, achRes, lbRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/users/profile`, config),
          axios.get(`${import.meta.env.VITE_API_URL}/attempts`, config),
          axios.get(`${import.meta.env.VITE_API_URL}/reviews/mine`, config).catch(() => ({ data: [] })),
          axios.get(`${import.meta.env.VITE_API_URL}/achievements`),
          axios.get(`${import.meta.env.VITE_API_URL}/users/leaderboard`).catch(() => ({ data: [] }))
        ]);
        setProfileData({ ...profileRes.data, token: user.token });
        setAttempts(attRes.data);
        setReviews(revRes.data);
        setLeaderboard(lbRes.data);

        // Tự động kiểm tra & cấp danh hiệu
        await axios.post(`${import.meta.env.VITE_API_URL}/achievements/check`, {}, config).catch(() => {});
        // Re-fetch achievements sau khi check
        const achUpdated = await axios.get(`${import.meta.env.VITE_API_URL}/achievements`);
        setAchievements(achUpdated.data);
      } catch (error) {
        console.error("Lỗi lấy lịch sử", error);
      } finally {
        setLoadingAttempts(false);
      }
    };
    fetchData();
  }, [user]);

  if (!user) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Đang tải...</div>;

  // Dùng profileData (mới nhất từ API) nếu có, fallback về user
  const displayUser = profileData || user;

  return (
    <div className="container" style={{ marginTop: '40px', marginBottom: '60px' }}>
      <h2 className="title-gradient" style={{ fontSize: '2.5rem', marginBottom: '30px' }}>Trang Cá Nhân</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        <div className="glass-panel" style={{ padding: '30px' }}>
          <h3>Tổng quan Hồ sơ</h3>
          <p style={{ marginTop: '15px', color: 'var(--text-muted)' }}>Tên: <span style={{ color: 'white' }}>{displayUser.name}</span></p>
          <p style={{ color: 'var(--text-muted)' }}>Email: <span style={{ color: 'white' }}>{displayUser.email}</span></p>
          <p style={{ color: 'var(--text-muted)' }}>Quyền hạn: <span style={{ color: 'var(--primary-color)', fontWeight: 'bold', textTransform: 'capitalize' }}>{displayUser.role}</span></p>
          <p style={{ color: 'var(--text-muted)' }}>Cấp độ: <span style={{ color: 'white', fontWeight: 'bold' }}>{displayUser.level || 1}</span></p>
          {(() => {
            const rank = leaderboard.findIndex(u => u._id === displayUser._id);
            return rank !== -1 ? (
              <p style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                Xếp hạng: <span style={{ color: rank === 0 ? '#fbbf24' : rank === 1 ? '#c0c0c0' : rank === 2 ? '#cd7f32' : '#22c55e', fontWeight: 'bold', fontSize: '1.1rem' }}>
                  {rank === 0 ? '🥇' : rank === 1 ? '🥈' : rank === 2 ? '🥉' : '🏅'} Top {rank + 1}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>/ {leaderboard.length} người</span>
              </p>
            ) : null;
          })()}
          <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <Trophy size={18} color="#fbbf24" />
              <span style={{ color: 'var(--text-muted)' }}>Danh hiệu đạt được: </span>
              <span style={{ color: '#fbbf24', fontWeight: 'bold', fontSize: '1.1rem' }}>{achievements.filter(a => a.earnedByUsers?.some(e => e.userId === displayUser._id)).length}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>/ {achievements.length}</span>
            </div>
            {/* Danh sách huy hiệu đã đạt */}
            {achievements.filter(a => a.earnedByUsers?.some(e => e.userId === displayUser._id)).length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {achievements
                  .filter(a => a.earnedByUsers?.some(e => e.userId === displayUser._id))
                  .map(a => (
                    <div key={a._id} style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      padding: '6px 12px', borderRadius: '20px',
                      background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)',
                      fontSize: '0.85rem'
                    }}>
                      {a.iconUrl ? (
                        <img
                          src={a.iconUrl.startsWith('/uploads') ? `${import.meta.env.VITE_API_URL?.replace('/api', '')}${a.iconUrl}` : a.iconUrl}
                          alt={a.name} style={{ width: '20px', height: '20px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                      ) : (
                        <Award size={14} color="#fbbf24" />
                      )}
                      <span style={{ color: '#fbbf24', fontWeight: '500' }}>{a.name}</span>
                    </div>
                  ))
                }
              </div>
            )}
          </div>
        </div>
        
        <div className="glass-panel" style={{ padding: '30px' }}>
          <h3>Thống kê Học tập</h3>
          <p style={{ marginTop: '15px', color: 'var(--text-muted)' }}>Điểm EXP (Kinh nghiệm): <span style={{ color: '#fbbf24', fontWeight: 'bold' }}>{displayUser.exp || 0}</span></p>
          <p style={{ color: 'var(--text-muted)' }}>Số bài đã hoàn thành: <span style={{ color: '#ef4444', fontWeight: 'bold' }}>{displayUser.streak || 0} bài</span> 📝</p>
        </div>
        <div className="glass-panel" style={{ padding: '30px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><History size={20} color="#3b82f6" /> Lịch sử luyện thi (QuizAttempt)</h3>
          
          <div style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '235px', overflowY: 'auto', paddingRight: '10px' }}>
            {loadingAttempts ? (
              <p style={{ color: 'var(--text-muted)' }}>Đang tải lịch sử...</p>
            ) : attempts.length === 0 ? (
              <div style={{ background: 'rgba(59,130,246,0.1)', padding: '15px', borderRadius: '8px', border: '1px solid rgba(59,130,246,0.3)' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Bạn chưa hoàn thành bài thi nào. Nộp bài ngay để ghi nhận vào Model QuizAttempt.</p>
              </div>
            ) : (
               attempts.slice().reverse().map(att => (
                 <div key={att._id} style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', borderLeft: '4px solid #3b82f6' }}>
                   <p style={{ fontWeight: 'bold' }}>{att.quizId?.title || 'Bài thi đã xoá'}</p>
                   <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '5px' }}>
                     <span>Điểm số: <strong style={{ color: 'white' }}>{att.score}/{att.totalQuestions}</strong></span>
                     <span>Thời gian làm: <strong>{att.timeSpent}s</strong></span>
                   </div>
                 </div>
               ))
            )}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '30px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Star size={20} color="#fbbf24" /> Lịch sử Đánh giá (Review)</h3>
          
          <div style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '235px', overflowY: 'auto', paddingRight: '10px' }}>
            {loadingAttempts ? (
              <p style={{ color: 'var(--text-muted)' }}>Đang tải lịch sử...</p>
            ) : reviews.length === 0 ? (
              <div style={{ background: 'rgba(251, 191, 36, 0.1)', padding: '15px', borderRadius: '8px', border: '1px solid rgba(251, 191, 36, 0.3)' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Bạn chưa viết đánh giá nào. Tham gia Khoá học (Course) hoặc thi Quiz để có thể cập nhật nhận xét!</p>
              </div>
            ) : (
               reviews.slice().reverse().map(rev => (
                 <div key={rev._id} style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', borderLeft: '4px solid #fbbf24' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                     <strong style={{ color: '#fbbf24' }}>{rev.targetType}</strong>
                     <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{rev.rating} sao</span>
                   </div>
                   <p style={{ color: 'white', fontSize: '0.9rem', fontStyle: 'italic' }}>"{rev.comment}"</p>
                 </div>
               ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default UserDashboard;
