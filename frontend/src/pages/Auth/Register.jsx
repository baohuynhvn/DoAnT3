import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const { register } = useContext(AuthContext);

  const submitHandler = async (e) => {
    e.preventDefault();
    if(password !== confirmPassword) {
      return setErrorMsg('Mật khẩu nhập lại không khớp');
    }
    try {
      await register(name, email, password);
    } catch (error) {
      setErrorMsg(error);
    }
  };

  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', marginTop: '80px', marginBottom: '80px' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '450px', padding: '40px' }}>
        <h2 className="title-gradient" style={{ textAlign: 'center', marginBottom: '30px', fontSize: '2rem' }}>Tạo Tài Khoản Mới</h2>
        {errorMsg && <div style={{ color: '#ef4444', marginBottom: '15px', textAlign: 'center', background: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '8px' }}>{errorMsg}</div>}
        <form onSubmit={submitHandler} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Họ và Tên</label>
            <input 
              type="text" 
              className="input-field" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Địa chỉ Email</label>
            <input 
              type="email" 
              className="input-field" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Mật khẩu</label>
            <input 
              type="password" 
              className="input-field" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Nhập lại Mật khẩu</label>
            <input 
              type="password" 
              className="input-field" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              required 
            />
          </div>
          <button type="submit" className="btn-primary" style={{ padding: '12px', marginTop: '10px' }}>Đăng ký</button>
        </form>
        <div style={{ marginTop: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
          Đã có tài khoản? <Link to="/login" style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>Đăng nhập ngay</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
