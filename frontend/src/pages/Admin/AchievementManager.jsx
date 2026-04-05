import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { ArrowLeft, Save, Award, Image as ImageIcon, Zap, TrendingUp, BookOpen } from 'lucide-react';

const AchievementManager = () => {
  const { achId } = useParams();
  const { user } = useContext(AuthContext);
  const [ach, setAch] = useState(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [condition, setCondition] = useState('');
  const [requiredKpi, setRequiredKpi] = useState(1);
  const [kpiType, setKpiType] = useState('streak');
  const [iconFile, setIconFile] = useState(null);
  const [iconPreview, setIconPreview] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/achievements`);
        const found = data.find(a => a._id === achId);
        if (found) {
          setAch(found);
          setName(found.name);
          setDescription(found.description);
          setCondition(found.condition || '');
          setRequiredKpi(found.requiredKpi || 1);
          setKpiType(found.kpiType || 'streak');
          if (found.iconUrl) {
            setIconPreview(found.iconUrl.startsWith('/uploads')
              ? `${import.meta.env.VITE_API_URL?.replace('/api', '')}${found.iconUrl}`
              : found.iconUrl);
          }
        }
      } catch (error) {
        console.error('Lỗi:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [achId]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIconFile(file);
      setIconPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('condition', condition);
      formData.append('requiredKpi', requiredKpi);
      formData.append('kpiType', kpiType);
      if (iconFile) formData.append('icon', iconFile);

      const res = await axios.put(`${import.meta.env.VITE_API_URL}/achievements/${achId}`, formData, {
        headers: { Authorization: `Bearer ${user.token}`, 'Content-Type': 'multipart/form-data' }
      });
      setAch(res.data);
      alert('✅ Đã lưu huy hiệu thành công!');
    } catch (error) {
      alert('Lỗi: ' + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '8px', padding: '12px 16px', color: 'white', width: '100%',
    marginBottom: '12px', fontSize: '1rem'
  };

  const kpiOptions = [
    { value: 'streak', label: 'Chuỗi bài làm (Streak)', icon: <TrendingUp size={18} color="#f59e0b" />, color: '#f59e0b' },
    { value: 'exp', label: 'Điểm kinh nghiệm (EXP)', icon: <Zap size={18} color="#8b5cf6" />, color: '#8b5cf6' },
    { value: 'courses_completed', label: 'Khoá học hoàn thành', icon: <BookOpen size={18} color="#3b82f6" />, color: '#3b82f6' }
  ];

  if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Đang tải...</div>;
  if (!ach) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Không tìm thấy huy hiệu!</div>;

  return (
    <div className="container" style={{ marginTop: '40px', marginBottom: '60px', maxWidth: '700px' }}>
      <Link to="/admin" style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px', textDecoration: 'none', marginBottom: '25px' }}>
        <ArrowLeft size={20} /> Quay lại Admin
      </Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2 className="title-gradient" style={{ fontSize: '2rem' }}>
          🏅 Chỉnh sửa Huy Hiệu
        </h2>
        <button onClick={handleSave} disabled={saving} className="btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fbbf24', color: '#000', fontWeight: 'bold', padding: '12px 24px' }}>
          <Save size={18} /> {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
        </button>
      </div>

      {/* Icon Upload */}
      <div className="glass-panel" style={{ padding: '25px', marginBottom: '25px', textAlign: 'center' }}>
        <h3 style={{ color: '#fbbf24', marginBottom: '20px' }}>🖼️ Icon huy hiệu</h3>
        <div style={{
          width: '120px', height: '120px', borderRadius: '50%', margin: '0 auto 20px auto',
          background: 'rgba(251,191,36,0.1)', border: '3px solid #fbbf24',
          display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
        }}>
          {iconPreview ? (
            <img src={iconPreview} alt="Icon" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <Award size={48} color="#fbbf24" />
          )}
        </div>
        <label style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px',
          background: 'rgba(59,130,246,0.15)', border: '1px solid #3b82f6', borderRadius: '8px',
          color: '#3b82f6', cursor: 'pointer', fontSize: '0.9rem'
        }}>
          <ImageIcon size={16} /> Chọn ảnh mới
          <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
        </label>
      </div>

      {/* Thông tin cơ bản */}
      <div className="glass-panel" style={{ padding: '25px', marginBottom: '25px' }}>
        <h3 style={{ color: 'white', marginBottom: '15px' }}>📝 Thông tin cơ bản</h3>
        <label style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'block', marginBottom: '5px' }}>Tên huy hiệu</label>
        <input style={inputStyle} value={name} onChange={e => setName(e.target.value)} placeholder="VD: Tân Thủ, Chăm Chỉ..." />
        <label style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'block', marginBottom: '5px' }}>Mô tả / Thông điệp</label>
        <textarea style={{ ...inputStyle, minHeight: '70px' }} value={description} onChange={e => setDescription(e.target.value)} placeholder="VD: Chúc mừng bạn đã đạt..." />
      </div>

      {/* Điều kiện đạt được */}
      <div className="glass-panel" style={{ padding: '25px', marginBottom: '25px' }}>
        <h3 style={{ color: 'white', marginBottom: '20px' }}>🎯 Điều kiện đạt được</h3>

        <label style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'block', marginBottom: '8px' }}>Loại chỉ số (KPI Type)</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
          {kpiOptions.map(opt => (
            <div key={opt.value} onClick={() => setKpiType(opt.value)} style={{
              padding: '14px 18px', borderRadius: '10px', cursor: 'pointer',
              background: kpiType === opt.value ? `${opt.color}20` : 'rgba(255,255,255,0.04)',
              border: `2px solid ${kpiType === opt.value ? opt.color : 'rgba(255,255,255,0.08)'}`,
              display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.2s'
            }}>
              {opt.icon}
              <span style={{ color: kpiType === opt.value ? opt.color : 'var(--text-light)', fontWeight: kpiType === opt.value ? 'bold' : 'normal' }}>
                {opt.label}
              </span>
            </div>
          ))}
        </div>

        <label style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'block', marginBottom: '5px' }}>
          Chỉ số cần đạt (số {kpiType === 'streak' ? 'lần nộp bài' : kpiType === 'exp' ? 'điểm EXP' : 'khoá học'})
        </label>
        <input type="number" min="1" style={{ ...inputStyle, maxWidth: '200px' }} value={requiredKpi} onChange={e => setRequiredKpi(Number(e.target.value))} />

        {/* Preview */}
        <div style={{
          marginTop: '15px', padding: '15px', borderRadius: '10px',
          background: 'rgba(255,255,255,0.04)', border: '1px dashed rgba(255,255,255,0.15)'
        }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '8px' }}>Xem trước điều kiện:</p>
          <p style={{ color: '#fbbf24', fontWeight: 'bold' }}>
            {kpiType === 'streak' ? `${requiredKpi} lần nộp bài liên tiếp` :
             kpiType === 'exp' ? `Đạt ${requiredKpi} điểm EXP` :
             `Hoàn thành ${requiredKpi} khoá học`}
          </p>
        </div>
      </div>

      {/* Thống kê */}
      <div className="glass-panel" style={{ padding: '20px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>
          👥 Đã có <strong style={{ color: '#22c55e' }}>{ach.earnedByUsers?.length || 0}</strong> người đạt huy hiệu này
        </p>
      </div>

      {/* Nút lưu dưới cùng */}
      <div style={{ textAlign: 'center', marginTop: '25px' }}>
        <button onClick={handleSave} disabled={saving} className="btn-primary"
          style={{ padding: '14px 40px', fontSize: '1.1rem', background: '#fbbf24', color: '#000', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <Save size={20} /> {saving ? 'Đang lưu...' : 'Lưu tất cả thay đổi'}
        </button>
      </div>
    </div>
  );
};

export default AchievementManager;
