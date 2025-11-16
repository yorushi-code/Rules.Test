import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, X, Loader2 } from 'lucide-react';

const LoginPage = ({ onSuccess, onBack }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(username, password);
      
      if (result.success) {
        onSuccess(result.user.role);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Ошибка соединения с сервером');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <button 
          className="login-close" 
          onClick={onBack}
          title="Вернуться к правилам"
          disabled={loading}
        >
          <X size={24} />
        </button>

        <div className="login-header">
          <div className="login-logo">
            <img src="./teefusion.svg" alt="TeeFusion Logo" />
          </div>
          <h1 className="login-title">Вход в систему</h1>
          <p className="login-subtitle">Панель управления TeeFusion</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="form-error">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Имя пользователя</label>
            <input
              type="text"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Введите логин"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Пароль</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Введите пароль"
              disabled={loading}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{width: '100%'}}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="spinner" />
                Вход...
              </>
            ) : (
              'Войти'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;