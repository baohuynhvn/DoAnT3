import React, { useState, useContext, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Award, Image as ImageIcon, Upload, X, CheckCircle } from 'lucide-react';

const AchievementEditor = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [iconFile, setIconFile] = useState(null);
  const [iconPreview, setIconPreview] = useState('');
  const [requiredKpi, setRequiredKpi] = useState(1);
  const [kpiType, setKpiType] = useState('streak');
  const [isDragOver, setIsDragOver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user || user.role !== 'admin') return <div style={{textAlign: 'center', marginTop: '50px'}}>Quyền truy cập bị từ chối</div>;

  const handleFileSelect = (file) => {
    if (!file) return;
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      alert('Chỉ cho phép file ảnh (PNG, JPG, GIF, WebP, SVG)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('File quá lớn! Tối đa 5MB.');
      return;
    }
    setIconFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setIconPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleRemoveFile = () => {
    setIconFile(null);
    setIconPreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCreateAchievement = async (e) => {
    e.preventDefault();
    if (!iconFile) {
      alert('Vui lòng chọn ảnh biểu tượng cho huy hiệu!');
      return;
    }
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('icon', iconFile);
      formData.append('name', name);
      formData.append('description', description);
      formData.append('requiredKpi', Number(requiredKpi));
      formData.append('kpiType', kpiType);

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'multipart/form-data'
        }
      };
      await axios.post(`${import.meta.env.VITE_API_URL}/achievements`, formData, config);
      alert("Phát hành huy hiệu thành công!");
      navigate('/admin');
    } catch (error) {
      alert("Lỗi phát hành huy hiệu: " + (error.response?.data?.message || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ marginTop: '40px', marginBottom: '80px', maxWidth: '700px' }}>
      <h2 className="title-gradient" style={{ fontSize: '2.5rem', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '15px' }}>
        <Award size={36} color="#fbbf24" /> Phát Hành Huy Hiệu Mới
      </h2>

      <form className="glass-panel" onSubmit={handleCreateAchievement} style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Xem trước Huy hiệu */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '10px' }}>
          <div style={{
            width: '120px', height: '120px', borderRadius: '50%',
            background: iconPreview ? 'transparent' : 'rgba(251, 191, 36, 0.15)',
            border: `3px solid ${iconPreview ? '#22c55e' : '#fbbf24'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden', marginBottom: '15px',
            boxShadow: iconPreview ? '0 0 20px rgba(34, 197, 94, 0.3)' : '0 0 20px rgba(251, 191, 36, 0.2)',
            transition: 'all 0.3s ease'
          }}>
            {iconPreview
              ? <img src={iconPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <ImageIcon size={48} color="#fbbf24" />
            }
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {iconPreview ? '✅ Đã chọn ảnh biểu tượng' : 'Preview Huy hiệu hiển thị thực tế'}
          </p>
        </div>

        <div>
           <label style={{ color: 'white', marginBottom: '8px', display: 'block', fontWeight: 'bold' }}>Tên Huy Hiệu (Danh hiệu)</label>
           <input type="text" className="input-field" value={name} onChange={(e) => setName(e.target.value)} required placeholder="VD: Học Giả Chăm Chỉ" />
        </div>
        
        {/* Upload ảnh - Drag & Drop */}
        <div>
           <label style={{ color: 'white', marginBottom: '8px', display: 'block', fontWeight: 'bold' }}>
             <Upload size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
             Tải lên Biểu tượng (Icon)
           </label>

           {iconFile ? (
             /* File đã chọn */
             <div style={{
               display: 'flex', alignItems: 'center', gap: '12px',
               background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.4)',
               borderRadius: '12px', padding: '12px 16px',
               transition: 'all 0.3s ease'
             }}>
               <img src={iconPreview} alt="Thumb" style={{
                 width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover',
                 border: '2px solid rgba(34, 197, 94, 0.5)'
               }} />
               <div style={{ flex: 1 }}>
                 <p style={{ color: '#22c55e', fontWeight: 'bold', margin: 0, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                   <CheckCircle size={16} /> {iconFile.name}
                 </p>
                 <p style={{ color: 'var(--text-muted)', margin: '2px 0 0 0', fontSize: '0.8rem' }}>
                   {(iconFile.size / 1024).toFixed(1)} KB
                 </p>
               </div>
               <button
                 type="button"
                 onClick={handleRemoveFile}
                 style={{
                   background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.4)',
                   borderRadius: '8px', padding: '6px', cursor: 'pointer',
                   display: 'flex', alignItems: 'center', justifyContent: 'center',
                   transition: 'all 0.2s ease'
                 }}
                 onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.4)'; }}
                 onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'; }}
               >
                 <X size={18} color="#ef4444" />
               </button>
             </div>
           ) : (
             /* Vùng kéo thả */
             <div
               onDragOver={handleDragOver}
               onDragLeave={handleDragLeave}
               onDrop={handleDrop}
               onClick={() => fileInputRef.current?.click()}
               style={{
                 border: `2px dashed ${isDragOver ? '#fbbf24' : 'rgba(255, 255, 255, 0.15)'}`,
                 borderRadius: '16px',
                 padding: '35px 20px',
                 textAlign: 'center',
                 cursor: 'pointer',
                 background: isDragOver ? 'rgba(251, 191, 36, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                 transition: 'all 0.3s ease',
                 position: 'relative'
               }}
               onMouseOver={(e) => {
                 if (!isDragOver) {
                   e.currentTarget.style.borderColor = 'rgba(251, 191, 36, 0.5)';
                   e.currentTarget.style.background = 'rgba(251, 191, 36, 0.05)';
                 }
               }}
               onMouseOut={(e) => {
                 if (!isDragOver) {
                   e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                   e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                 }
               }}
             >
               <div style={{
                 width: '60px', height: '60px', borderRadius: '50%',
                 background: 'rgba(251, 191, 36, 0.15)',
                 display: 'flex', alignItems: 'center', justifyContent: 'center',
                 margin: '0 auto 15px auto'
               }}>
                 <Upload size={28} color="#fbbf24" />
               </div>
               <p style={{ color: 'white', fontWeight: 'bold', fontSize: '1rem', margin: '0 0 6px 0' }}>
                 {isDragOver ? '✨ Thả ảnh vào đây!' : 'Kéo & thả ảnh vào đây'}
               </p>
               <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
                 hoặc <span style={{ color: '#fbbf24', textDecoration: 'underline' }}>nhấn để chọn file</span>
               </p>
               <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '10px' }}>
                 PNG, JPG, GIF, WebP, SVG • Tối đa 5MB
               </p>
             </div>
           )}

           <input
             ref={fileInputRef}
             type="file"
             accept="image/png,image/jpeg,image/jpg,image/gif,image/webp,image/svg+xml"
             onChange={(e) => handleFileSelect(e.target.files[0])}
             style={{ display: 'none' }}
           />
        </div>

        <div>
           <label style={{ color: 'white', marginBottom: '8px', display: 'block', fontWeight: 'bold' }}>Thông điệp Vinh danh</label>
           <textarea className="input-field" value={description} onChange={(e) => setDescription(e.target.value)} rows="3" required placeholder="VD: Tặng cho người kiên trì kỷ luật học tập ngày đêm..." />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '8px', border: '1px dashed #fbbf24' }}>
          <div>
            <label style={{ color: 'white', marginBottom: '8px', display: 'block', fontWeight: 'bold' }}>Chỉ số vượt ải (KPI)</label>
            <input type="number" min="1" className="input-field" value={requiredKpi} onChange={(e) => setRequiredKpi(e.target.value)} required />
          </div>
          <div>
            <label style={{ color: 'white', marginBottom: '8px', display: 'block', fontWeight: 'bold' }}>Loại điều kiện KPI</label>
            <select className="input-field" value={kpiType} onChange={(e) => setKpiType(e.target.value)}>
              <option value="streak">Chuỗi bài làm (Streak)</option>
              <option value="exp">Tổng điểm EXP đã đạt</option>
              <option value="courses_completed">Số Khoá học hoàn thành</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary"
          style={{
            marginTop: '10px',
            background: isSubmitting ? '#666' : 'linear-gradient(45deg, #fbbf24, #f59e0b)',
            color: '#000', fontWeight: 'bold',
            opacity: isSubmitting ? 0.7 : 1,
            cursor: isSubmitting ? 'not-allowed' : 'pointer'
          }}
        >
          {isSubmitting ? '⏳ Đang xử lý...' : 'Đưa Vào Hệ Thống (Phát Hành)'}
        </button>
      </form>
    </div>
  );
};
export default AchievementEditor;
