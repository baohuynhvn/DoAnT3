import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const { login } = useContext(AuthContext);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
    } catch (error) {
      setErrorMsg(error);
    }
  };

  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', marginTop: '80px' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '40px' }}>
        <h2 className="title-gradient" style={{ textAlign: 'center', marginBottom: '30px', fontSize: '2rem' }}>Chào mừng trở lại</h2>
        {errorMsg && <div style={{ color: '#ef4444', marginBottom: '15px', textAlign: 'center', background: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '8px' }}>{errorMsg}</div>}
        <form onSubmit={submitHandler} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
          <button type="submit" className="btn-primary" style={{ padding: '12px', marginTop: '10px' }}>Đăng nhập</button>
        </form>
        <div style={{ marginTop: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
          Chưa có tài khoản? <Link to="/register" style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>Đăng ký ngay</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
