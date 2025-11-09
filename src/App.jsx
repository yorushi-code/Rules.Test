// App.jsx
import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, Shield, Heart, Users, MessageCircle, HelpCircle } from 'lucide-react';
import './styles/App.css';

const App = () => {
  const [activeSection, setActiveSection] = useState('intro');
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const winScroll = document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      setScrollProgress((winScroll / height) * 100);

      const sections = ['intro', 'principles', 'players', 'moderators', 'faq'];
      for (const section of sections.reverse()) {
        const el = document.getElementById(section);
        if (el && el.getBoundingClientRect().top <= 150) {
          setActiveSection(section);
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.offsetTop - 100, behavior: 'smooth' });
  };

  return (
    <div className="app">
      <div className="progress-bar" style={{ width: `${scrollProgress}%` }} />
      
      <Header />
      <Hero />
      
      <main className="main">
        <Sidebar active={activeSection} onNavigate={scrollTo} />
        <Content />
      </main>
      
      <Footer />
    </div>
  );
};

const Header = () => (
  <header className="header">
    <div className="container">
      <div className="logo">
        <div className="logo-icon">
          <img src="./teefusion.svg" alt="TeeFusion Logo" />
        </div>
        <span>TEE<strong>FUSION</strong></span>
      </div>
    </div>
  </header>
);

const Hero = () => (
  <section className="hero">
    <div className="hero-glow" />
    <div className="container">
      <h1>Правила TeeFusion</h1>
      <p className="hero-subtitle">
        Мы создали эти правила не для ограничений, а чтобы <strong>защитить твой комфорт</strong> и сделать игру честной для каждого.
      </p>
      <div className="hero-stats">
        <div className="stat">
          <Shield size={24} />
          <span>Честная игра</span>
        </div>
        <div className="stat">
          <Heart size={24} />
          <span>Ламповая атмосфера</span>
        </div>
        <div className="stat">
          <Users size={24} />
          <span>Справедливость для всех</span>
        </div>
      </div>
    </div>
  </section>
);

const Sidebar = ({ active, onNavigate }) => (
  <aside className="sidebar">
    <h3>Содержание</h3>
    <nav>
      {[
        { id: 'intro', label: 'Зачем эти правила?' },
        { id: 'principles', label: 'Три принципа' },
        { id: 'players', label: 'Правила для игроков' },
        { id: 'moderators', label: 'Правила для модераторов' },
        { id: 'faq', label: 'Часто задаваемые вопросы' }
      ].map(item => (
        <div
          key={item.id}
          className={`nav-item ${active === item.id ? 'active' : ''}`}
          onClick={() => onNavigate(item.id)}
        >
          <ChevronRight size={16} />
          {item.label}
        </div>
      ))}
    </nav>
  </aside>
);

