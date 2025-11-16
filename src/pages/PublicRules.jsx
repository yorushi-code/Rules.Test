import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, Shield, Heart, Users, HelpCircle } from 'lucide-react';
import { SiDiscord, SiTelegram } from 'react-icons/si';

const PublicRules = ({ onNavigate }) => {
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
    <>
      <div className="progress-bar" style={{ width: `${scrollProgress}%` }} />
      
      <header className="header">
        <div className="container">
          <div className="header-content">
            <div className="logo">
              <div className="logo-icon">
                <img src="./teefusion.svg" alt="TeeFusion Logo" />
              </div>
              <span>TEE<strong>FUSION</strong></span>
            </div>
            <button className="btn btn-primary" onClick={() => onNavigate('login')}>
              Вход для модераторов
            </button>
          </div>
        </div>
      </header>

      <section className="hero">
        <div className="hero-glow" />
        <div className="container">
          <h1>Правила TrainGores</h1>
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

      <main className="main">
        <aside className="sidebar">
          <h3>Содержание</h3>
          <nav>
            {[
              { id: 'intro', label: 'Зачем эти правила?' },
              { id: 'principles', label: 'Три принципа' },
              { id: 'players', label: 'Правила для игроков' },
              { id: 'moderators', label: 'Правила для модераторов' },
              { id: 'faq', label: 'Часто задаваемые вопросы' }
            ].map((item, i) => (
              <div
                key={item.id}
                style={{ '--i': i }}
                className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
                onClick={() => scrollTo(item.id)}
              >
                <ChevronRight size={16} />
                {item.label}
              </div>
            ))}
          </nav>
        </aside>

        <div className="content">
          <Section id="intro" title="Зачем эти правила?">
            <InfoBlock>
              <p>
                <strong>TrainGores</strong> — это не просто сервер. Это <strong>твоё пространство</strong>, 
                где ты можешь играть, не отвлекаясь на <Term term="читеров">читеров</Term>, <Term term="токсиков">токсиков</Term> и хаос.
              </p>
              <p>Эти правила созданы, чтобы:</p>
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
              {[
                {
                  icon: <Shield size={32} />,
                  title: 'Честность',
                  description: 'Читы = обман себя. Настоящий скилл проявляется только в честной игре.',
                  index: 0
                },
                {
                  icon: <Heart size={32} />,
                  title: 'Уважение',
                  description: 'Токсичность убивает удовольствие от игры. Мы ценим атмосферу, где приятно находиться.',
                  index: 1
                },
                {
                  icon: <Users size={32} />,
                  title: 'Порядок',
                  description: 'Правила одинаковы для всех. Без исключений, без фаворитов.',
                  index: 2
                }
              ].map((principle) => (
                <PrincipleCard
                  key={principle.index}
                  icon={principle.icon}
                  title={principle.title}
                  description={principle.description}
                  index={principle.index}
                />
              ))}
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
                Добро пожаловать в наш <a href="https://t.me/train_gores_chat" target="_blank" rel="noopener noreferrer">Telegram-чат</a>!
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
                  violation: <span><Term term="спам">Спам</Term>/<Term term="флуд">флуд</Term></span>, 
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
                Бан получают за грубые нарушения: использование <Term term="читов">читов</Term>, <Term term="обход бана">обход бана</Term>, 
                нечестный <Term term="фарм">фарм</Term> и попытки <Term term="взлома">взлома</Term>. 
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
                  violation: <span><Term term="обход бана">Обход бана</Term></span>, 
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
                  violation: <span>Попытки <Term term="взлома">взлома</Term> (Взломы и передача аккаунтов, <Term term="ddos">DDoS</Term>, причинение вреда серверам)</span>, 
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
                ты можешь <strong>подать <Term term="апелляцию">апелляцию</Term></strong> в нашем <a href="https://t.me/Train_Gores" target="_blank" rel="noopener noreferrer">Telegram</a>.
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
              {[
                {
                  number: '1',
                  title: 'Оперативность',
                  content: (
                    <>
                      <strong>Правило 5 минут:</strong> Наказание должно быть выдано в течение 5 минут 
                      после обнаружения нарушения. Задержка = бездействие.
                    </>
                  ),
                  index: 0
                },
                {
                  number: '2',
                  title: 'Справедливость',
                  content: (
                    <>
                      <strong>Никакого <Term term="фаворитизма">фаворитизма</Term>:</strong> Друг нарушил правило? Выдавай наказание. 
                      Правила одинаковы для всех.
                    </>
                  ),
                  index: 1
                },
                {
                  number: '3',
                  title: 'Документирование',
                  content: (
                    <>
                      <strong>Записывай всё:</strong> Обнаружил бага? Зафиксируй, выдай наказание, сообщи разработчикам.
                    </>
                  ),
                  index: 2
                },
                {
                  number: '4',
                  title: 'Уважение',
                  content: (
                    <>
                      <strong>Ты — пример:</strong> Оскорбления, <Term term="токсичность">токсичность</Term>, 
                      <Term term="абуз">абуз</Term> команд — для модератора это конец сотрудничества.
                    </>
                  ),
                  index: 3
                }
              ].map((duty) => (
                <ModDuty
                  key={duty.number}
                  number={duty.number}
                  title={duty.title}
                  index={duty.index}
                >
                  {duty.content}
                </ModDuty>
              ))}
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
                  violation: <span>Злоупотребление полномочиями (<Term term="абуз">абуз</Term>)</span>, 
                  code: 'М.2', 
                  punishment: 'Выговор', 
                  why: 'Абуз команд разрушает доверие' 
                },
                { 
                  violation: <Term term="фаворитизм">Фаворитизм</Term>, 
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
            {[
              {
                question: 'Как работает система наказаний для модераторов?',
                answer: (
                  <>
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
                  </>
                ),
                index: 0
              },
              {
                question: 'Что делать, если меня несправедливо забанили?',
                answer: (
                  <>
                    Подай <Term term="апелляцию">апелляцию</Term> в нашем Telegram-чате. Укажи ник, причину бана и почему считаешь его несправедливым. 
                    Мы рассмотрим твою заявку в течение 24 часов.
                  </>
                ),
                index: 1
              },
              {
                question: 'Можно ли обсуждать игру в чате?',
                answer: 'Да! Обсуждение игры, стратегий, помощь новичкам — всё это приветствуется. Запрещены только оскорбления, спам и токсичность.',
                index: 2
              },
              {
                question: 'Почему модераторы не отвечают?',
                answer: (
                  <>
                    Модераторы обязаны реагировать на нарушения в течение 5 минут. Если модератор бездействует, 
                    сообщи об этом в <a href="https://t.me/train_gores_chat" target="_blank" rel="noopener noreferrer">Telegram-чате</a> — 
                    это серьёзное нарушение, которое карается Предупреждением.
                  </>
                ),
                index: 3
              },
              {
                question: 'Где можно пообщаться вне игры?',
                answer: (
                  <>
                    Добро пожаловать в наш <a href="https://t.me/train_gores_chat" target="_blank" rel="noopener noreferrer">Telegram-чат</a>! 
                    Там можно шутить, обсуждать игру и просто общаться.
                  </>
                ),
                index: 4
              }
            ].map((faq) => (
              <FAQ 
                key={faq.index}
                question={faq.question} 
                answer={faq.answer}
                index={faq.index}
              />
            ))}
          </Section>
        </div>
      </main>

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
              <SiTelegram size={18} />
              Telegram
            </a>
            <a href="https://t.me/train_gores_chat" target="_blank" rel="noopener noreferrer">
              <SiTelegram size={18} />
              Telegram-чат
            </a>
            <a href="https://t.me/TeeFusionTW" target="_blank" rel="noopener noreferrer">
              <SiTelegram size={18} />
              TeeFusion Community
            </a>
            <a href="https://discord.com/invite/teefusion-ranked-teeworlds-ddnet-1244684970841079931" target="_blank" rel="noopener noreferrer">
              <SiDiscord size={18} />
              TeeFusion Discord
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
    </>
  );
};

