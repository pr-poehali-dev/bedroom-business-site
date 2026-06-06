import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";

const BG_IMG = "https://cdn.poehali.dev/projects/5d127310-9b90-4bb0-b2c1-bbb5ecf69bf0/files/6a942a3a-d66e-4958-a4ab-bfca44bd6626.jpg";

const NAV_ITEMS = [
  { label: "О нас", href: "#about" },
  { label: "Коллекции", href: "#catalog" },
  { label: "Преимущества", href: "#benefits" },
  { label: "Отзывы", href: "#reviews" },
  { label: "Контакты", href: "#contact" },
];

const COLLECTIONS = [
  {
    name: "Platinum Sleep",
    desc: "Египетский хлопок 1000 нитей. Ощущение невесомости с первого прикосновения.",
    tag: "Бестселлер",
    price: "от 18 900 ₽",
  },
  {
    name: "Noir Velvet",
    desc: "Шёлковый сатин с матовым финишем. Коллекция для тех, кто ценит детали.",
    tag: "Новинка",
    price: "от 24 500 ₽",
  },
  {
    name: "Cashmere Cloud",
    desc: "Органический кашемир высшего сорта. Идеальная терморегуляция круглый год.",
    tag: "Премиум",
    price: "от 32 000 ₽",
  },
  {
    name: "Linen Heritage",
    desc: "Бельгийский лён ручной выделки. Становится мягче с каждой стиркой.",
    tag: "Классика",
    price: "от 14 200 ₽",
  },
];

const BENEFITS = [
  { icon: "Shield", title: "Гарантия 5 лет", desc: "На все изделия. Заменим или вернём деньги без лишних вопросов." },
  { icon: "Truck", title: "Доставка за 48 ч", desc: "По всей России. Бесплатно при заказе от 10 000 ₽." },
  { icon: "Star", title: "Только оригиналы", desc: "Прямые контракты с фабриками Португалии, Швейцарии и Египта." },
  { icon: "Heart", title: "Личный стилист", desc: "Подберём комплект под интерьер. Бесплатно для каждого клиента." },
  { icon: "Award", title: "Сертификаты OEKO-TEX", desc: "Гипоаллергенные материалы. Безопасно для детей и аллергиков." },
  { icon: "RefreshCw", title: "Возврат 30 дней", desc: "Не понравилось — вернём полную стоимость без объяснений." },
];

const REVIEWS = [
  {
    name: "Ирина К.",
    city: "Москва",
    text: "Заказала комплект Platinum Sleep два года назад — до сих пор как новый. Качество невероятное, муж шутит, что я влюбилась в постельное бельё.",
    stars: 5,
  },
  {
    name: "Александр П.",
    city: "Санкт-Петербург",
    text: "Был скептиком, пока не попробовал. Разница с обычным бельём колоссальная. Беру уже третий комплект — в подарок родителям.",
    stars: 5,
  },
  {
    name: "Мария Д.",
    city: "Екатеринбург",
    text: "Личный стилист помог подобрать под цвет интерьера. Спальня стала выглядеть как из журнала. Сервис на высшем уровне.",
    stars: 5,
  },
];

const STATS = [
  { value: "12+", label: "лет на рынке" },
  { value: "47 000", label: "довольных клиентов" },
  { value: "18", label: "стран поставщиков" },
  { value: "98%", label: "рекомендуют нас" },
];

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect(); } },
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);
  return { ref, inView };
}

function Section({ id, children, className = "" }: { id?: string; children: React.ReactNode; className?: string }) {
  const { ref, inView } = useInView();
  return (
    <section id={id} ref={ref} className={`${className} ${inView ? "opacity-100" : "opacity-0"} transition-opacity duration-700`} style={{ paddingTop: 100, paddingBottom: 100 }}>
      {children}
    </section>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="gold-line" />
      <span className="text-xs tracking-widest uppercase text-gold" style={{ letterSpacing: "0.25em" }}>{children}</span>
    </div>
  );
}