const Content = () => (
  <div className="content">
    <Section id="intro" title="Зачем эти правила?">
      <InfoBlock>
        <p>
          <strong>TeeFusion</strong> — это не просто сервер. Это <strong>твоё пространство</strong>, 
          где ты можешь играть, не отвлекаясь на <Term term="читеров">читеров</Term>, <Term term="токсиков">токсиков</Term> и хаос.
        </p>
        <p>
          Эти правила созданы, чтобы:
        </p>
        <ul>
          <li><strong>Защитить твоё время</strong> — Никаких <Term term="читеров">читеров</Term>, которые обесценивают твои победы</li>
          <li><strong>Сохранить честную игру</strong> — Твой скилл = твои достижения</li>
          <li><strong>Создать ламповую атмосферу</strong> — Общение без <Term term="токсичности">токсичности</Term> и драмы</li>
        </ul>
      </InfoBlock>

      <p>
        Мы понимаем: правила могут казаться ограничениями. Но на самом деле они <strong>дают тебе свободу</strong> — 
        свободу играть в комфортной среде, где каждый уважает других.
      </p>
    </Section>

    <Section id="principles" title="Три принципа TeeFusion">
      <div className="principles-grid">
        <PrincipleCard
          icon={<Shield size={32} />}
          title="Честность"
          description="Читы = обман себя. Настоящий скилл проявляется только в честной игре."
        />
        <PrincipleCard
          icon={<Heart size={32} />}
          title="Уважение"
          description="Токсичность убивает удовольствие от игры. Мы ценим атмосферу, где приятно находиться."
        />
        <PrincipleCard
          icon={<Users size={32} />}
          title="Порядок"
          description="Правила одинаковы для всех. Без исключений, без фаворитов."
        />
      </div>
    </Section>

    <Section id="players" title="Правила для игроков">
      <h3>Правила чата</h3>
      <InfoBlock variant="blue">
        <h4>Почему мы ограничиваем чат?</h4>
        <p>
          Чат — это часть игрового процесса. Когда в нём <Term term="спам">спам</Term>, оскорбления или <Term term="токсичность">токсичность</Term>, 
          это <strong>отвлекает от игры</strong> и портит атмосферу.
        </p>
        <p>
          <strong>Альтернатива:</strong> Хочешь пообщаться, пошутить, обсудить игру? 
          Добро пожаловать в наш <a href="https://t.me/Train_Gores" target="_blank" rel="noopener noreferrer">Telegram-чат</a>!
        </p>
      </InfoBlock>

      <RuleTable 
        title="Что нельзя в чате"
        rules={[
          { 
            violation: <span>Упоминание <Term term="читов">читов</Term></span>, 
            code: 'Ч.1', 
            punishment: '100-1000 сек мута (1.67 - 16.67 минут)', 
            why: 'Реклама читов провоцирует их использование' 
          },
          { 
            violation: <span><Term term="спам">Спам</Term>/флуд</span>, 
            code: 'Ч.2', 
            punishment: '100-1250 сек мута (1.67 - 20.83 минут)', 
            why: 'Спам мешает нормальному общению' 
          },
          { 
            violation: <span>Оскорбления/<Term term="токсичность">токсичность</Term>/провокации</span>, 
            code: 'Ч.3', 
            punishment: '100-2500 сек мута (1.67 - 41.67 минут)', 
            why: 'Оскорбления создают токсичную атмосферу, провокации разжигают конфликты' 
          }
        ]}
      />

      <h3>Баны (серьёзные нарушения)</h3>
      <InfoBlock variant="red">
        <h4>Почему мы баним?</h4>
        <p>
          Бан получают за грубые нарушения: использование <Term term="читов">читов</Term>, обход бана, 
          нечестный <Term term="фарм">фарм</Term> и попытки взлома. 
          Эти действия <strong>разрушают доверие</strong> и портят игру для всех остальных.
        </p>
      </InfoBlock>

      <RuleTable 
        title="Что приводит к бану"
        rules={[
          { 
            violation: <span>Использование <Term term="читов">читов</Term></span>, 
            code: 'Б.1', 
            punishment: '10000 минут', 
            why: 'Читы обесценивают достижения честных игроков' 
          },
          { 
            violation: 'Обход бана', 
            code: 'Б.2', 
            punishment: 'Удвоение срока', 
            why: 'Игнорирование наказания = неуважение к правилам' 
          },
          { 
            violation: <span>Нечестный <Term term="фарм">фарм</Term> валюты</span>, 
            code: 'Б.3', 
            punishment: '3000 минут + обнуление', 
            why: 'Накрутка прогресса = обман системы' 
          },
          { 
            violation: <span>Попытки взлома (Взломы и передача аккаунтов, <Term term="ddos">DDoS</Term>, причинение вреда серверам)</span>, 
            code: 'Б.4', 
            punishment: 'Перманентный бан', 
            why: 'Угроза безопасности всего сервера, нарушение экономики, нарушение работы сервиса' 
          }
        ]}
      />

      <InfoBlock variant="green">
        <h4>Я считаю, что модерация ошиблась. Что мне делать?</h4>
        <p>
          Мы понимаем: ошибки случаются. Если считаешь, что наказание было несправедливым, 
          ты можешь <strong>подать апелляцию</strong> в нашем <a href="https://t.me/Train_Gores" target="_blank" rel="noopener noreferrer">Telegram</a>.
        </p>
      </InfoBlock>
    </Section>

    <Section id="moderators" title="Правила для модераторов">
      <InfoBlock variant="purple">
        <h4>Для модераторов</h4>
        <p>
          <strong>Модерация</strong> — это привилегия, повод для гордости от причастности к развитию проекта, его поддержке и личного вклада. 
          А также <strong>личной ответственности и обязанностей</strong>, как представителя команды <strong>TeeFusion</strong>.
        </p>
        <p style={{marginTop: '1rem', fontStyle: 'italic'}}>
          © Zavo. Директор команды TeeFusion.
        </p>
      </InfoBlock>

      <h3>Обязанности модератора</h3>
      <div className="mod-duties">
        <ModDuty number="1" title="Оперативность">
          <strong>Правило 5 минут:</strong> Наказание должно быть выдано в течение 5 минут 
          после обнаружения нарушения. Задержка = бездействие.
        </ModDuty>
        
        <ModDuty number="2" title="Справедливость">
          <strong>Никакого фаворитизма:</strong> Друг нарушил правило? Выдавай наказание. 
          Правила одинаковы для всех.
        </ModDuty>
        
        <ModDuty number="3" title="Документирование">
          <strong>Записывай всё:</strong> Обнаружил бага? Зафиксируй, выдай наказание, сообщи разработчикам.
        </ModDuty>
        
        <ModDuty number="4" title="Уважение">
          <strong>Ты — пример:</strong> Оскорбления, <Term term="токсичность">токсичность</Term>, 
          абуз команд — для модератора это конец сотрудничества.
        </ModDuty>
      </div>

      <h3>Что запрещено модераторам</h3>
      <RuleTable 
        title="Нарушения модераторов"
        rules={[
          { 
            violation: 'Неуважение к игрокам', 
            code: 'М.1', 
            punishment: 'Предупреждение', 
            why: 'Модератор обязан быть примером' 
          },
          { 
            violation: 'Злоупотребление полномочиями', 
            code: 'М.2', 
            punishment: 'Выговор', 
            why: 'Абуз команд разрушает доверие' 
          },
          { 
            violation: 'Фаворитизм', 
            code: 'М.3', 
            punishment: 'Предупреждение', 
            why: 'Правила должны быть равны для всех' 
          },
          { 
            violation: 'Бездействие', 
            code: 'М.4', 
            punishment: 'Предупреждение → Выговор', 
            why: 'Модератор, который не работает — не модератор' 
          },
          { 
            violation: 'Необоснованные обвинения', 
            code: 'М.5', 
            punishment: 'Предупреждение', 
            why: 'Ложные обвинения в читерстве без доказательств недопустимы' 
          }
        ]}
      />

      <InfoBlock variant="red">
        <h4>Система наказаний для модераторов</h4>
        <div style={{marginTop: '1rem'}}>
          <p><strong>Предупреждение</strong> (устное замечание):</p>
          <ul style={{marginLeft: '1.5rem', marginTop: '0.5rem'}}>
            <li>Копится до <strong>3 предупреждений = 1 Выговор</strong></li>
            <li>Не ограничивает доступ к <Term term="rcon">RCon</Term></li>
          </ul>
        </div>
        <div style={{marginTop: '1.5rem'}}>
          <p><strong>Выговор</strong> (официальное взыскание):</p>
          <ul style={{marginLeft: '1.5rem', marginTop: '0.5rem'}}>
            <li><strong>Отзыв прав на 3 суток</strong> (без доступа к <Term term="rcon">RCon</Term>)</li>
            <li>Срок действия: <strong>3 месяца</strong></li>
            <li><strong>3 активных выговора</strong> или <strong>5 выговоров за всё время</strong> = прекращение сотрудничества</li>
          </ul>
        </div>
      </InfoBlock>
    </Section>

    <Section id="faq" title="Часто задаваемые вопросы">
      <FAQ 
        question="Как работает система наказаний для модераторов?"
        answer={
          <div>
            <p><strong>Предупреждение:</strong></p>
            <ul style={{marginLeft: '1.5rem', marginBottom: '1rem'}}>
              <li>Выдаётся за мелкие нарушения</li>
              <li>3 предупреждения = 1 Выговор</li>
              <li>Не влияет на доступ к <Term term="rcon">RCon</Term></li>
            </ul>
            
            <p><strong>Выговор:</strong></p>
            <ul style={{marginLeft: '1.5rem', marginBottom: '1rem'}}>
              <li>Отзыв прав на 3 суток</li>
              <li>Срок действия: 3 месяца</li>
              <li>3 активных выговора или 5 за всё время = увольнение</li>
            </ul>
            
            <p><strong>Пример:</strong> Модератор получил 2 предупреждения (ничего не происходит). 
            Получил 3-е предупреждение → автоматически получает Выговор → теряет доступ к <Term term="rcon">RCon</Term> на 3 суток.</p>
          </div>
        }
      />
      
      <FAQ 
        question="Что делать, если меня несправедливо забанили?"
        answer="Подай апелляцию в нашем Telegram-чате. Укажи ник, причину бана и почему считаешь его несправедливым. Мы рассмотрим твою заявку в течение 24 часов."
      />
      
      <FAQ 
        question="Можно ли обсуждать игру в чате?"
        answer="Да! Обсуждение игры, стратегий, помощь новичкам — всё это приветствуется. Запрещены только оскорбления, спам и токсичность."
      />
      
      <FAQ 
        question="Почему модераторы не отвечают?"
        answer={
          <span>
            Модераторы обязаны реагировать на нарушения в течение 5 минут. Если модератор бездействует, 
            сообщи об этом в <a href="https://t.me/Train_Gores" target="_blank" rel="noopener noreferrer">Telegram</a> — 
            это серьёзное нарушение, которое карается Предупреждением.
          </span>
        }
      />
      
      <FAQ 
        question="Где можно пообщаться вне игры?"
        answer={
          <span>
            Добро пожаловать в наш <a href="https://t.me/Train_Gores" target="_blank" rel="noopener noreferrer">Telegram-чат</a>! 
            Там можно шутить, обсуждать игру и просто общаться.
          </span>
        }
      />
    </Section>
  </div>
);