// ============================================================================
// UTILITY COMPONENTS
// ============================================================================

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

const PrincipleCard = ({ icon, title, description, index }) => (
  <div className="principle-card" style={{ '--i': index }}>
    <div className="principle-icon">{icon}</div>
    <h3>{title}</h3>
    <p>{description}</p>
  </div>
);

const RuleTable = ({ title, rules }) => (
  <div className="rule-table">
    <h4>{title}</h4>
    <div className="table-container">
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
            <tr key={i} style={{ '--i': i }}>
              <td><span className="rule-code">{rule.code}</span></td>
              <td>{rule.violation}</td>
              <td>{rule.punishment}</td>
              <td className="rule-why">{rule.why}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const ModDuty = ({ number, title, children, index }) => (
  <div className="mod-duty" style={{ '--i': index }}>
    <div className="mod-duty-number">{number}</div>
    <div>
      <h4>{title}</h4>
      <div>{children}</div>
    </div>
  </div>
);

const FAQ = ({ question, answer, index }) => (
  <div className="faq-item" style={{ '--i': index }}>
    <h4>{question}</h4>
    <div className="faq-answer">{answer}</div>
  </div>
);

// ============================================================================
// TERM COMPONENT - Тултипы с правильным позиционированием
// ============================================================================

const Term = ({ term, children }) => {
  const [show, setShow] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isAbove, setIsAbove] = useState(true);
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);

  const definitions = {
    'чит': 'Программа или модификация, дающая нечестное преимущество в игре',
    'читер': 'Игрок, использующий программы для получения нечестного преимущества',
    'токсик': 'Игрок, который оскорбляет других и создаёт неприятную атмосферу',
    'токсичность': 'Оскорбления, провокации, негативное поведение, портящее атмосферу',
    'спам': 'Повторяющиеся однотипные сообщения, засоряющие чат',
    'флуд': 'Множество бессмысленных сообщений подряд, мешающих общению',
    'фарм': 'Искусственное накручивание игровой валюты или прогресса',
    'rcon': 'Remote Console — панель управления сервером для администраторов и модераторов',
    'ddos': 'DDoS-атака — атака на сервер большим количеством запросов для его отключения',
    'взлом': 'Несанкционированный доступ к системам сервера или аккаунтам',
    'обход': 'Попытка обойти наказание, создав новый аккаунт или используя VPN',
    'фаворитизм': 'Предоставление преимуществ или снисходительность к определённым игрокам',
    'абуз': 'Злоупотребление полномочиями или игровыми механиками не по назначению',
    'апелляция': 'Официальное обжалование наказания с предоставлением аргументов'
  };

  const normalizeWord = (word) => {
    const normalized = word.toLowerCase().trim();
    
    if (definitions[normalized]) {
      return definitions[normalized];
    }
    
    const withoutEnding = normalized
      .replace(/(ов|ам|ами|ах|ом|ой|ою|ем|ей|ею|ёй|её|их|им|ими|ый|ая|ое|ые|ого|его|ому|ему)$/i, '')
      .replace(/(а|у|ы|е|и|о|я|ю|ё)$/i, '');
    
    for (const [key, value] of Object.entries(definitions)) {
      if (key.startsWith(withoutEnding) || withoutEnding.startsWith(key)) {
        return value;
      }
    }
    
    return 'Определение не найдено для этого термина';
  };

  const updatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const trigger = triggerRef.current.getBoundingClientRect();
    const tooltip = tooltipRef.current.getBoundingClientRect();
    
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    
    const gap = 12;
    const padding = 10;
    
    // Центрируем по горизонтали
    let left = trigger.left + scrollLeft + (trigger.width - tooltip.width) / 2;
    
    // Корректируем если выходит за границы
    left = Math.max(padding, Math.min(left, window.innerWidth - tooltip.width - padding));
    
    // Позиция по вертикали
    const spaceAbove = trigger.top;
    const spaceBelow = window.innerHeight - trigger.bottom;
    const showAbove = spaceAbove > tooltip.height + gap || spaceAbove > spaceBelow;
    
    let top;
    if (showAbove) {
      top = trigger.top + scrollTop - tooltip.height - gap;
    } else {
      top = trigger.bottom + scrollTop + gap;
    }
    
    setPosition({ top, left });
    setIsAbove(showAbove);
  };

  useEffect(() => {
    if (show) {
      // Ждём рендер тултипа
      const timer = setTimeout(updatePosition, 10);
      
      window.addEventListener('scroll', updatePosition, { passive: true });
      window.addEventListener('resize', updatePosition);
      
      return () => {
        clearTimeout(timer);
        window.removeEventListener('scroll', updatePosition);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [show]);

  const definition = normalizeWord(term);

  return (
    <span className="term-wrapper">
      <span 
        ref={triggerRef}
        className="term"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      >
        {children}
        <HelpCircle size={14} className="term-icon" />
      </span>
      {show && (
        <span 
          ref={tooltipRef}
          className={`tooltip show ${isAbove ? 'tooltip-above' : 'tooltip-below'}`}
          style={{ 
            top: `${position.top}px`, 
            left: `${position.left}px`
          }}
        >
          {definition}
        </span>
      )}
    </span>
  );
};

export default PublicRules;
