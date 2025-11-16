import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { getRecentPunishments } from '../services/telegram';
import { MODERATOR_GUIDELINES } from '../utils/constants';
import { 
  LogOut, Ban, RefreshCw, AlertCircle, Search, Filter, Shield, 
  Clock, User, FileText, Calendar, TrendingUp, BarChart3
} from 'lucide-react';
import PunishmentForm from '../components/PunishmentForm';

const ModeratorPanel = ({ onNavigate }) => {
  const { user, logout } = useAuth();
  const [punishments, setPunishments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPunishmentModal, setShowPunishmentModal] = useState(false);
  const [activeTab, setActiveTab] = useState('regulation');
  const [stats, setStats] = useState({ total: 0, bans: 0, mutes: 0, today: 0 });
  
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0
  });
  const [filters, setFilters] = useState({
    search: '',
    type: ''
  });

  useEffect(() => {
    if (activeTab === 'logs') {
      loadPunishments();
    }
  }, [pagination.page, filters.type, activeTab]);

  const loadPunishments = async () => {
    setLoading(true);
    try {
      const apiResult = await api.getPunishments(
        pagination.page,
        pagination.limit,
        filters.search,
        filters.type
      );
      
      if (apiResult.success && apiResult.punishments.length > 0) {
        setPunishments(apiResult.punishments);
        setPagination(apiResult.pagination);
        calculateStats(apiResult.punishments);
      } else {
        const telegramLogs = await getRecentPunishments();
        let filtered = telegramLogs;
        
        if (filters.search) {
          filtered = filtered.filter(p => 
            p.player.toLowerCase().includes(filters.search.toLowerCase())
          );
        }
        if (filters.type) {
          filtered = filtered.filter(p => p.type === filters.type);
        }
        
        filtered.sort((a, b) => b.timestamp - a.timestamp);
        
        setPunishments(filtered);
        setPagination({
          page: 1,
          limit: 50,
          total: filtered.length,
          pages: 1
        });
        calculateStats(filtered);
      }
    } catch (error) {
      console.error('Error loading punishments:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    
    setStats({
      total: data.length,
      bans: data.filter(p => p.type === 'ban').length,
      mutes: data.filter(p => p.type === 'mute').length,
      today: data.filter(p => {
        const pTime = p.timestamp || new Date(p.created_at).getTime();
        return pTime >= today;
      }).length
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    loadPunishments();
  };

  const handleFilterChange = (type) => {
    setFilters(prev => ({ ...prev, type }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleLogout = () => {
    logout();
    onNavigate('rules');
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (minutes) => {
    if (minutes === 0) return 'Навсегда';
    if (minutes < 60) return `${minutes} мин`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)} ч`;
    return `${Math.floor(minutes / 1440)} дн`;
  };

  const parseDuration = (durationStr) => {
    if (!durationStr) return 'Не указано';
    if (typeof durationStr === 'string' && durationStr.includes(' ')) {
      return durationStr;
    }
    return formatDuration(parseInt(durationStr) || 0);
  };

  // Рендеринг статистики [web:181][web:183]
  const renderStats = () => (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1rem',
      marginBottom: '2rem'
    }}>
      <div className="stat-card">
        <div className="stat-icon" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
          <BarChart3 size={24} />
        </div>
        <div className="stat-content">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Всего наказаний</div>
        </div>
      </div>
      
      <div className="stat-card">
        <div className="stat-icon" style={{background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'}}>
          <Ban size={24} />
        </div>
        <div className="stat-content">
          <div className="stat-value">{stats.bans}</div>
          <div className="stat-label">Банов выдано</div>
        </div>
      </div>
      
      <div className="stat-card">
        <div className="stat-icon" style={{background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'}}>
          <Shield size={24} />
        </div>
        <div className="stat-content">
          <div className="stat-value">{stats.mutes}</div>
          <div className="stat-label">Мутов выдано</div>
        </div>
      </div>
      
      <div className="stat-card">
        <div className="stat-icon" style={{background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'}}>
          <TrendingUp size={24} />
        </div>
        <div className="stat-content">
          <div className="stat-value">{stats.today}</div>
          <div className="stat-label">Сегодня</div>
        </div>
      </div>
    </div>
  );

  // Рендеринг регламента
  const renderRegulationCards = () => (
    <div style={{marginBottom: '2rem'}}>
      <div className="card">
        <h2 className="card-title">
          <Shield size={24} />
          Основные правила модерации
        </h2>
        <div className="card-content">
          {MODERATOR_GUIDELINES.coreRules.map((rule, i) => (
            <div key={i} className="guideline-item">
              <div className="guideline-title">{rule.title}</div>
              <div className="guideline-desc">{rule.description}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h2 className="card-title">
          <AlertCircle size={24} />
          Таблица наказаний
        </h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Код</th>
                <th>Нарушение</th>
                <th>Длительность</th>
              </tr>
            </thead>
            <tbody>
              {MODERATOR_GUIDELINES.punishments.map((p, i) => (
                <tr key={i}>
                  <td><span className="badge badge-code">{p.code}</span></td>
                  <td style={{color: 'var(--text)'}}>{p.violation}</td>
                  <td>{p.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h2 className="card-title">
          <AlertCircle size={24} style={{color: 'var(--warning)'}} />
          Система взысканий для модераторов
        </h2>
        <div className="card-content">
          <p>{MODERATOR_GUIDELINES.warnings}</p>
        </div>
      </div>
    </div>
  );

  // Улучшенный рендеринг логов [web:180][web:181][web:182]
  const renderLogsCards = () => (
    <>
      <h1 className="panel-title" style={{marginBottom: '1.5rem'}}>
        <FileText size={28} style={{marginRight: '0.5rem'}} />
        Журнал наказаний
      </h1>

      {/* Статистика */}
      {renderStats()}

      {/* Фильтры */}
      <div className="card" style={{marginBottom: '1.5rem', background: 'var(--card-hover)'}}>
        <div style={{display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end'}}>
          <form onSubmit={handleSearch} style={{flex: '1', minWidth: '250px'}}>
            <label className="form-label">
              <Search size={16} />
              Поиск по игроку
            </label>
            <div style={{display: 'flex', gap: '0.5rem'}}>
              <input
                type="text"
                className="form-input"
                placeholder="Введите ник игрока"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              />
              <button type="submit" className="btn btn-primary">
                Найти
              </button>
            </div>
          </form>

          <div style={{flex: '0 0 auto'}}>
            <label className="form-label">
              <Filter size={16} />
              Тип наказания
            </label>
            <div style={{display: 'flex', gap: '0.5rem'}}>
              <button 
                className={`btn ${filters.type === '' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => handleFilterChange('')}
              >
                Все
              </button>
              <button 
                className={`btn ${filters.type === 'ban' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => handleFilterChange('ban')}
              >
                Баны
              </button>
              <button 
                className={`btn ${filters.type === 'mute' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => handleFilterChange('mute')}
              >
                Муты
              </button>
            </div>
          </div>
          
          <button 
            className="btn btn-secondary" 
            onClick={loadPunishments} 
            style={{alignSelf: 'flex-end'}}
            disabled={loading}
          >
            <RefreshCw size={18} className={loading ? 'spinning' : ''} />
            Обновить
          </button>
        </div>
      </div>

      {/* Улучшенные карточки */}
      {loading ? (
        <div className="loading-state" style={{minHeight: '300px'}}>
          <RefreshCw size={32} className="spinning" />
          <p style={{fontSize: '1.1rem', marginTop: '1rem'}}>Загрузка логов...</p>
        </div>
      ) : punishments.length > 0 ? (
        <>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
            gap: '1.25rem',
            marginBottom: '1.5rem'
          }}>
            {punishments.map((p, idx) => (
              <div 
                key={p.id || idx} 
                className="punishment-card-v2"
                style={{
                  background: p.type === 'ban' 
                    ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(220, 38, 38, 0.1) 100%)'
                    : 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(37, 99, 235, 0.1) 100%)',
                  border: `2px solid ${p.type === 'ban' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`,
                  borderRadius: '12px',
                  padding: '1.25rem',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Декоративный элемент */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '100px',
                  height: '100px',
                  background: p.type === 'ban' 
                    ? 'radial-gradient(circle, rgba(239, 68, 68, 0.15) 0%, transparent 70%)'
                    : 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
                  pointerEvents: 'none'
                }} />

                {/* Заголовок с улучшенной иерархией [web:181] */}
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  marginBottom: '1rem',
                  position: 'relative'
                }}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1}}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      background: p.type === 'ban' 
                        ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                        : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: p.type === 'ban'
                        ? '0 4px 14px rgba(239, 68, 68, 0.4)'
                        : '0 4px 14px rgba(59, 130, 246, 0.4)',
                      flexShrink: 0
                    }}>
                      <Ban size={24} style={{color: 'white'}} />
                    </div>
                    <div style={{flex: 1, minWidth: 0}}>
                      <div style={{
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        color: 'var(--text)',
                        marginBottom: '0.25rem',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {p.player}
                      </div>
                      {(p.ipPort || p.ip_port) && (
                        <div style={{
                          fontSize: '0.75rem',
                          color: 'var(--text-secondary)',
                          fontFamily: 'monospace',
                          background: 'rgba(0, 0, 0, 0.1)',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          display: 'inline-block'
                        }}>
                          {p.ipPort || p.ip_port}
                        </div>
                      )}
                    </div>
                  </div>
                  <span style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    background: p.type === 'ban' 
                      ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                      : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    color: 'white',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                    flexShrink: 0
                  }}>
                    {p.type === 'ban' ? 'БАН' : 'МУТ'}
                  </span>
                </div>
                
                {/* Информация с четкими разделителями [web:180][web:182] */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}>
                  <div style={{
                    padding: '0.75rem',
                    background: 'var(--card-bg)',
                    borderRadius: '8px',
                    border: '1px solid var(--border)'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginBottom: '0.35rem',
                      color: 'var(--text-secondary)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      <FileText size={12} />
                      Причина
                    </div>
                    <div style={{
                      color: 'var(--text)',
                      fontSize: '0.95rem',
                      lineHeight: '1.4',
                      fontWeight: 500
                    }}>
                      {p.reason}
                    </div>
                  </div>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '0.75rem'
                  }}>
                    <div style={{
                      padding: '0.75rem',
                      background: 'var(--card-bg)',
                      borderRadius: '8px',
                      border: '1px solid var(--border)'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        marginBottom: '0.35rem',
                        color: 'var(--text-secondary)',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        textTransform: 'uppercase'
                      }}>
                        <Clock size={11} />
                        Срок
                      </div>
                      <div style={{
                        color: 'var(--text)',
                        fontSize: '0.9rem',
                        fontWeight: 700
                      }}>
                        {p.duration ? parseDuration(p.duration) : 'Не указано'}
                      </div>
                    </div>
                    
                    <div style={{
                      padding: '0.75rem',
                      background: 'var(--card-bg)',
                      borderRadius: '8px',
                      border: '1px solid var(--border)'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        marginBottom: '0.35rem',
                        color: 'var(--text-secondary)',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        textTransform: 'uppercase'
                      }}>
                        <Shield size={11} />
                        Модер
                      </div>
                      <div style={{
                        color: 'var(--text)',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {p.moderator || p.moderator_name || 'Неизвестно'}
                      </div>
                    </div>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    paddingTop: '0.5rem',
                    borderTop: '1px dashed var(--border)',
                    color: 'var(--text-secondary)',
                    fontSize: '0.8rem'
                  }}>
                    <Calendar size={12} />
                    {p.time || (p.created_at && formatDate(p.created_at)) || 
                     (p.timestamp && formatDate(p.timestamp)) || 'Неизвестно'}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{
            textAlign: 'center',
            color: 'var(--text-secondary)',
            fontSize: '0.9rem',
            marginTop: '1rem'
          }}>
            Показано {punishments.length} из {pagination.total} наказаний
          </div>

          {pagination.pages > 1 && (
            <div className="pagination">
              <button 
                className="btn btn-secondary"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                Назад
              </button>
              
              <div className="pagination-info">
                Страница {pagination.page} из {pagination.pages}
              </div>
              
              <button 
                className="btn btn-secondary"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
              >
                Вперёд
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="empty-state">
          <AlertCircle size={48} style={{color: 'var(--text-secondary)', opacity: 0.5}} />
          <p style={{fontSize: '1.1rem', marginTop: '1rem'}}>Нет наказаний</p>
          {filters.search && (
            <p style={{fontSize: '0.9rem', marginTop: '0.5rem', color: 'var(--text-secondary)'}}>
              По запросу "{filters.search}" ничего не найдено
            </p>
          )}
        </div>
      )}
    </>
  );

  return (
    <>
      <header className="header">
        <div className="container">
          <div className="header-content">
            <div className="logo" onClick={() => onNavigate('rules')}>
              <div className="logo-icon">
                <img src="./teefusion.svg" alt="TeeFusion Logo" />
              </div>
              <span>TEE<strong>FUSION</strong></span>
            </div>
            <div className="user-menu">
              <div className="user-info">
                <div className="user-avatar">{user.name[0]}</div>
                <div className="user-details">
                  <div className="user-name">{user.name}</div>
                  <div className="user-role">Модератор</div>
                </div>
              </div>
              <button className="btn btn-secondary" onClick={handleLogout}>
                <LogOut size={18} />
                Выйти
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="panel-layout">
        <div style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '2rem',
          borderBottom: '2px solid var(--border)',
          paddingBottom: '0.5rem'
        }}>
          <button
            onClick={() => setActiveTab('regulation')}
            style={{
              background: 'none',
              border: 'none',
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              fontWeight: activeTab === 'regulation' ? 600 : 400,
              color: activeTab === 'regulation' ? 'var(--primary)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'regulation' ? '3px solid var(--primary)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Shield size={20} />
            Регламент
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            style={{
              background: 'none',
              border: 'none',
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              fontWeight: activeTab === 'logs' ? 600 : 400,
              color: activeTab === 'logs' ? 'var(--primary)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'logs' ? '3px solid var(--primary)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <FileText size={20} />
            Журнал наказаний
          </button>
        </div>

        <div style={{display: 'flex', justifyContent: 'center', marginBottom: '2rem'}}>
          <button 
            className="btn btn-primary" 
            onClick={() => setShowPunishmentModal(true)}
            style={{padding: '0.75rem 2rem', fontSize: '1rem'}}
          >
            <Ban size={20} style={{marginRight: '0.5rem'}} />
            Выдать наказание
          </button>
        </div>

        {activeTab === 'regulation' ? (
          <>
            <div className="panel-header">
              <h1 className="panel-title">Регламент модерации</h1>
              <p className="panel-subtitle">{MODERATOR_GUIDELINES.introduction}</p>
            </div>
            {renderRegulationCards()}
          </>
        ) : (
          renderLogsCards()
        )}
      </div>

      {showPunishmentModal && (
        <PunishmentForm 
          onClose={() => setShowPunishmentModal(false)}
          onSuccess={() => {
            setPagination(prev => ({ ...prev, page: 1 }));
            if (activeTab === 'logs') {
              loadPunishments();
            }
            setShowPunishmentModal(false);
          }}
        />
      )}
    </>
  );
};

export default ModeratorPanel;
