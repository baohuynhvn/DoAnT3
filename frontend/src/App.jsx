import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import UserDashboard from './pages/Dashboard/UserDashboard';

import QuizList from './pages/Quiz/QuizList';
import QuizView from './pages/Quiz/QuizView';
import QuizResult from './pages/Quiz/QuizResult';

import DeckList from './pages/Flashcard/DeckList';
import FlashcardView from './pages/Flashcard/FlashcardView';

import AdminPanel from './pages/Admin/AdminPanel';
import QuizEditor from './pages/Admin/QuizEditor';
import FlashcardEditor from './pages/Admin/FlashcardEditor';
import CourseEditor from './pages/Admin/CourseEditor';
import AchievementEditor from './pages/Admin/AchievementEditor';
import QuizQuestionManager from './pages/Admin/QuizQuestionManager';
import CourseManager from './pages/Admin/CourseManager';
import AchievementManager from './pages/Admin/AchievementManager';
import UserManager from './pages/Admin/UserManager';

import CourseList from './pages/Course/CourseList';
import CourseView from './pages/Course/CourseView';
import Leaderboard from './pages/Leaderboard/Leaderboard';

import './index.css';

class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error("Caught by Error Boundary:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', background: '#2d0000', color: '#ff6b6b', minHeight: '100vh', fontFamily: 'monospace' }}>
          <h2>🚨 Rất xin lỗi, Hệ thống đã bắt được 1 lỗi kỹ thuật ở giao diện!</h2>
          <p>Làm ơn hãy chụp toàn bộ thông báo lỗi màu đỏ này gửi cho trợ lý AI (mình) để mình biết chính xác lỗi nằm ở đâu và sửa ngay trong 1 nốt nhạc nhé:</p>
          <hr style={{ borderColor: '#660000', margin: '20px 0' }}/>
          <h3 style={{marginTop: '20px'}}>Chi tiết báo lỗi (Error Stack):</h3>
          <p style={{ fontWeight: 'bold' }}>{this.state.error && this.state.error.toString()}</p>
          <pre style={{ background: '#000', padding: '15px', overflow: 'auto', borderRadius: '8px' }}>
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </pre>
          <button onClick={() => window.location.href='/'} style={{ marginTop: '20px', padding: '10px 20px', background: '#ff6b6b', color: 'white', border: 'none', cursor: 'pointer' }}>Về Trang Chủ Khôi Phục</button>
        </div>
      );
    }
    return this.props.children;
  }
}


const Home = () => (
  <div className="container" style={{ paddingTop: '80px', textAlign: 'center' }}>
    <h1 className="title-gradient" style={{ fontSize: '3.5rem', marginBottom: '20px' }}>
      Làm Chủ Kiến Thức
    </h1>
    <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginBottom: '40px' }}>
      Nền tảng tối ưu cho học tập tương tác qua Quizzes và Flashcards.
    </p>
    
    <div className="glass-panel" style={{ maxWidth: '600px', margin: '0 auto', padding: '40px' }}>
      <h2 style={{ marginBottom: '20px' }}>Bắt Đầu Học Ngay</h2>
      <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link to="/quizzes" className="btn-primary" style={{ textDecoration: 'none' }}>Khám Phá Trắc Nghiệm</Link>
        <Link to="/flashcards" className="btn-primary" style={{ backgroundColor: 'transparent', border: '1px solid var(--primary-color)', textDecoration: 'none' }}>
          Học Flashcards
        </Link>
        <Link to="/leaderboard" className="btn-primary" style={{ backgroundColor: 'transparent', border: '1px solid #fbbf24', color: '#fbbf24', textDecoration: 'none' }}>
          🏆 Bảng Xếp Hạng
        </Link>
      </div>
    </div>
  </div>
);

function App() {
  return (
    <GlobalErrorBoundary>
      <Router>
        <AuthProvider>
          <div className="app-layout" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header />
            <main style={{ flex: 1 }}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<UserDashboard />} />
                
                <Route path="/quizzes" element={<QuizList />} />
                <Route path="/quizzes/:id" element={<QuizView />} />
                <Route path="/quizzes/:id/result" element={<QuizResult />} />
                
                <Route path="/courses" element={<CourseList />} />
                <Route path="/courses/:id" element={<CourseView />} />
                
                <Route path="/flashcards" element={<DeckList />} />
                <Route path="/flashcards/:deckId" element={<FlashcardView />} />
                
                <Route path="/leaderboard" element={<Leaderboard />} />
                
                {/* Admin Routes */}
                <Route path="/admin" element={<AdminPanel />} />
                <Route path="/admin/quiz-editor" element={<QuizEditor />} />
                <Route path="/admin/flashcard-editor" element={<FlashcardEditor />} />
                <Route path="/admin/flashcard-editor/:paramDeckId" element={<FlashcardEditor />} />
                <Route path="/admin/course-editor" element={<CourseEditor />} />
                <Route path="/admin/achievement-editor" element={<AchievementEditor />} />
                <Route path="/admin/quiz/:quizId/questions" element={<QuizQuestionManager />} />
                <Route path="/admin/course/:courseId" element={<CourseManager />} />
                <Route path="/admin/achievement/:achId" element={<AchievementManager />} />
                <Route path="/admin/users" element={<UserManager />} />
              </Routes>
            </main>
          </div>
        </AuthProvider>
      </Router>
    </GlobalErrorBoundary>
  );
}

export default App;
