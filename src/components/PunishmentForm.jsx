import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { sendPunishmentToTelegram } from '../services/telegram';
import { X, Ban, MessageSquare, Check, AlertCircle } from 'lucide-react';

const PunishmentForm = ({ onClose }) => {
  const { user } = useAuth();
  const [player, setPlayer] = useState('');
  const [ip, setIp] = useState('');
  const [type, setType] = useState('mute');
  const [reason, setReason] = useState('');
  const [duration, setDuration] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const punishmentData = {
      player,
      ip,
      type,
      reason,
      duration
    };

    // Отправка в Telegram
    const result = await sendPunishmentToTelegram(punishmentData, user.name);
    
    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } else {
      setError(result.error || 'Ошибка отправки в Telegram');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Выдать наказание</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {success && (
            <div className="form-success">
              <Check size={18} />
              Наказание успешно выдано и отправлено в Telegram!
            </div>
          )}

          {error && (
            <div className="form-error">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Никнейм игрока</label>
            <input
              type="text"
              className="form-input"
              value={player}
              onChange={(e) => setPlayer(e.target.value)}
              placeholder="Введите ник игрока"
              required
              disabled={success}
            />
          </div>

          <div className="form-group">
            <label className="form-label">IP-адрес игрока</label>
            <input
              type="text"
              className="form-input"
              value={ip}
              onChange={(e) => setIp(e.target.value)}
              placeholder="Введите IP-адрес (например: 192.168.1.1)"
              required
              disabled={success}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Тип наказания</label>
              <select 
                className="form-input"
                value={type}
                onChange={(e) => setType(e.target.value)}
                disabled={success}
              >
                <option value="mute">Мут</option>
                <option value="ban">Бан</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Длительность</label>
              <input
                type="text"
                className="form-input"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder={type === 'mute' ? 'Секунды' : 'Минуты'}
                required
                disabled={success}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Причина</label>
            <textarea
              className="form-input"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Опишите причину наказания"
              required
              disabled={success}
            />
          </div>

          <div className="warning-box">
            <p>⚠️ Наказание будет отправлено в Telegram-топик с логами. Убедитесь в правильности данных.</p>
          </div>

          <div style={{display: 'flex', gap: '1rem', marginTop: '1.5rem'}}>
            <button type="submit" className="btn btn-primary" style={{flex: 1}} disabled={success}>
              {type === 'mute' ? <MessageSquare size={18} /> : <Ban size={18} />}
              Выдать наказание
            </button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PunishmentForm;