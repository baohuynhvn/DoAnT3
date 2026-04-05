import React, { useContext, useState, useEffect, useCallback } from 'react';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import { Users, Search, Lock, Unlock, Trash2, RefreshCw, Shield, ShieldOff, Mail, Calendar, Zap, Flame, ArrowLeft, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';

const UserManager = () => {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState(null);

  const config = user ? { headers: { Authorization: `Bearer ${user.token}` } } : {};

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (roleFilter !== 'all') params.append('role', roleFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/users/admin/all?${params.toString()}`,
        config
      );
      setUsers(data);
    } catch (err) {
      console.error(err);
      alert('Lỗi tải danh sách: ' + (err.response?.data?.message || err.message));
    }
    setLoading(false);
  }, [searchTerm, roleFilter, statusFilter]);

  useEffect(() => {
    if (user) fetchUsers();
  }, [user, roleFilter, statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleToggleLock = async (userId, userName, isLocked) => {
    const action = isLocked ? 'mở khoá' : 'khoá';
    if (!window.confirm(`Bạn chắc chắn muốn ${action} tài khoản "${userName}"?`)) return;
    setActionLoading(userId);
    try {
      const { data } = await axios.put(
        `${import.meta.env.VITE_API_URL}/users/admin/${userId}/toggle-lock`,
        {},
        config
      );
      setUsers(users.map(u => u._id === userId ? data : u));
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
    setActionLoading(null);
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`⚠️ Bạn chắc chắn muốn XOÁ VĨNH VIỄN tài khoản "${userName}"?\n\nToàn bộ dữ liệu (lịch sử thi, đánh giá...) sẽ bị xoá và KHÔNG THỂ KHÔI PHỤC!`)) return;
    setActionLoading(userId);
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/users/admin/${userId}`,
        config
      );
      setUsers(users.filter(u => u._id !== userId));
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
    setActionLoading(null);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  // Styles
  const pageStyle = { marginTop: '40px', marginBottom: '60px' };
  const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' };
  const searchBarStyle = { display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '20px' };
  const searchInputStyle = {
    background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '12px', padding: '10px 16px', color: 'white', fontSize: '0.95rem',
    outline: 'none', flex: '1', minWidth: '250px', fontFamily: "'Inter', sans-serif",
    transition: 'border-color 0.3s'
  };
  const filterSelectStyle = {
    background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '12px', padding: '10px 14px', color: 'white', fontSize: '0.85rem',
    outline: 'none', cursor: 'pointer', fontFamily: "'Inter', sans-serif"
  };
  const statCardStyle = {
    padding: '20px', borderRadius: '16px', textAlign: 'center', flex: '1', minWidth: '150px'
  };
  const tableWrapperStyle = {
    overflowX: 'auto', borderRadius: '16px'
  };
  const tableStyle = {
    width: '100%', borderCollapse: 'separate', borderSpacing: '0'
  };
  const thStyle = {
    padding: '14px 16px', textAlign: 'left', fontWeight: '600', fontSize: '0.85rem',
    color: 'var(--text-muted)', borderBottom: '1px solid rgba(255,255,255,0.1)',
    position: 'sticky', top: 0, background: 'rgba(15,23,42,0.95)', zIndex: 1,
    textTransform: 'uppercase', letterSpacing: '0.05em'
  };
  const tdStyle = {
    padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', verticalAlign: 'middle'
  };
  const btnActionStyle = (color) => ({
    background: `rgba(${color},0.12)`, border: `1px solid rgba(${color},0.5)`,
    borderRadius: '8px', padding: '7px 12px', cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', gap: '5px',
    fontSize: '0.8rem', fontWeight: '500', transition: 'all 0.2s',
    fontFamily: "'Inter', sans-serif"
  });
  const badgeStyle = (bg, color) => ({
    display: 'inline-flex', alignItems: 'center', gap: '4px',
    padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem',
    fontWeight: '600', background: bg, color: color
  });

  // Stats
  const totalUsers = users.length;
  const activeUsers = users.filter(u => !u.isLocked).length;
  const lockedUsers = users.filter(u => u.isLocked).length;
  const adminCount = users.filter(u => u.role === 'admin').length;

  if (!user) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Đang tải...</div>;

  return (
    <div className="container" style={pageStyle}>
      {/* Back link */}
      <Link to="/admin" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', textDecoration: 'none', marginBottom: '20px', fontSize: '0.9rem', transition: 'color 0.2s' }}
        onMouseEnter={e => e.target.style.color = 'white'} onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}>
        <ArrowLeft size={18} /> Quay lại Trang Admin
      </Link>

      {/* Header */}
      <div style={headerStyle}>
        <h2 className="title-gradient" style={{ fontSize: '2.2rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Users size={32} /> Quản Lý Tài Khoản
        </h2>
        <button onClick={fetchUsers} className="btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', padding: '8px 16px' }}>
          <RefreshCw size={16} className={loading ? 'spin-icon' : ''} /> Làm mới
        </button>
      </div>

      {/* Statistics Cards */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '30px', flexWrap: 'wrap' }}>
        <div className="glass-panel" style={{ ...statCardStyle, borderLeft: '4px solid #6366f1' }}>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: '#818cf8' }}>{totalUsers}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>Tổng tài khoản</div>
        </div>
        <div className="glass-panel" style={{ ...statCardStyle, borderLeft: '4px solid #22c55e' }}>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: '#22c55e' }}>{activeUsers}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>Đang hoạt động</div>
        </div>
        <div className="glass-panel" style={{ ...statCardStyle, borderLeft: '4px solid #ef4444' }}>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: '#ef4444' }}>{lockedUsers}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>Đã khoá</div>
        </div>
        <div className="glass-panel" style={{ ...statCardStyle, borderLeft: '4px solid #fbbf24' }}>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: '#fbbf24' }}>{adminCount}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>Quản trị viên</div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="glass-panel" style={{ padding: '20px', marginBottom: '24px' }}>
        <form onSubmit={handleSearch} style={searchBarStyle}>
          <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
            <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên hoặc email..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ ...searchInputStyle, paddingLeft: '42px' }}
              onFocus={e => e.target.style.borderColor = 'var(--primary-color)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.2)'}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={16} style={{ color: 'var(--text-muted)' }} />
            <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} style={filterSelectStyle}>
              <option value="all">Tất cả vai trò</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={filterSelectStyle}>
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="locked">Đã khoá</option>
          </select>

          <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 20px' }}>
            <Search size={16} /> Tìm kiếm
          </button>
        </form>
      </div>

      {/* User Table */}
      {loading ? (
        <div className="glass-panel" style={{ padding: '60px', textAlign: 'center' }}>
          <RefreshCw size={40} className="spin-icon" style={{ color: 'var(--primary-color)', marginBottom: '16px' }} />
          <p style={{ color: 'var(--text-muted)' }}>Đang tải danh sách người dùng...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px', textAlign: 'center' }}>
          <Users size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Không tìm thấy người dùng nào</p>
        </div>
      ) : (
        <div className="glass-panel" style={tableWrapperStyle}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>#</th>
                <th style={thStyle}>Người dùng</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Vai trò</th>
                <th style={thStyle}>Trạng thái</th>
                <th style={thStyle}>Cấp độ</th>
                <th style={thStyle}>EXP</th>
                <th style={thStyle}>Ngày tạo</th>
                <th style={{ ...thStyle, textAlign: 'center' }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, index) => {
                const isAdmin = u.role === 'admin';
                const isSelf = u._id === user._id;
                const isDisabled = isAdmin || isSelf;
                const rowBg = u.isLocked ? 'rgba(239,68,68,0.05)' : 'transparent';

                return (
                  <tr key={u._id} style={{ background: rowBg, transition: 'background 0.2s' }}
                    onMouseEnter={e => { if (!u.isLocked) e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
                    onMouseLeave={e => e.currentTarget.style.background = rowBg}>
                    <td style={{ ...tdStyle, color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '600' }}>
                      {index + 1}
                    </td>

                    {/* User Info */}
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '40px', height: '40px', borderRadius: '12px',
                          background: isAdmin
                            ? 'linear-gradient(135deg, #fbbf24, #f59e0b)'
                            : u.isLocked
                              ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                              : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: '700', fontSize: '1rem', color: isAdmin ? '#000' : '#fff',
                          flexShrink: 0
                        }}>
                          {u.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <div style={{ fontWeight: '600', color: 'white', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {u.name}
                            {isSelf && <span style={{ fontSize: '0.7rem', color: 'var(--primary-color)', opacity: 0.8 }}>(Bạn)</span>}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        <Mail size={14} /> {u.email}
                      </div>
                    </td>

                    {/* Role */}
                    <td style={tdStyle}>
                      {isAdmin ? (
                        <span style={badgeStyle('rgba(251,191,36,0.15)', '#fbbf24')}>
                          <Shield size={12} /> Admin
                        </span>
                      ) : (
                        <span style={badgeStyle('rgba(99,102,241,0.15)', '#818cf8')}>
                          <ShieldOff size={12} /> User
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td style={tdStyle}>
                      {u.isLocked ? (
                        <span style={badgeStyle('rgba(239,68,68,0.15)', '#ef4444')}>
                          <Lock size={12} /> Đã khoá
                        </span>
                      ) : (
                        <span style={badgeStyle('rgba(34,197,94,0.15)', '#22c55e')}>
                          <Unlock size={12} /> Hoạt động
                        </span>
                      )}
                    </td>

                    {/* Level */}
                    <td style={tdStyle}>
                      <span style={{ fontWeight: '600', color: '#c084fc' }}>Lv.{u.level || 1}</span>
                    </td>

                    {/* EXP */}
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#fbbf24', fontWeight: '600' }}>
                        <Zap size={14} /> {u.exp || 0}
                      </div>
                    </td>

                    {/* Created at */}
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        <Calendar size={14} /> {formatDate(u.createdAt)}
                      </div>
                    </td>

                    {/* Actions */}
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      {isDisabled ? (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic' }}>
                          {isSelf ? 'Tài khoản bạn' : 'Admin'}
                        </span>
                      ) : (
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button
                            onClick={() => handleToggleLock(u._id, u.name, u.isLocked)}
                            disabled={actionLoading === u._id}
                            style={{
                              ...btnActionStyle(u.isLocked ? '34,197,94' : '251,191,36'),
                              color: u.isLocked ? '#22c55e' : '#fbbf24',
                              opacity: actionLoading === u._id ? 0.5 : 1
                            }}
                            title={u.isLocked ? 'Mở khoá tài khoản' : 'Khoá tài khoản'}
                          >
                            {u.isLocked ? <Unlock size={14} /> : <Lock size={14} />}
                            {u.isLocked ? 'Mở khoá' : 'Khoá'}
                          </button>

                          <button
                            onClick={() => handleDeleteUser(u._id, u.name)}
                            disabled={actionLoading === u._id}
                            style={{
                              ...btnActionStyle('239,68,68'),
                              color: '#ef4444',
                              opacity: actionLoading === u._id ? 0.5 : 1
                            }}
                            title="Xoá tài khoản vĩnh viễn"
                          >
                            <Trash2 size={14} /> Xoá
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserManager;
