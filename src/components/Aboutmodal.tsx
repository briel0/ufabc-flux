import React from 'react';
import '../styles/aboutmodal.css'; // Ajuste o caminho se necessário

interface AboutModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    // Fecha o modal se o usuário clicar fora da caixa principal
    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) onClose();
    };

   return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
        <div className="modal-content">
            <button className="modal-close-btn" onClick={onClose} title="Fechar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
            
            <h2>UFABC Flux</h2>

            {/* O TEXTO ENTRA AQUI: Protegido por uma div de controle */}
            <div className="modal-text-body">
                <p>
                    Visualizador de dependências curriculares para alunos da Universidade Federal do ABC. 
                    Criado para facilitar a tomada de decisão no período de matrículas.
                </p>

                <p className="feedback-note">
                    <span className="beta-label">Beta & Feedback:</span>
                    Este projeto está em constante evolução. Se você detectar inconsistências nos dados ou quiser propor novas funcionalidades, seu feedback via GitHub ou LinkedIn será muito bem-vindo. Ajude a manter o fluxo atualizado.
                </p>
            </div>

            <div className="modal-links">
                <a href="https://github.com/briel0/ufabc-flux" target="_blank" rel="noopener noreferrer" className="modal-link">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                    </svg>
                    GitHub
                </a>
                <a href="https://www.linkedin.com/in/gabriel-abreu-b1bb071a5/" target="_blank" rel="noopener noreferrer" className="modal-link">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                        <rect x="2" y="9" width="4" height="12"></rect>
                        <circle cx="4" cy="4" r="2"></circle>
                    </svg>
                    LinkedIn
                </a>
            </div>
        </div>
    </div>
);
};