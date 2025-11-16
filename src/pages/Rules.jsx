import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Heart, Users, LogOut } from 'lucide-react';

const RulesPage = ({ onNavigate }) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    onNavigate('rules');
  };

  return (
    <>
      <header className="header">
        <div className="container">
          <div className="header-content">
            <div className="logo">
              <div className="logo-icon">
                <img src="./teefusion.svg" alt="TeeFusion Logo" />
              </div>
              <span>TEE<strong>FUSION</strong></span>
            </div>
            <div>
              {user ? (
                <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
                  <div className="user-info">
                    <div className="user-avatar">{user.name[0]}</div>
                    <div className="user-details">
                      <div className="user-name">{user.name}</div>
                      <div className="user-role">{user.role === 'admin' ? 'Администратор' : 'Модератор'}</div>
                    </div>
                  </div>
                  <button className="btn btn-primary" onClick={() => onNavigate(user.role === 'admin' ? 'admin' : 'moderator')}>
                    Панель управления
                  </button>
                  <button className="btn btn-secondary" onClick={handleLogout}>
                    <LogOut size={18} />
                    Выйти
                  </button>
                </div>
              ) : (
                <button className="btn btn-primary" onClick={() => onNavigate('login')}>
                  Вход для модераторов
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div style={{padding: '140px 2rem 80px', textAlign: 'center'}}>
        <h1 style={{fontSize: '3rem', fontWeight: 800, color: 'var(--text)', marginBottom: '1rem'}}>
          Правила TeeFusion
        </h1>
        <p style={{fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '700px', margin: '0 auto 2rem'}}>
          Мы создали эти правила не для ограничений, а чтобы <strong style={{color: 'var(--accent-light)'}}>защитить твой комфорт</strong> и сделать игру честной для каждого.
        </p>
        <div style={{display: 'flex', justifyContent: 'center', gap: '3rem', flexWrap: 'wrap'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text)', fontWeight: 600}}>
            <Shield size={24} style={{color: 'var(--accent-light)'}} />
            <span>Честная игра</span>
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text)', fontWeight: 600}}>
            <Heart size={24} style={{color: 'var(--accent-light)'}} />
            <span>Ламповая атмосфера</span>
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text)', fontWeight: 600}}>
            <Users size={24} style={{color: 'var(--accent-light)'}} />
            <span>Справедливость для всех</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default RulesPage;