export default function Index() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "", message: "" });
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNav = (href: string) => {
    setMenuOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div style={{ background: "var(--dark-bg)", color: "var(--text-primary)", minHeight: "100vh" }}>

      {/* ── NAV ── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          background: scrolled ? "rgba(14,11,8,0.96)" : "transparent",
          borderBottom: scrolled ? "1px solid var(--gold-dim)" : "none",
          backdropFilter: scrolled ? "blur(12px)" : "none",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between" style={{ height: 72 }}>
          <a href="#" className="font-display text-2xl tracking-wider text-gold" style={{ fontWeight: 400, letterSpacing: "0.12em" }}>
            SOMNIUM
          </a>
          <ul className="hidden md:flex gap-8 list-none">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <button className="nav-link bg-transparent border-none p-0" onClick={() => handleNav(item.href)}>
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
          <button
            className="btn-gold hidden md:inline-block text-xs"
            style={{ padding: "10px 28px" }}
            onClick={() => handleNav("#contact")}
          >
            Заказать
          </button>
          <button className="md:hidden text-gold bg-transparent border-none cursor-pointer" onClick={() => setMenuOpen(!menuOpen)}>
            <Icon name={menuOpen ? "X" : "Menu"} size={22} />
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div style={{ background: "rgba(14,11,8,0.98)", borderTop: "1px solid var(--gold-dim)", padding: "20px 24px 28px" }}>
            {NAV_ITEMS.map((item) => (
              <button
                key={item.href}
                className="nav-link block bg-transparent border-none cursor-pointer mb-5 text-left"
                onClick={() => handleNav(item.href)}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <div className="relative" style={{ height: "100vh", minHeight: 600 }}>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${BG_IMG})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(135deg, rgba(14,11,8,0.82) 0%, rgba(14,11,8,0.45) 60%, rgba(14,11,8,0.7) 100%)",
          }}
        />
        <div className="relative max-w-6xl mx-auto px-6 flex flex-col justify-center h-full">
          <div style={{ maxWidth: 620 }}>
            <div className="animate-fade-in delay-200 flex items-center gap-3 mb-6">
              <span className="gold-line" />
              <span className="text-xs tracking-widest uppercase text-gold">Элитное постельное бельё</span>
            </div>
            <h1
              className="font-display animate-fade-in-up delay-300"
              style={{
                fontSize: "clamp(42px, 7vw, 88px)",
                lineHeight: 1.05,
                fontWeight: 300,
                letterSpacing: "-0.01em",
                color: "var(--text-primary)",
                marginBottom: 24,
              }}
            >
              Сон, который<br />
              <em style={{ fontStyle: "italic", color: "var(--gold)" }}>меняет всё</em>
            </h1>
            <p
              className="animate-fade-in-up delay-500"
              style={{ fontSize: 17, color: "var(--text-secondary)", lineHeight: 1.75, marginBottom: 44, maxWidth: 480 }}
            >
              Материалы из 18 стран мира. Ткани, которые прошли 23 проверки качества, прежде чем оказаться в вашей спальне.
            </p>
            <div className="flex flex-wrap gap-4 animate-fade-in-up delay-700">
              <button className="btn-gold btn-gold-fill" onClick={() => handleNav("#catalog")}>
                Смотреть коллекции
              </button>
              <button className="btn-gold" onClick={() => handleNav("#about")}>
                О компании
              </button>
            </div>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-fade-in delay-1100 flex flex-col items-center gap-2">
          <span className="text-xs tracking-widest uppercase text-muted-custom">Прокрутите вниз</span>
          <Icon name="ChevronDown" size={18} className="text-gold animate-bounce" />
        </div>
      </div>

      {/* ── STATS ── */}
      <div style={{ background: "var(--dark-card)", borderTop: "1px solid var(--gold-dim)", borderBottom: "1px solid var(--gold-dim)" }}>
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-0">
          {STATS.map((s, i) => (
            <div
              key={i}
              className="text-center"
              style={{ padding: "40px 20px", borderRight: i < 3 ? "1px solid var(--gold-dim)" : "none", borderRightWidth: i === 1 ? "0" : undefined }}
            >
              <div
                className="font-display"
                style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 300, color: "var(--gold)", letterSpacing: "-0.02em", lineHeight: 1 }}
              >
                {s.value}
              </div>
              <div className="text-xs mt-2 tracking-wider uppercase text-muted-custom">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── ABOUT ── */}
      <Section id="about" className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <SectionLabel>О компании</SectionLabel>
            <h2 className="font-display mb-6" style={{ fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 300, lineHeight: 1.15 }}>
              Двенадцать лет<br />
              <span style={{ color: "var(--gold)" }}>безупречного сна</span>
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: 15, lineHeight: 1.85, marginBottom: 20 }}>
              Somnium основана в 2012 году с одной целью: дать каждому человеку возможность просыпаться отдохнувшим и счастливым. Мы убеждены, что качество сна определяет качество жизни.
            </p>
            <p style={{ color: "var(--text-secondary)", fontSize: 15, lineHeight: 1.85, marginBottom: 36 }}>
              Каждое изделие проходит ручной контроль качества. Мы работаем только с сертифицированными фабриками, которые разделяют наши ценности — этичное производство, экологичность и безупречное мастерство.
            </p>
            <button className="btn-gold" onClick={() => handleNav("#catalog")}>Смотреть коллекции</button>
          </div>
          <div className="relative">
            <div
              style={{
                width: "100%",
                paddingTop: "120%",
                backgroundImage: `url(${BG_IMG})`,
                backgroundSize: "cover",
                backgroundPosition: "center 30%",
                filter: "brightness(0.7) contrast(1.1)",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: -20,
                left: -20,
                background: "var(--dark-card)",
                border: "1px solid var(--gold-dim)",
                padding: "24px 32px",
              }}
            >
              <div className="font-display" style={{ fontSize: 36, color: "var(--gold)", fontWeight: 300 }}>★★★★★</div>
              <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>Средняя оценка 4.98 / 5</div>
            </div>
          </div>
        </div>
      </Section>

      <div className="divider" />

      {/* ── CATALOG ── */}
      <Section id="catalog">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <SectionLabel>Коллекции</SectionLabel>
            <h2 className="font-display" style={{ fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 300, lineHeight: 1.15 }}>
              Найдите свой идеальный сон
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {COLLECTIONS.map((col, i) => (
              <div
                key={i}
                className="card-hover cursor-pointer"
                style={{
                  background: "var(--dark-card)",
                  border: "1px solid var(--gold-dim)",
                  padding: "36px 40px",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 2,
                    background: "linear-gradient(90deg, var(--gold-dim), var(--gold), var(--gold-dim))",
                  }}
                />
                <span
                  style={{
                    display: "inline-block",
                    fontSize: 10,
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    color: "var(--gold)",
                    border: "1px solid var(--gold-dim)",
                    padding: "4px 12px",
                    marginBottom: 20,
                  }}
                >
                  {col.tag}
                </span>
                <h3 className="font-display" style={{ fontSize: 28, fontWeight: 400, marginBottom: 12, letterSpacing: "0.02em" }}>
                  {col.name}
                </h3>
                <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.8, marginBottom: 24 }}>{col.desc}</p>
                <div className="flex items-center justify-between">
                  <span style={{ fontSize: 20, color: "var(--gold)", fontFamily: "'Cormorant Garamond', serif", fontWeight: 400 }}>
                    {col.price}
                  </span>
                  <button className="btn-gold" style={{ padding: "8px 24px", fontSize: 11 }}>
                    Подробнее
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <div className="divider" />

      {/* ── BENEFITS ── */}
      <Section id="benefits">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <SectionLabel>Почему выбирают нас</SectionLabel>
            <h2 className="font-display" style={{ fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 300, lineHeight: 1.15 }}>
              Преимущества Somnium
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {BENEFITS.map((b, i) => (
              <div
                key={i}
                className="card-hover"
                style={{
                  background: "var(--dark-surface)",
                  border: "1px solid var(--border)",
                  padding: "36px 32px",
                  transition: "border-color 0.3s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--gold-dim)")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    border: "1px solid var(--gold-dim)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 20,
                    color: "var(--gold)",
                  }}
                >
                  <Icon name={b.icon} size={20} />
                </div>
                <h4 className="font-display" style={{ fontSize: 20, fontWeight: 400, marginBottom: 10 }}>{b.title}</h4>
                <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.8 }}>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <div className="divider" />

      {/* ── REVIEWS ── */}
      <Section id="reviews">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <SectionLabel>Отзывы</SectionLabel>
            <h2 className="font-display" style={{ fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 300, lineHeight: 1.15 }}>
              Что говорят клиенты
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {REVIEWS.map((r, i) => (
              <div
                key={i}
                className="card-hover"
                style={{
                  background: "var(--dark-card)",
                  border: "1px solid var(--gold-dim)",
                  padding: "36px 32px",
                  position: "relative",
                }}
              >
                <div
                  className="font-display"
                  style={{
                    fontSize: 64,
                    color: "var(--gold-dim)",
                    lineHeight: 0.8,
                    marginBottom: 20,
                    opacity: 0.4,
                  }}
                >
                  "
                </div>
                <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.85, marginBottom: 24, fontStyle: "italic" }}>
                  {r.text}
                </p>
                <div style={{ borderTop: "1px solid var(--border)", paddingTop: 18 }}>
                  <div style={{ color: "var(--gold)", fontSize: 13, letterSpacing: "0.08em", marginBottom: 2 }}>{"★".repeat(r.stars)}</div>
                  <div style={{ fontWeight: 500, fontSize: 14 }}>{r.name}</div>
                  <div style={{ color: "var(--text-muted)", fontSize: 12 }}>{r.city}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <div className="divider" />

      {/* ── CONTACT ── */}
      <Section id="contact">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-start">
            <div>
              <SectionLabel>Свяжитесь с нами</SectionLabel>
              <h2 className="font-display mb-6" style={{ fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 300, lineHeight: 1.15 }}>
                Мы готовы<br />
                <span style={{ color: "var(--gold)" }}>ответить на всё</span>
              </h2>
              <p style={{ color: "var(--text-secondary)", fontSize: 15, lineHeight: 1.85, marginBottom: 40 }}>
                Подберём коллекцию под ваш интерьер, рассчитаем стоимость под нестандартные размеры и организуем доставку в любую точку России.
              </p>
              <div className="flex flex-col gap-5">
                {[
                  { icon: "Phone", label: "+7 (800) 555-35-35" },
                  { icon: "Mail", label: "hello@somnium.ru" },
                  { icon: "MapPin", label: "Москва, Кутузовский пр-т, 32" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-4">
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        border: "1px solid var(--gold-dim)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--gold)",
                        flexShrink: 0,
                      }}
                    >
                      <Icon name={item.icon} size={16} />
                    </div>
                    <span style={{ color: "var(--text-secondary)", fontSize: 15 }}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Form */}
            <div
              style={{
                background: "var(--dark-card)",
                border: "1px solid var(--gold-dim)",
                padding: "48px 40px",
              }}
            >
              {sent ? (
                <div className="text-center py-8">
                  <div style={{ fontSize: 48, color: "var(--gold)", marginBottom: 16 }}>✓</div>
                  <h3 className="font-display" style={{ fontSize: 28, fontWeight: 400, marginBottom: 12 }}>Заявка отправлена</h3>
                  <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Мы свяжемся с вами в течение 2 часов.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  <h3 className="font-display" style={{ fontSize: 26, fontWeight: 400, marginBottom: 8 }}>Оставить заявку</h3>
                  {[
                    { key: "name", placeholder: "Ваше имя", type: "text" },
                    { key: "phone", placeholder: "Телефон", type: "tel" },
                  ].map((f) => (
                    <input
                      key={f.key}
                      type={f.type}
                      placeholder={f.placeholder}
                      value={formData[f.key as keyof typeof formData]}
                      onChange={(e) => setFormData({ ...formData, [f.key]: e.target.value })}
                      style={{
                        background: "transparent",
                        border: "1px solid var(--gold-dim)",
                        color: "var(--text-primary)",
                        padding: "14px 18px",
                        fontSize: 14,
                        outline: "none",
                        fontFamily: "'Golos Text', sans-serif",
                        transition: "border-color 0.3s",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "var(--gold)")}
                      onBlur={(e) => (e.target.style.borderColor = "var(--gold-dim)")}
                    />
                  ))}
                  <textarea
                    placeholder="Сообщение (необязательно)"
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    style={{
                      background: "transparent",
                      border: "1px solid var(--gold-dim)",
                      color: "var(--text-primary)",
                      padding: "14px 18px",
                      fontSize: 14,
                      outline: "none",
                      resize: "none",
                      fontFamily: "'Golos Text', sans-serif",
                      transition: "border-color 0.3s",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "var(--gold)")}
                    onBlur={(e) => (e.target.style.borderColor = "var(--gold-dim)")}
                  />
                  <button type="submit" className="btn-gold btn-gold-fill" style={{ marginTop: 8 }}>
                    Отправить заявку
                  </button>
                  <p style={{ color: "var(--text-muted)", fontSize: 11, textAlign: "center", letterSpacing: "0.05em" }}>
                    Нажимая кнопку, вы соглашаетесь с политикой конфиденциальности
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </Section>

      {/* ── FOOTER ── */}
      <footer style={{ background: "var(--dark-card)", borderTop: "1px solid var(--gold-dim)", padding: "48px 0 32px" }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-10">
            <div>
              <div className="font-display text-2xl text-gold mb-2" style={{ letterSpacing: "0.12em", fontWeight: 400 }}>
                SOMNIUM
              </div>
              <div style={{ color: "var(--text-muted)", fontSize: 12, letterSpacing: "0.08em" }}>
                Элитное постельное бельё с 2012 года
              </div>
            </div>
            <div className="flex flex-wrap gap-8">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.href}
                  className="nav-link bg-transparent border-none cursor-pointer"
                  onClick={() => handleNav(item.href)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          <div className="divider mb-8" />
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p style={{ color: "var(--text-muted)", fontSize: 12 }}>
              © 2024 Somnium. Все права защищены.
            </p>
            <div className="flex gap-6">
              {["Политика конфиденциальности", "Оферта", "Доставка"].map((l) => (
                <a key={l} href="#" style={{ color: "var(--text-muted)", fontSize: 11, letterSpacing: "0.06em", textDecoration: "none" }}>
                  {l}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
