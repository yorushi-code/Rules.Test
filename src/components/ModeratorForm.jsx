import React, { useState } from 'react';
import { X, UserPlus, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../services/api';

const ModeratorForm = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Валидация
    if (formData.username.length < 3) {
      setError('Логин должен содержать минимум 3 символа');
      return;
    }
    if (formData.password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return;
    }
    if (formData.name.length < 3) {
      setError('Имя должно содержать минимум 3 символа');
      return;
    }

    setLoading(true);

    try {
      const result = await api.addModerator(formData);
      
      if (result.success) {
        onSuccess();
      } else {
        setError(result.error || 'Ошибка при добавлении модератора');
      }
    } catch (error) {
      setError('Ошибка соединения с сервером');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            <UserPlus size={24} />
            Добавить модератора
          </h2>
          <button className="modal-close" onClick={onClose} disabled={loading}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="form-error">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Логин</label>
            <input
              type="text"
              className="form-input"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="Введите логин (минимум 3 символа)"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Пароль</label>
            <input
              type="password"
              className="form-input"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Введите пароль (минимум 6 символов)"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Полное имя</label>
            <input
              type="text"
              className="form-input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Введите полное имя модератора"
              disabled={loading}
              required
            />
          </div>

          <div className="modal-actions">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onClose}
              disabled={loading}
            >
              Отмена
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="spinning" />
                  Добавление...
                </>
              ) : (
                <>
                  <UserPlus size={18} />
                  Добавить
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .spinning {
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }

        .modal-content {
          background: var(--background);
          border-radius: 16px;
          border: 1px solid var(--border);
          max-width: 500px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid var(--border);
        }

        .modal-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text);
          margin: 0;
        }

        .modal-close {
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 8px;
          transition: all 0.2s;
        }

        .modal-close:hover:not(:disabled) {
          background: var(--surface);
          color: var(--text);
        }

        .modal-close:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .modal-content form {
          padding: 1.5rem;
        }

        .form-group {
          margin-bottom: 1.25rem;
        }

        .form-label {
          display: block;
          margin-bottom: 0.5rem;
          color: var(--text);
          font-weight: 500;
          font-size: 0.9rem;
        }

        .form-input {
          width: 100%;
          padding: 0.75rem 1rem;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 8px;
          color: var(--text);
          font-size: 1rem;
          transition: all 0.2s;
        }

        .form-input:focus {
          outline: none;
          border-color: var(--primary);
          background: var(--background);
        }

        .form-input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .form-error {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 8px;
          color: #ef4444;
          font-size: 0.9rem;
          margin-bottom: 1.25rem;
        }

        .modal-actions {
          display: flex;
          gap: 0.75rem;
          justify-content: flex-end;
          margin-top: 1.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--border);
        }

        .btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 500;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-primary {
          background: var(--primary);
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: var(--primary-hover);
        }

        .btn-secondary {
          background: var(--surface);
          color: var(--text);
          border: 1px solid var(--border);
        }

        .btn-secondary:hover:not(:disabled) {
          background: var(--background);
        }
      `}</style>
    </div>
  );
};

export default ModeratorForm;