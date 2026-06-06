import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";

const API_URL = "https://functions.poehali.dev/02d66496-bb29-413c-8862-14f62409d7c0";
const HERO_IMG = "https://cdn.poehali.dev/projects/5d127310-9b90-4bb0-b2c1-bbb5ecf69bf0/files/a4c28c88-768e-4c4a-9941-33fd4229cb09.jpg";
const WA_PHONE = "79019176030";
const ADMIN_PASSWORD = "somnium2024";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string | null;
  in_stock: boolean;
}

const CATEGORIES = ["Все", "Комплекты", "Подушки", "Одеяла", "Простыни", "Аксессуары"];
const fmt = (n: number) => n.toLocaleString("ru-RU") + " ₽";
const waLink = (product: Product) => {
  const text = encodeURIComponent(`Здравствуйте! Хочу заказать: «${product.name}» за ${fmt(product.price)}. Расскажите подробнее.`);
  return `https://wa.me/${WA_PHONE}?text=${text}`;
};

export default function Index() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("Все");
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminAuthed, setAdminAuthed] = useState(false);
  const [adminPwd, setAdminPwd] = useState("");
  const [adminError, setAdminError] = useState("");
  const [form, setForm] = useState({ name: "", description: "", price: "", category: "Комплекты", image_url: "" });
  const [formLoading, setFormLoading] = useState(false);
  const [formMsg, setFormMsg] = useState("");

  useEffect(() => {
    fetchProducts();
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      const raw = await res.json();
      const data = typeof raw === "string" ? JSON.parse(raw) : raw;
      setProducts(data.products || []);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = () => {
    if (adminPwd === ADMIN_PASSWORD) { setAdminAuthed(true); setAdminError(""); }
    else setAdminError("Неверный пароль");
  };

  const handleAddProduct = async () => {
    if (!form.name || !form.price) { setFormMsg("Заполните название и цену"); return; }
    setFormLoading(true); setFormMsg("");
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Admin-Password": ADMIN_PASSWORD },
        body: JSON.stringify({ ...form, price: parseInt(form.price) }),
      });
      if (res.ok) {
        setFormMsg("✓ Товар добавлен!");
        setForm({ name: "", description: "", price: "", category: "Комплекты", image_url: "" });
        fetchProducts();
      } else setFormMsg("Ошибка при добавлении");
    } catch { setFormMsg("Ошибка сети"); }
    setFormLoading(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Удалить этот товар?")) return;
    await fetch(`${API_URL}?id=${id}`, {
      method: "DELETE",
      headers: { "X-Admin-Password": ADMIN_PASSWORD },
    });
    fetchProducts();
  };

  const scroll = (id: string) => {
    setMenuOpen(false);
    document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const closeAdmin = () => { setAdminOpen(false); setAdminAuthed(false); setAdminPwd(""); setAdminError(""); };
  const filtered = activeCategory === "Все" ? products : products.filter(p => p.category === activeCategory);

  return (
    <div style={{ background: "var(--cream)", minHeight: "100vh" }}>

      {/* NAV */}
      <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{ background: scrolled ? "rgba(250,248,245,0.97)" : "transparent", borderBottom: scrolled ? "1px solid var(--sand)" : "none", backdropFilter: scrolled ? "blur(10px)" : "none" }}>
        <div className="max-w-6xl mx-auto px-5 flex items-center justify-between" style={{ height: 68 }}>
          <button onClick={() => scroll("#hero")} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 500, letterSpacing: "0.06em", color: "var(--dark)" }}>
            Somnium
          </button>
          <nav className="hidden md:flex items-center gap-8">
            {[["#catalog","Каталог"],["#about","О нас"],["#contact","Контакты"]].map(([id,label]) => (
              <button key={id} className="nav-item" onClick={() => scroll(id)}>{label}</button>
            ))}
          </nav>
          <div className="hidden md:flex items-center gap-4">
            <a href="tel:+79019176030" className="nav-item flex items-center gap-2">
              <Icon name="Phone" size={13} />+7 901 917-60-30
            </a>
            <button className="btn-outline" style={{ padding: "8px 18px", fontSize: 12 }} onClick={() => setAdminOpen(true)}>
              <Icon name="Settings" size={13} />Админ
            </button>
          </div>
          <button className="md:hidden" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--dark)" }} onClick={() => setMenuOpen(!menuOpen)}>
            <Icon name={menuOpen ? "X" : "Menu"} size={22} />
          </button>
        </div>
        {menuOpen && (
          <div style={{ background: "var(--cream)", borderTop: "1px solid var(--sand)", padding: "20px 20px 24px" }}>
            {[["#catalog","Каталог"],["#about","О нас"],["#contact","Контакты"]].map(([id,label]) => (
              <button key={id} className="nav-item block mb-5" onClick={() => scroll(id)}>{label}</button>
            ))}
            <button className="btn-outline w-full justify-center" onClick={() => { setMenuOpen(false); setAdminOpen(true); }}>Панель администратора</button>
          </div>
        )}
      </header>

      {/* HERO */}
      <section id="hero" className="relative" style={{ height: "100vh", minHeight: 560 }}>
        <div className="absolute inset-0" style={{ backgroundImage: `url(${HERO_IMG})`, backgroundSize: "cover", backgroundPosition: "center" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(250,248,245,0.93) 38%, rgba(250,248,245,0.25) 100%)" }} />
        <div className="relative max-w-6xl mx-auto px-5 flex items-center h-full">
          <div style={{ maxWidth: 520 }}>
            <span className="section-label anim-up d1">Постельное бельё премиум-класса</span>
            <h1 className="font-display anim-up d2" style={{ fontSize: "clamp(44px, 6vw, 76px)", lineHeight: 1.08, fontWeight: 400, color: "var(--dark)", marginBottom: 20 }}>
              Просыпайтесь<br /><span style={{ color: "var(--accent-warm)" }}>счастливыми</span>
            </h1>
            <p className="anim-up d3" style={{ fontSize: 16, color: "var(--text-sub)", lineHeight: 1.8, marginBottom: 36, maxWidth: 400 }}>
              Натуральные ткани. Честные цены. Доставка по всей России.
            </p>
            <div className="flex flex-wrap gap-3 anim-up d4">
              <button className="btn-dark" onClick={() => scroll("#catalog")}>
                <Icon name="ShoppingBag" size={15} />Смотреть каталог
              </button>
              <a href={`https://wa.me/${WA_PHONE}?text=${encodeURIComponent("Здравствуйте! Хочу узнать подробнее.")}`} target="_blank" rel="noopener noreferrer" className="btn-outline">
                <Icon name="MessageCircle" size={15} />Написать в WhatsApp
              </a>
            </div>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 anim-in d7">
          <span style={{ fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--text-hint)" }}>Листайте</span>
          <Icon name="ChevronDown" size={16} style={{ color: "var(--text-hint)" }} className="animate-bounce" />
        </div>
      </section>

      {/* CATALOG */}
      <section id="catalog" style={{ padding: "96px 0 80px" }}>
        <div className="max-w-6xl mx-auto px-5">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-10">
            <div>
              <span className="section-label">Наш ассортимент</span>
              <h2 className="font-display" style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 400, lineHeight: 1.15, color: "var(--dark)" }}>Каталог товаров</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setActiveCategory(cat)}
                  style={{ padding: "7px 16px", fontSize: 12, fontWeight: 500, borderRadius: 2, border: "1.5px solid", cursor: "pointer", transition: "all 0.2s",
                    borderColor: activeCategory === cat ? "var(--dark)" : "var(--sand)",
                    background: activeCategory === cat ? "var(--dark)" : "transparent",
                    color: activeCategory === cat ? "#fff" : "var(--text-sub)" }}>
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="text-center py-20" style={{ color: "var(--text-hint)" }}>
              <Icon name="Loader" size={28} className="animate-spin mx-auto mb-3" />
              <p>Загружаем товары…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <Icon name="Package" size={44} className="mx-auto mb-4" style={{ color: "var(--taupe)", opacity: 0.4 }} />
              <p style={{ fontSize: 16, color: "var(--text-sub)" }}>Товаров пока нет в этой категории</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map(product => (
                <div key={product.id} className="product-card">
                  <div style={{ height: 220, background: "var(--sand)", position: "relative", overflow: "hidden" }}>
                    {product.image_url
                      ? <img src={product.image_url} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Icon name="Bed" size={48} style={{ color: "var(--taupe)", opacity: 0.45 }} />
                        </div>
                    }
                    {product.category && <span className="badge badge-sand" style={{ position: "absolute", top: 12, left: 12 }}>{product.category}</span>}
                  </div>
                  <div style={{ padding: "20px 22px 22px" }}>
                    <h3 style={{ fontSize: 17, fontWeight: 600, color: "var(--dark)", marginBottom: 8, lineHeight: 1.3 }}>{product.name}</h3>
                    {product.description && (
                      <p style={{ fontSize: 13, color: "var(--text-sub)", lineHeight: 1.7, marginBottom: 16,
                        display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden" }}>
                        {product.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <span className="font-display" style={{ fontSize: 22, fontWeight: 500, color: "var(--dark)" }}>{fmt(product.price)}</span>
                      <a href={waLink(product)} target="_blank" rel="noopener noreferrer" className="btn-warm" style={{ padding: "9px 20px", fontSize: 12 }}>
                        <Icon name="MessageCircle" size={14} />Заказать
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="hr" />

      {/* ABOUT */}
      <section id="about" style={{ padding: "96px 0", background: "#fff" }}>
        <div className="max-w-6xl mx-auto px-5 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <span className="section-label">О компании</span>
            <h2 className="font-display mb-5" style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 400, lineHeight: 1.15 }}>
              Качество, которое<br />чувствуется руками
            </h2>
            <p style={{ fontSize: 15, color: "var(--text-sub)", lineHeight: 1.85, marginBottom: 14 }}>
              Мы подбираем только натуральные ткани: египетский хлопок, бельгийский лён, шёлк и кашемир. Каждый комплект проходит проверку перед отправкой.
            </p>
            <p style={{ fontSize: 15, color: "var(--text-sub)", lineHeight: 1.85, marginBottom: 36 }}>
              Работаем напрямую с производителями — цены честные, качество неизменно высокое.
            </p>
            <div className="grid grid-cols-2 gap-6">
              {[["500+","довольных клиентов"],["100%","натуральные ткани"],["48 ч","доставка по России"],["30 дней","гарантия возврата"]].map(([val,label]) => (
                <div key={label}>
                  <div className="font-display" style={{ fontSize: 34, fontWeight: 400, color: "var(--accent-warm)", lineHeight: 1 }}>{val}</div>
                  <div style={{ fontSize: 13, color: "var(--text-sub)", marginTop: 4 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ position: "relative" }}>
            <img src={HERO_IMG} alt="Интерьер спальни" style={{ width: "100%", aspectRatio: "4/5", objectFit: "cover", borderRadius: 4 }} />
            <div style={{ position: "absolute", bottom: -20, right: -16, background: "var(--dark)", color: "#fff", padding: "18px 26px", borderRadius: 2 }}>
              <div style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.55, marginBottom: 4 }}>Только натуральное</div>
              <div className="font-display" style={{ fontSize: 20, fontWeight: 400 }}>100% Eco</div>
            </div>
          </div>
        </div>
      </section>

      <div className="hr" />

      {/* CONTACT */}
      <section id="contact" style={{ padding: "96px 0" }}>
        <div className="max-w-6xl mx-auto px-5">
          <div className="text-center mb-14">
            <span className="section-label">Связь с нами</span>
            <h2 className="font-display" style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 400 }}>Готовы помочь с выбором</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { icon: "Phone", title: "Телефон", val: "+7 901 917-60-30", link: "tel:+79019176030" },
              { icon: "MessageCircle", title: "WhatsApp", val: "Написать сейчас", link: `https://wa.me/${WA_PHONE}` },
              { icon: "Mail", title: "Email", val: "dzamolovhorun@gmail.com", link: "mailto:dzamolovhorun@gmail.com" },
            ].map(c => (
              <a key={c.title} href={c.link} target={c.link.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer"
                style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center",
                  background: "#fff", border: "1px solid var(--sand)", borderRadius: 4, padding: "40px 24px",
                  textDecoration: "none", transition: "box-shadow 0.25s, transform 0.25s" }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = "0 8px 32px rgba(26,22,20,0.08)"; el.style.transform = "translateY(-3px)"; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = "none"; el.style.transform = "none"; }}
              >
                <div style={{ width: 52, height: 52, borderRadius: "50%", background: "var(--sand)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, color: "var(--accent-warm)" }}>
                  <Icon name={c.icon} size={22} />
                </div>
                <div style={{ fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--text-hint)", marginBottom: 6 }}>{c.title}</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "var(--dark)" }}>{c.val}</div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: "var(--dark)", color: "#fff", padding: "40px 0 28px" }}>
        <div className="max-w-6xl mx-auto px-5 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <div className="font-display text-2xl mb-1" style={{ fontWeight: 400, letterSpacing: "0.06em" }}>Somnium</div>
            <div style={{ fontSize: 12, opacity: 0.4 }}>Постельное бельё премиум-класса</div>
          </div>
          <div className="flex flex-wrap gap-6 justify-center">
            {[["#catalog","Каталог"],["#about","О нас"],["#contact","Контакты"]].map(([id,label]) => (
              <button key={id} onClick={() => scroll(id)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.45)", fontSize: 13, cursor: "pointer", letterSpacing: "0.06em", transition: "color 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.45)")}>{label}</button>
            ))}
          </div>
          <div style={{ fontSize: 12, opacity: 0.3 }}>© 2024 Somnium</div>
        </div>
      </footer>

      {/* ADMIN MODAL */}
      {adminOpen && (
        <div className="modal-bg" onClick={e => { if (e.target === e.currentTarget) closeAdmin(); }}>
          <div className="modal-box">
            {!adminAuthed ? (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-display" style={{ fontSize: 26, fontWeight: 400 }}>Вход в панель</h3>
                  <button onClick={closeAdmin} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-hint)" }}><Icon name="X" size={20} /></button>
                </div>
                <div className="flex flex-col gap-4">
                  <input type="password" className="field" placeholder="Пароль администратора" value={adminPwd}
                    onChange={e => setAdminPwd(e.target.value)} onKeyDown={e => e.key === "Enter" && handleAdminLogin()} autoFocus />
                  {adminError && <p style={{ color: "#e03c3c", fontSize: 13 }}>{adminError}</p>}
                  <button className="btn-dark justify-center w-full" onClick={handleAdminLogin}>Войти</button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-display" style={{ fontSize: 24, fontWeight: 400 }}>Управление товарами</h3>
                  <button onClick={closeAdmin} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-hint)" }}><Icon name="X" size={20} /></button>
                </div>
                <div style={{ background: "var(--cream)", borderRadius: 4, padding: "20px", marginBottom: 24 }}>
                  <p className="section-label" style={{ marginBottom: 14 }}>Добавить товар</p>
                  <div className="flex flex-col gap-3">
                    <input className="field" placeholder="Название *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                    <textarea className="field" placeholder="Описание" rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ resize: "none" }} />
                    <div className="grid grid-cols-2 gap-3">
                      <input className="field" type="number" placeholder="Цена ₽ *" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
                      <select className="field" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                        {CATEGORIES.filter(c => c !== "Все").map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <input className="field" placeholder="Ссылка на фото (необязательно)" value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} />
                    {formMsg && <p style={{ fontSize: 13, color: formMsg.startsWith("✓") ? "#2d8c3e" : "#e03c3c" }}>{formMsg}</p>}
                    <button className="btn-dark justify-center" onClick={handleAddProduct} disabled={formLoading}>
                      {formLoading ? <><Icon name="Loader" size={14} className="animate-spin" />Добавляю…</> : <><Icon name="Plus" size={14} />Добавить товар</>}
                    </button>
                  </div>
                </div>
                <p className="section-label">Список товаров ({products.length})</p>
                <div className="flex flex-col gap-2" style={{ maxHeight: 260, overflowY: "auto" }}>
                  {products.length === 0 && <p style={{ color: "var(--text-hint)", fontSize: 13 }}>Нет товаров</p>}
                  {products.map(p => (
                    <div key={p.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "10px 12px", background: "#fff", borderRadius: 2, border: "1px solid var(--sand)" }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 13, color: "var(--dark)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
                        <div style={{ fontSize: 12, color: "var(--text-hint)" }}>{fmt(p.price)} · {p.category || "—"}</div>
                      </div>
                      <button onClick={() => handleDelete(p.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#e03c3c", padding: 4, flexShrink: 0 }}>
                        <Icon name="Trash2" size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
