import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { LogOut, UserPlus, Trash2, Ban, RefreshCw, AlertCircle, Search, Filter, BarChart3 } from 'lucide-react';
import ModeratorForm from '../components/ModeratorForm';
import PunishmentForm from '../components/PunishmentForm';

const AdminPanel = ({ onNavigate }) => {
  const { user, logout } = useAuth();
  const [moderators, setModerators] = useState([]);
  const [punishments, setPunishments] = useState([]);
  const [stats, setStats] = useState(null);
  const [showModeratorModal, setShowModeratorModal] = useState(false);
  const [showPunishmentModal, setShowPunishmentModal] = useState(false);
  const [loading, setLoading] = useState(false);
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
    loadModerators();
    loadPunishments();
    loadStats();
  }, []);

  useEffect(() => {
    loadPunishments();
  }, [pagination.page, filters.type]);

  const loadModerators = async () => {
    try {
      const result = await api.getModerators();
      if (result.success) {
        setModerators(result.moderators);
      }
    } catch (error) {
      console.error('Error loading moderators:', error);
    }
  };

  const loadPunishments = async () => {
    setLoading(true);
    try {
      const result = await api.getPunishments(
        pagination.page,
        pagination.limit,
        filters.search,
        filters.type
      );
      
      if (result.success) {
        setPunishments(result.punishments);
        setPagination(result.pagination);
      }
    } catch (error) {
      console.error('Error loading punishments:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const result = await api.getStats();
      if (result.success) {
        setStats(result.stats);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleDeleteModerator = async (id, name) => {
    if (confirm(`Вы уверены, что хотите удалить модератора "${name}"?`)) {
      try {
        const result = await api.deleteModerator(id);
        if (result.success) {
          loadModerators();
        } else {
          alert(result.error || 'Ошибка удаления модератора');
        }
      } catch (error) {
        alert('Ошибка при удалении модератора');
      }
    }
  };

  const handleDeletePunishment = async (id) => {
    if (confirm('Вы уверены, что хотите удалить это наказание?')) {
      try {
        const result = await api.deletePunishment(id);
        if (result.success) {
          loadPunishments();
          loadStats();
        } else {
          alert(result.error || 'Ошибка удаления наказания');
        }
      } catch (error) {
        alert('Ошибка при удалении наказания');
      }
    }
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
                  <div className="user-role">Администратор</div>
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
        <div className="panel-header">
          <h1 className="panel-title">Панель администратора</h1>
          <p className="panel-subtitle">Управление модераторами и просмотр статистики</p>
        </div>

        {/* Статистика */}
        {stats && (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon" style={{background: 'rgba(59, 130, 246, 0.1)'}}>
                <AlertCircle size={24} style={{color: '#3b82f6'}} />
              </div>
              <div className="stat-info">
                <div className="stat-label">Всего наказаний</div>
                <div className="stat-value">{stats.totalPunishments}</div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon" style={{background: 'rgba(239, 68, 68, 0.1)'}}>
                <Ban size={24} style={{color: '#ef4444'}} />
              </div>
              <div className="stat-info">
                <div className="stat-label">Баны</div>
                <div className="stat-value">{stats.totalBans}</div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon" style={{background: 'rgba(249, 115, 22, 0.1)'}}>
                <AlertCircle size={24} style={{color: '#f97316'}} />
              </div>
              <div className="stat-info">
                <div className="stat-label">Муты</div>
                <div className="stat-value">{stats.totalMutes}</div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon" style={{background: 'rgba(16, 185, 129, 0.1)'}}>
                <UserPlus size={24} style={{color: '#10b981'}} />
              </div>
              <div className="stat-info">
                <div className="stat-label">Модераторы</div>
                <div className="stat-value">{stats.totalModerators}</div>
              </div>
            </div>
          </div>
        )}

        <div style={{display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '2rem', flexWrap: 'wrap'}}>
          <button className="btn btn-primary" onClick={() => setShowModeratorModal(true)}>
            <UserPlus size={18} />
            Добавить модератора
          </button>
          <button className="btn btn-primary" onClick={() => setShowPunishmentModal(true)}>
            <Ban size={18} />
            Выдать наказание
          </button>
          <button className="btn btn-secondary" onClick={() => {
            loadPunishments();
            loadStats();
          }}>
            <RefreshCw size={18} className={loading ? 'spinning' : ''} />
            Обновить
          </button>
        </div>

        {/* Список модераторов */}
        <div className="card">
          <h2 className="card-title">
            <UserPlus size={24} />
            Список модераторов ({moderators.length})
          </h2>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Имя</th>
                  <th>Логин</th>
                  <th>Дата добавления</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {moderators.map(mod => (
                  <tr key={mod.id}>
                    <td style={{color: 'var(--text)', fontWeight: 600}}>{mod.name}</td>
                    <td>{mod.username}</td>
                    <td>{formatDate(mod.created_at)}</td>
                    <td>
                      <button 
                        className="btn btn-danger" 
                        style={{padding: '0.25rem 0.75rem', fontSize: '0.85rem'}}
                        onClick={() => handleDeleteModerator(mod.id, mod.name)}
                      >
                        <Trash2 size={16} />
                        Удалить
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Фильтры и поиск */}
        <div className="card" style={{marginBottom: '1.5rem'}}>
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
          </div>
        </div>

        {/* Логи наказаний */}
        <div className="card">
          <h2 className="card-title">
            <AlertCircle size={24} />
            История наказаний ({pagination.total})
          </h2>
          
          {loading ? (
            <div className="loading-state">
              <RefreshCw size={24} className="spinning" />
              <p>Загрузка логов...</p>
            </div>
          ) : punishments.length > 0 ? (
            <>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Игрок</th>
                      <th>Тип</th>
                      <th>Причина</th>
                      <th>Длительность</th>
                      <th>Модератор</th>
                      <th>Дата</th>
                      <th>Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {punishments.map(p => (
                      <tr key={p.id}>
                        <td style={{color: 'var(--text)', fontWeight: 600}}>
                          {p.player}
                          {p.ip_port && (
                            <div style={{fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem'}}>
                              {p.ip_port}
                            </div>
                          )}
                        </td>
                        <td>
                          <span className={`badge badge-${p.type}`}>
                            {p.type === 'ban' ? 'Бан' : 'Мут'}
                          </span>
                        </td>
                        <td style={{maxWidth: '300px'}}>{p.reason}</td>
                        <td>{formatDuration(p.duration)}</td>
                        <td>{p.moderator_name}</td>
                        <td style={{fontSize: '0.9rem', color: 'var(--text-secondary)'}}>
                          {formatDate(p.created_at)}
                        </td>
                        <td>
                          <button 
                            className="btn btn-danger" 
                            style={{padding: '0.25rem 0.5rem', fontSize: '0.85rem'}}
                            onClick={() => handleDeletePunishment(p.id)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Пагинация */}
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
              <AlertCircle size={48} />
              <p>Нет наказаний</p>
              {filters.search && (
                <p style={{fontSize: '0.9rem', marginTop: '0.5rem'}}>
                  По запросу "{filters.search}" ничего не найдено
                </p>
              )}
            </div>
          )}
        </div>

        {/* Топ модераторов */}
        {stats && stats.topModerators.length > 0 && (
          <div className="card">
            <h2 className="card-title">
              <BarChart3 size={24} />
              Топ модераторов по активности
            </h2>
            <div className="top-moderators">
              {stats.topModerators.map((mod, index) => (
                <div key={mod.name} className="top-moderator-item">
                  <div className="moderator-rank">#{index + 1}</div>
                  <div className="moderator-name">{mod.name}</div>
                  <div className="moderator-count">{mod.count} наказаний</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showModeratorModal && (
        <ModeratorForm 
          onClose={() => setShowModeratorModal(false)} 
          onSuccess={() => {
            loadModerators();
            loadStats();
            setShowModeratorModal(false);
          }}
        />
      )}

      {showPunishmentModal && (
        <PunishmentForm 
          onClose={() => setShowPunishmentModal(false)}
          onSuccess={() => {
            loadPunishments();
            loadStats();
            setShowPunishmentModal(false);
          }}
        />
      )}

      <style>{`
        .spinning {
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 1.5rem;
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .stat-icon {
          width: 56px;
          height: 56px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-info {
          flex: 1;
        }

        .stat-label {
          font-size: 0.9rem;
          color: var(--text-secondary);
          margin-bottom: 0.25rem;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 700;
          color: var(--text);
        }

        .top-moderators {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .top-moderator-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: var(--surface);
          border-radius: 8px;
          border: 1px solid var(--border);
        }

        .moderator-rank {
          width: 32px;
          height: 32px;
          background: var(--primary);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 0.85rem;
        }

        .moderator-name {
          flex: 1;
          font-weight: 600;
          color: var(--text);
        }

        .moderator-count {
          color: var(--text-secondary);
          font-size: 0.9rem;
        }

        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 1rem;
          margin-top: 1.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--border);
        }

        .pagination-info {
          padding: 0.5rem 1rem;
          color: var(--text-secondary);
          font-size: 0.9rem;
        }

        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .badge-ban {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }

        .badge-mute {
          background: rgba(249, 115, 22, 0.1);
          color: #f97316;
        }

        .loading-state, .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem;
          color: var(--text-secondary);
        }

        .loading-state svg, .empty-state svg {
          margin-bottom: 1rem;
          opacity: 0.5;
        }

        .table-container {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th {
          text-align: left;
          padding: 0.75rem;
          background: var(--surface);
          color: var(--text-secondary);
          font-weight: 600;
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 2px solid var(--border);
        }

        td {
          padding: 1rem 0.75rem;
          border-bottom: 1px solid var(--border);
          color: var(--text-secondary);
        }

        tr:hover td {
          background: var(--surface);
        }
      `}</style>
    </>
  );
};

export default AdminPanel;