const Footer = () => (
  <footer className="footer">
    <div className="container">
      <div className="footer-brand">
        <div className="logo-icon">
          <img src="./teefusion.svg" alt="TeeFusion Logo" />
        </div>
        <span>TEE<strong>FUSION</strong></span>
      </div>
      <div className="footer-links">
        <a href="https://t.me/Train_Gores" target="_blank" rel="noopener noreferrer">
          <MessageCircle size={18} />
          Telegram
        </a>
      </div>
      <p className="footer-text">
        TeeFusion — независимый проект, созданный для тех, кто ценит честную игру и комфортную атмосферу.
      </p>
      <p className="footer-text">
        © <strong>TeeFusion</strong> 2025. Все права защищены.
      </p>
    </div>
  </footer>
);

// Utility Components
const Section = ({ id, title, children }) => (
  <section id={id} className="section">
    <h2>{title}</h2>
    {children}
  </section>
);

const InfoBlock = ({ children, variant = 'default' }) => (
  <div className={`info-block info-block-${variant}`}>
    {children}
  </div>
);

const PrincipleCard = ({ icon, title, description }) => (
  <div className="principle-card">
    <div className="principle-icon">{icon}</div>
    <h3>{title}</h3>
    <p>{description}</p>
  </div>
);

const RuleTable = ({ title, rules }) => (
  <div className="rule-table">
    <h4>{title}</h4>
    <table>
      <thead>
        <tr>
          <th>Код</th>
          <th>Нарушение</th>
          <th>Наказание</th>
          <th>Почему запрещено</th>
        </tr>
      </thead>
      <tbody>
        {rules.map((rule, i) => (
          <tr key={i}>
            <td><span className="rule-code">{rule.code}</span></td>
            <td>{rule.violation}</td>
            <td>{rule.punishment}</td>
            <td className="rule-why">{rule.why}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const ModDuty = ({ number, title, children }) => (
  <div className="mod-duty">
    <div className="mod-duty-number">{number}</div>
    <div>
      <h4>{title}</h4>
      <p>{children}</p>
    </div>
  </div>
);

const FAQ = ({ question, answer }) => (
  <div className="faq-item">
    <h4>{question}</h4>
    <p>{answer}</p>
  </div>
);

// Tooltip Component
const Term = ({ term, children }) => {
  const [show, setShow] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);

  const definitions = {
    'читов': 'Программы или модификации, дающие нечестное преимущество в игре',
    'читеров': 'Игроки, использующие программы для нечестного преимущества',
    'токсичность': 'Оскорбления, провокации, негативное поведение, портящее атмосферу',
    'токсиков': 'Игроки, которые оскорбляют других и создают неприятную атмосферу',
    'спам': 'Повторяющиеся однотипные сообщения, засоряющие чат',
    'фарм': 'Искусственное накручивание игровой валюты или прогресса',
    'rcon': 'Remote Console — панель управления сервером для модераторов',
    'ddos': 'Атака на сервер большим количеством запросов для его отключения'
  };

  const handleMouseEnter = () => {
    if (triggerRef.current && tooltipRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      let left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
      let top = triggerRect.top - tooltipRect.height - 12;
      
      const padding = 16;
      if (left < padding) {
        left = padding;
      } else if (left + tooltipRect.width > viewportWidth - padding) {
        left = viewportWidth - tooltipRect.width - padding;
      }
      
      if (top < padding) {
        top = triggerRect.bottom + 12;
      }
      
      if (top + tooltipRect.height > viewportHeight - padding) {
        top = viewportHeight - tooltipRect.height - padding;
      }
      
      setPosition({ top, left });
    }
    setShow(true);
  };

  const handleMouseLeave = () => {
    setShow(false);
  };

  return (
    <span className="term-wrapper">
      <span 
        ref={triggerRef}
        className="term"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
        <HelpCircle size={14} className="term-icon" />
      </span>
      <span 
        ref={tooltipRef}
        className={`tooltip ${show ? 'show' : ''}`}
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`
        }}
      >
        {definitions[term] || 'Определение недоступно'}
      </span>
    </span>
  );
};

export default App;