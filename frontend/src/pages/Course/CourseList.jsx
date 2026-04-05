import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { BookOpen, Users, Layout } from 'lucide-react';

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/courses`);
        setCourses(data);
      } catch (error) {
        console.error("Lỗi tải danh sách khoá học", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Đang tải danh sách khoá học...</div>;

  return (
    <div className="container" style={{ marginTop: '40px', marginBottom: '60px' }}>
      <h2 className="title-gradient" style={{ fontSize: '2.5rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
         <BookOpen size={40} /> Lộ Trình Khoá Học
      </h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '40px', fontSize: '1.1rem' }}>Tham gia các khoá học được biên soạn chuẩn xác giúp bạn thăng tiến nhanh nhất.</p>

      {courses.length === 0 ? (
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)' }}>Hiện tại chưa có khoá học nào được xuất bản.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '25px' }}>
          {courses.map(course => (
            <div key={course._id} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ padding: '25px', flex: 1 }}>
                <h3 style={{ fontSize: '1.4rem', color: 'white', marginBottom: '10px' }}>{course.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '20px', lineHeight: '1.5' }}>
                  {course.description || "Không có mô tả chi tiết."}
                </p>
                <div style={{ display: 'flex', gap: '15px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                   <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Layout size={16} color="#8b5cf6" /> {course.quizzes?.length + course.flashcardDecks?.length || 0} bài học</span>
                   <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Users size={16} color="#10b981" /> {course.studentsEnrolled?.length || 0} học viên</span>
                </div>
              </div>
              <Link to={`/courses/${course._id}`} className="btn-primary" style={{ textAlign: 'center', borderRadius: '0', background: 'rgba(139, 92, 246, 0.2)', border: 'none', borderTop: '1px solid rgba(139, 92, 246, 0.3)', color: '#a78bfa', padding: '15px', textDecoration: 'none', fontWeight: 'bold' }}>
                Khám Phá Chi Tiết Khoá Học
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default CourseList;
