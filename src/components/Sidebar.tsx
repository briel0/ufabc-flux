import React from 'react';

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

  const courses = [
    { id: 'bcc', name: 'Ciência da Computação (BCC)' },
    { id: 'bct', name: 'Bacharelado em C&T (BCT)', disabled: true },
    { id: 'bnh', name: 'Bases Neurobiológicas', disabled: true },
  ];

  return (
    <>
      {/* Botão Flutuante (Zen Mode) - Só aparece quando a barra fecha */}
      {isCollapsed && (
        <button 
            className="floating-toggle-btn" 
            onClick={onToggleCollapse}
            title="Abrir menu"
        >
          ☰
        </button>
      )}

      {/* A Barra Lateral */}
      <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <h2>UFABC FLUX</h2>
          <button 
              className="toggle-btn" 
              onClick={onToggleCollapse}
              title="Fechar menu"
          >
            «
          </button>
        </div>

        <p className="sidebar-subtitle">Selecione o Curso</p>

        <nav className="sidebar-nav">
          {courses.map((course) => (
            <button
              key={course.id}
              className={`course-btn ${selectedCourse === course.id ? 'active' : ''}`}
              onClick={() => !course.disabled && onSelectCourse(course.id)}
              disabled={course.disabled}
            >
              {course.name}
            </button>
          ))}
        </nav>
        
        <div className="sidebar-footer">

        </div>
      </aside>
    </>
  );
};