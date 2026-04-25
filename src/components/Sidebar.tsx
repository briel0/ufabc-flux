import React from 'react';

import courses from '../data/courses.json';

import '../styles/sidebar.css';

interface SidebarProps {
  selectedCourse: string;
  onSelectCourse: (courseId: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
    selectedCourse, 
    onSelectCourse, 
    isCollapsed, 
    onToggleCollapse 
}) => {

const handleCourseClick = (courseName: string) => {
  onSelectCourse(courseName);

  if (window.innerWidth <= 768) {
    onToggleCollapse(); 
  }
};

  return (
    <>
      {isCollapsed && (
        <button 
            className="floating-toggle-btn" 
            onClick={onToggleCollapse}
            title="Abrir menu"
        >
          ☰
        </button>
      )}

      <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <h3>Selecione o Curso</h3>
          <button 
              className="toggle-btn" 
              onClick={onToggleCollapse}
              title="Fechar menu"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6"/>
            </svg>
          </button>
        </div>


        <nav className="sidebar-nav">
          {courses.map((course) => (
            <button
              key={course.name}
              className={`course-btn ${selectedCourse === course.name ? 'active' : ''}`}
              onClick={() => !course.disabled && handleCourseClick(course.name)}
              disabled={course.disabled}

              title={course.name}

            >
              {course.name}
            </button>
          ))}
        </nav>
      </aside>
    </>
  );
};