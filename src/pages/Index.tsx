import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";

const API_URL    = "https://functions.poehali.dev/02d66496-bb29-413c-8862-14f62409d7c0";
const UPLOAD_URL = "https://functions.poehali.dev/1ad2327e-fea0-4b92-93e0-edfe29b55a86";
const HERO_IMG   = "https://cdn.poehali.dev/projects/5d127310-9b90-4bb0-b2c1-bbb5ecf69bf0/files/e9585240-4320-4fe8-94ae-4884a0777170.jpg";
const WA_PHONE   = "79019176030";
const ADMIN_PWD  = "somnium2024";

interface Product {
  id: number; name: string; description: string;
  price: number; category: string; image_url: string | null; in_stock: boolean;
}

const CATS = ["Все","Комплекты","Подушки","Одеяла","Простыни","Аксессуары"];
const fmt  = (n: number) => n.toLocaleString("ru-RU") + " ₽";
const waLink = (p: Product) => {
  const t = encodeURIComponent(`Здравствуйте! Хочу заказать: «${p.name}» за ${fmt(p.price)}.`);
  return `https://wa.me/${WA_PHONE}?text=${t}`;
};
const toBase64 = (f: File): Promise<string> => new Promise((res, rej) => {
  const r = new FileReader(); r.onload = () => res(r.result as string); r.onerror = rej; r.readAsDataURL(f);
});
const isVid = (url: string) => /\.(mp4|mov|avi|webm)$/i.test(url);

export default function Index() {
  const [products, setProducts]         = useState<Product[]>([]);
  const [loading, setLoading]           = useState(true);
  const [cat, setCat]                   = useState("Все");
  const [scrolled, setScrolled]         = useState(false);
  const [mobileMenu, setMobileMenu]     = useState(false);
  const [lightbox, setLightbox]         = useState<{url:string;vid:boolean}|null>(null);

  // admin
  const [adminOpen, setAdminOpen]       = useState(false);
  const [authed, setAuthed]             = useState(false);
  const [pwd, setPwd]                   = useState("");
  const [pwdErr, setPwdErr]             = useState("");
  const [form, setForm]                 = useState({name:"",description:"",price:"",category:"Комплекты"});
  const [file, setFile]                 = useState<File|null>(null);
  const [preview, setPreview]           = useState("");
  const [fileIsVid, setFileIsVid]       = useState(false);
  const [uploadSt, setUploadSt]         = useState<"idle"|"up"|"ok"|"err">("idle");
  const [saving, setSaving]             = useState(false);
  const [msg, setMsg]                   = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    load();
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const raw = await (await fetch(API_URL)).json();
      const d = typeof raw === "string" ? JSON.parse(raw) : raw;
      setProducts(d.products || []);
    } catch { setProducts([]); }
    setLoading(false);
  };

  const scrollTo = (id: string) => { setMobileMenu(false); document.querySelector(id)?.scrollIntoView({behavior:"smooth"}); };

  const login = () => { if (pwd === ADMIN_PWD) { setAuthed(true); setPwdErr(""); } else setPwdErr("Неверный пароль"); };
  const closeAdmin = () => { setAdminOpen(false); setAuthed(false); setPwd(""); setPwdErr(""); };

  const pickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    setFile(f); setFileIsVid(f.type.startsWith("video/")); setPreview(URL.createObjectURL(f)); setUploadSt("idle"); setMsg("");
  };
  const clearFile = () => { setFile(null); setPreview(""); setFileIsVid(false); setUploadSt("idle"); if(fileRef.current) fileRef.current.value=""; };

  const add = async () => {
    if (!form.name || !form.price) { setMsg("Заполните название и цену"); return; }
    setSaving(true); setMsg("");
    let image_url: string | null = null;
    if (file) {
      setUploadSt("up");
      try {
        const b64 = await toBase64(file);
        const r = await fetch(UPLOAD_URL, { method:"POST", headers:{"Content-Type":"application/json","X-Admin-Password":ADMIN_PWD}, body: JSON.stringify({file:b64,name:file.name,type:file.type}) });
        if (r.ok) { image_url = (await r.json()).url; setUploadSt("ok"); }
        else { setUploadSt("err"); setMsg("Ошибка загрузки файла"); setSaving(false); return; }
      } catch { setUploadSt("err"); setMsg("Ошибка загрузки файла"); setSaving(false); return; }
    }
    try {
      const r = await fetch(API_URL, { method:"POST", headers:{"Content-Type":"application/json","X-Admin-Password":ADMIN_PWD}, body: JSON.stringify({...form, price:parseInt(form.price), image_url}) });
      if (r.ok) { setMsg("✓ Товар добавлен!"); setForm({name:"",description:"",price:"",category:"Комплекты"}); clearFile(); load(); }
      else setMsg("Ошибка при сохранении");
    } catch { setMsg("Ошибка сети"); }
    setSaving(false);
  };

  const del = async (id: number) => {
    if (!confirm("Удалить товар?")) return;
    await fetch(`${API_URL}?id=${id}`, {method:"DELETE",headers:{"X-Admin-Password":ADMIN_PWD}});
    load();
  };

  const filtered = cat === "Все" ? products : products.filter(p => p.category === cat);

  return (
    <div style={{background:"var(--bg)",color:"var(--txt)",minHeight:"100vh"}}>

      {/* ── NAV ── */}
      <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{ background: scrolled ? "rgba(13,12,11,0.95)" : "transparent", borderBottom: scrolled ? "1px solid var(--border-c)" : "none", backdropFilter: scrolled ? "blur(16px)" : "none" }}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between" style={{height:72}}>
          <button onClick={() => scrollTo("#hero")} className="font-serif" style={{background:"none",border:"none",cursor:"pointer",fontSize:22,fontWeight:400,letterSpacing:"0.14em",color:"var(--gold)"}}>
            SOMNIUM
          </button>
          <nav className="hidden md:flex items-center gap-10">
            {[["#catalog","Каталог"],["#about","О нас"],["#contact","Контакты"]].map(([id,l]) => (
              <button key={id} className="nav-l" onClick={() => scrollTo(id)}>{l}</button>
            ))}
          </nav>
          <div className="hidden md:flex items-center gap-5">
            <a href="tel:+79019176030" className="nav-l flex items-center gap-2">
              <Icon name="Phone" size={12}/>+7 901 917-60-30
            </a>
            <button className="btn-ghost" style={{padding:"8px 20px",fontSize:10}} onClick={() => setAdminOpen(true)}>
              <Icon name="Settings" size={12}/>Админ
            </button>
          </div>
          <button className="md:hidden" style={{background:"none",border:"none",cursor:"pointer",color:"var(--gold)"}} onClick={() => setMobileMenu(!mobileMenu)}>
            <Icon name={mobileMenu?"X":"Menu"} size={22}/>
          </button>
        </div>
        {mobileMenu && (
          <div style={{background:"rgba(13,12,11,0.98)",borderTop:"1px solid var(--border-c)",padding:"24px 24px 28px"}}>
            {[["#catalog","Каталог"],["#about","О нас"],["#contact","Контакты"]].map(([id,l]) => (
              <button key={id} className="nav-l block mb-6" onClick={() => scrollTo(id)}>{l}</button>
            ))}
            <button className="btn-gold w-full justify-center" onClick={() => {setMobileMenu(false);setAdminOpen(true);}}>Панель администратора</button>
          </div>
        )}
      </header>

      {/* ── HERO ── */}
      <section id="hero" style={{position:"relative",height:"100vh",minHeight:600}}>
        <div style={{position:"absolute",inset:0,backgroundImage:`url(${HERO_IMG})`,backgroundSize:"cover",backgroundPosition:"center"}}/>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(110deg,rgba(13,12,11,0.92) 30%,rgba(13,12,11,0.4) 100%)"}}/>
        {/* Декоративная рамка */}
        <div style={{position:"absolute",top:32,left:32,right:32,bottom:32,border:"1px solid rgba(200,169,106,0.15)",pointerEvents:"none"}}/>

        <div className="relative max-w-7xl mx-auto px-6 flex items-center h-full">
          <div style={{maxWidth:580}}>
            <div className="s-label au d1"><span className="g-line"/>Премиум постельное бельё</div>
            <h1 className="font-serif au d2" style={{fontSize:"clamp(46px,6.5vw,88px)",fontWeight:300,lineHeight:1.05,marginBottom:24,letterSpacing:"-0.01em"}}>
              Искусство<br/>
              <span className="gold-shimmer">безупречного сна</span>
            </h1>
            <p className="au d3" style={{fontSize:16,color:"var(--txt-sub)",lineHeight:1.85,marginBottom:44,maxWidth:440}}>
              Натуральные ткани из 12 стран мира. Каждый комплект — ручной отбор и личная гарантия Шамсудина.
            </p>
            <div className="flex flex-wrap gap-4 au d4">
              <button className="btn-gold btn-gold-fill" onClick={() => scrollTo("#catalog")}>
                <Icon name="Layers" size={14}/>Смотреть коллекции
              </button>
              <a href={`https://wa.me/${WA_PHONE}?text=${encodeURIComponent("Здравствуйте! Хочу узнать подробнее.")}`} target="_blank" rel="noopener noreferrer" className="btn-ghost">
                <Icon name="MessageCircle" size={14}/>WhatsApp
              </a>
            </div>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 ai d7">
          <div style={{width:1,height:48,background:"linear-gradient(to bottom,transparent,var(--gold))"}}/>
          <span style={{fontSize:9,letterSpacing:"0.3em",textTransform:"uppercase",color:"var(--txt-muted)"}}>Scroll</span>
        </div>
      </section>

      {/* ── STATS ── */}
      <div className="stat-strip">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4">
          {[["500+","клиентов"],["100%","натуральное"],["48 ч","доставка"],["30 дней","возврат"]].map(([v,l],i) => (
            <div key={i} className="text-center py-8" style={{borderRight: i<3?"1px solid var(--border-c)":"none"}}>
              <div className="font-serif gold-shimmer" style={{fontSize:"clamp(26px,3vw,38px)",fontWeight:300,lineHeight:1}}>{v}</div>
              <div style={{fontSize:10,letterSpacing:"0.2em",textTransform:"uppercase",color:"var(--txt-muted)",marginTop:6}}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CATALOG ── */}
      <section id="catalog" style={{padding:"100px 0 80px"}}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <div className="s-label"><span className="g-line"/>Ассортимент</div>
              <h2 className="font-serif" style={{fontSize:"clamp(30px,4vw,52px)",fontWeight:300,lineHeight:1.1}}>Наши коллекции</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {CATS.map(c => (
                <button key={c} className={`cat-pill${cat===c?" active":""}`} onClick={() => setCat(c)}>{c}</button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="text-center py-24" style={{color:"var(--txt-muted)"}}>
              <Icon name="Loader" size={28} className="animate-spin mx-auto mb-3"/>
              <p style={{fontSize:13,letterSpacing:"0.1em"}}>Загружаем…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24">
              <Icon name="Package" size={44} className="mx-auto mb-4" style={{color:"var(--txt-muted)",opacity:0.3}}/>
              <p style={{fontSize:14,color:"var(--txt-sub)",letterSpacing:"0.06em"}}>Нет товаров в этой категории</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(p => {
                const vid = p.image_url ? isVid(p.image_url) : false;
                return (
                  <div key={p.id} className="p-card">
                    {/* Media */}
                    <div style={{height:240,background:"var(--bg-surface)",position:"relative",overflow:"hidden",cursor:p.image_url?"zoom-in":"default"}}
                      onClick={() => p.image_url && setLightbox({url:p.image_url,vid})}>
                      {p.image_url ? (
                        vid ? (
                          <>
                            <video src={p.image_url} style={{width:"100%",height:"100%",objectFit:"cover"}} muted playsInline/>
                            <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.3)"}}>
                              <div style={{width:50,height:50,borderRadius:"50%",border:"1px solid var(--gold)",display:"flex",alignItems:"center",justifyContent:"center",color:"var(--gold)"}}>
                                <Icon name="Play" size={18} style={{marginLeft:3}}/>
                              </div>
                            </div>
                          </>
                        ) : (
                          <img src={p.image_url} alt={p.name} style={{width:"100%",height:"100%",objectFit:"cover",transition:"transform 0.5s"}}
                            onMouseEnter={e=>(e.currentTarget.style.transform="scale(1.06)")}
                            onMouseLeave={e=>(e.currentTarget.style.transform="scale(1)")}/>
                        )
                      ) : (
                        <div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center"}}>
                          <Icon name="Bed" size={52} style={{color:"var(--txt-muted)",opacity:0.2}}/>
                        </div>
                      )}
                      {/* Top gradient */}
                      <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:"linear-gradient(90deg,transparent,var(--gold-dim),transparent)"}}/>
                      {p.category && <span className="badge-gold" style={{position:"absolute",top:14,left:14}}>{p.category}</span>}
                    </div>
                    {/* Info */}
                    <div style={{padding:"24px 24px 26px"}}>
                      <h3 className="font-serif" style={{fontSize:22,fontWeight:400,color:"var(--txt)",marginBottom:8,lineHeight:1.25,letterSpacing:"0.02em"}}>{p.name}</h3>
                      {p.description && (
                        <p style={{fontSize:13,color:"var(--txt-sub)",lineHeight:1.75,marginBottom:18,
                          display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical" as const,overflow:"hidden"}}>
                          {p.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <span className="font-serif" style={{fontSize:26,fontWeight:300,color:"var(--gold)",letterSpacing:"-0.01em"}}>{fmt(p.price)}</span>
                        <a href={waLink(p)} target="_blank" rel="noopener noreferrer" className="btn-gold btn-gold-fill" style={{padding:"9px 22px",fontSize:10}}>
                          <Icon name="MessageCircle" size={13}/>Заказать
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <div className="div-gold"/>

      {/* ── ABOUT ── */}
      <section id="about" style={{padding:"100px 0",background:"var(--bg-card)"}}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-center mb-16">
            <div style={{maxWidth:680,textAlign:"center"}}>
              <div className="s-label justify-center"><span className="g-line"/>О нас</div>
              <h2 className="font-serif mb-6" style={{fontSize:"clamp(30px,4vw,52px)",fontWeight:300,lineHeight:1.1}}>
                Привет, я — <span className="gold-shimmer">Шамсудин</span>
              </h2>
              <p style={{fontSize:16,color:"var(--txt-sub)",lineHeight:1.95,marginBottom:16}}>
                Я создал Somnium, потому что сам долго искал качественное постельное бельё и не мог найти — либо дорого и непонятно откуда, либо дёшево и неприятно на ощупь.
              </p>
              <p style={{fontSize:16,color:"var(--txt-sub)",lineHeight:1.95,marginBottom:16}}>
                Теперь я лично отбираю каждый комплект. Только то, что сам бы купил для своей семьи. Натуральные ткани, честные цены, никаких посредников.
              </p>
              <p style={{fontSize:16,color:"var(--txt-sub)",lineHeight:1.95,marginBottom:40}}>
                Если есть вопросы — пишите мне в WhatsApp, отвечу лично.
              </p>
              <a href={`https://wa.me/${WA_PHONE}?text=${encodeURIComponent("Привет, Шамсудин!")}`} target="_blank" rel="noopener noreferrer" className="btn-gold">
                <Icon name="MessageCircle" size={14}/>Написать Шамсудину
              </a>
            </div>
          </div>

          {/* Декоративный разделитель */}
          <div style={{display:"flex",alignItems:"center",gap:16,margin:"0 auto",maxWidth:400,marginBottom:48}}>
            <div style={{flex:1,height:1,background:"var(--border-c)"}}/>
            <span className="font-serif" style={{fontSize:22,color:"var(--gold)",opacity:0.6}}>✦</span>
            <div style={{flex:1,height:1,background:"var(--border-c)"}}/>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[["500+","довольных клиентов"],["100%","натуральные ткани"],["48 ч","доставка по России"],["30 дней","гарантия возврата"]].map(([v,l]) => (
              <div key={l} style={{textAlign:"center",padding:"28px 20px",border:"1px solid var(--border-c)",background:"var(--bg-surface)"}}>
                <div className="font-serif gold-shimmer" style={{fontSize:"clamp(28px,3vw,42px)",fontWeight:300,lineHeight:1}}>{v}</div>
                <div style={{fontSize:10,letterSpacing:"0.18em",textTransform:"uppercase",color:"var(--txt-muted)",marginTop:8}}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="div-gold"/>

      {/* ── CONTACT ── */}
      <section id="contact" style={{padding:"100px 0"}}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="s-label justify-center"><span className="g-line"/>Связь</div>
            <h2 className="font-serif" style={{fontSize:"clamp(30px,4vw,52px)",fontWeight:300}}>Свяжитесь с нами</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              {icon:"Phone", title:"Телефон", val:"+7 901 917-60-30", link:"tel:+79019176030"},
              {icon:"MessageCircle", title:"WhatsApp", val:"Написать сейчас", link:`https://wa.me/${WA_PHONE}`},
              {icon:"Mail", title:"Email", val:"dzamolovhorun@gmail.com", link:"mailto:dzamolovhorun@gmail.com"},
            ].map(c => (
              <a key={c.title} href={c.link} target={c.link.startsWith("http")?"_blank":undefined} rel="noopener noreferrer"
                style={{display:"flex",flexDirection:"column",alignItems:"center",textAlign:"center",
                  padding:"44px 24px",border:"1px solid var(--border-c)",background:"var(--bg-card)",
                  textDecoration:"none",transition:"border-color 0.3s,transform 0.3s,box-shadow 0.3s"}}
                onMouseEnter={e=>{const el=e.currentTarget as HTMLElement;el.style.borderColor="var(--gold-dim)";el.style.transform="translateY(-4px)";el.style.boxShadow="0 16px 48px rgba(0,0,0,0.5)";}}
                onMouseLeave={e=>{const el=e.currentTarget as HTMLElement;el.style.borderColor="var(--border-c)";el.style.transform="none";el.style.boxShadow="none";}}>
                <div style={{width:54,height:54,border:"1px solid var(--gold-dim)",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:18,color:"var(--gold)"}}>
                  <Icon name={c.icon} size={20}/>
                </div>
                <div style={{fontSize:9,letterSpacing:"0.25em",textTransform:"uppercase",color:"var(--txt-muted)",marginBottom:8}}>{c.title}</div>
                <div style={{fontSize:14,fontWeight:500,color:"var(--txt)",letterSpacing:"0.03em"}}>{c.val}</div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{background:"var(--bg-card)",borderTop:"1px solid var(--border-c)",padding:"44px 0 30px"}}>
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div>
            <div className="font-serif" style={{fontSize:24,color:"var(--gold)",letterSpacing:"0.14em",marginBottom:4}}>SOMNIUM</div>
            <div style={{fontSize:11,color:"var(--txt-muted)",letterSpacing:"0.1em"}}>Постельное бельё премиум-класса</div>
          </div>
          <div className="flex flex-wrap gap-8 justify-center">
            {[["#catalog","Каталог"],["#about","О нас"],["#contact","Контакты"]].map(([id,l]) => (
              <button key={id} className="nav-l" onClick={() => scrollTo(id)}>{l}</button>
            ))}
          </div>
          <div style={{fontSize:11,color:"var(--txt-muted)",letterSpacing:"0.08em"}}>© 2024 Somnium</div>
        </div>
      </footer>

      {/* ── LIGHTBOX ── */}
      {lightbox && (
        <div style={{position:"fixed",inset:0,zIndex:200,background:"rgba(0,0,0,0.95)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}
          onClick={() => setLightbox(null)}>
          <button onClick={() => setLightbox(null)} style={{position:"absolute",top:20,right:24,background:"none",border:"none",cursor:"pointer",color:"var(--txt-sub)"}}>
            <Icon name="X" size={26}/>
          </button>
          {lightbox.vid
            ? <video src={lightbox.url} controls autoPlay style={{maxWidth:"88vw",maxHeight:"84vh",borderRadius:2}} onClick={e=>e.stopPropagation()}/>
            : <img src={lightbox.url} alt="" style={{maxWidth:"88vw",maxHeight:"84vh",objectFit:"contain",borderRadius:2}} onClick={e=>e.stopPropagation()}/>
          }
        </div>
      )}

      {/* ── ADMIN MODAL ── */}
      {adminOpen && (
        <div className="m-overlay" onClick={e=>{if(e.target===e.currentTarget) closeAdmin();}}>
          <div className="m-box">
            {!authed ? (
              <>
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <div className="s-label" style={{marginBottom:6}}><span className="g-line"/>Доступ</div>
                    <h3 className="font-serif" style={{fontSize:28,fontWeight:300}}>Панель управления</h3>
                  </div>
                  <button onClick={closeAdmin} style={{background:"none",border:"none",cursor:"pointer",color:"var(--txt-muted)"}}><Icon name="X" size={20}/></button>
                </div>
                <div className="flex flex-col gap-4">
                  <input type="password" className="f-input" placeholder="Пароль администратора" value={pwd}
                    onChange={e=>setPwd(e.target.value)} onKeyDown={e=>e.key==="Enter"&&login()} autoFocus/>
                  {pwdErr && <p style={{color:"#e05555",fontSize:13}}>{pwdErr}</p>}
                  <button className="btn-gold btn-gold-fill w-full justify-center" onClick={login}>Войти</button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between mb-7">
                  <div>
                    <div className="s-label" style={{marginBottom:6}}><span className="g-line"/>Управление</div>
                    <h3 className="font-serif" style={{fontSize:26,fontWeight:300}}>Товары</h3>
                  </div>
                  <button onClick={closeAdmin} style={{background:"none",border:"none",cursor:"pointer",color:"var(--txt-muted)"}}><Icon name="X" size={20}/></button>
                </div>

                {/* Форма */}
                <div style={{background:"var(--bg-surface)",border:"1px solid var(--border-c)",padding:20,marginBottom:24}}>
                  <p style={{fontSize:10,letterSpacing:"0.2em",textTransform:"uppercase",color:"var(--gold)",marginBottom:14}}>Добавить товар</p>
                  <div className="flex flex-col gap-3">
                    <input className="f-input" placeholder="Название *" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
                    <textarea className="f-input" placeholder="Описание" rows={2} value={form.description} onChange={e=>setForm({...form,description:e.target.value})} style={{resize:"none"}}/>
                    <div className="grid grid-cols-2 gap-3">
                      <input className="f-input" type="number" placeholder="Цена ₽ *" value={form.price} onChange={e=>setForm({...form,price:e.target.value})}/>
                      <select className="f-input" value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>
                        {CATS.filter(c=>c!=="Все").map(c=><option key={c}>{c}</option>)}
                      </select>
                    </div>

                    {/* Upload */}
                    <input ref={fileRef} type="file" accept="image/*,video/*" style={{display:"none"}} onChange={pickFile}/>
                    {!preview ? (
                      <button type="button" onClick={() => fileRef.current?.click()}
                        style={{width:"100%",padding:"24px 16px",border:"1px dashed var(--gold-dim)",background:"transparent",cursor:"pointer",
                          display:"flex",flexDirection:"column",alignItems:"center",gap:8,transition:"border-color 0.2s,background 0.2s",borderRadius:1}}
                        onMouseEnter={e=>{const el=e.currentTarget;el.style.borderColor="var(--gold)";el.style.background="rgba(200,169,106,0.05)";}}
                        onMouseLeave={e=>{const el=e.currentTarget;el.style.borderColor="var(--gold-dim)";el.style.background="transparent";}}>
                        <Icon name="ImagePlus" size={26} style={{color:"var(--gold-dim)"}}/>
                        <span style={{fontSize:12,color:"var(--txt-sub)",letterSpacing:"0.06em"}}>Загрузить фото или видео</span>
                        <span style={{fontSize:10,color:"var(--txt-muted)"}}>JPG, PNG, MP4, MOV…</span>
                      </button>
                    ) : (
                      <div style={{position:"relative",border:"1px solid var(--border-c)",overflow:"hidden"}}>
                        {fileIsVid
                          ? <video src={preview} style={{width:"100%",maxHeight:160,objectFit:"cover",display:"block"}} muted/>
                          : <img src={preview} alt="" style={{width:"100%",maxHeight:160,objectFit:"cover",display:"block"}}/>
                        }
                        <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"center",justifyContent:"center",gap:10}}>
                          <button onClick={() => fileRef.current?.click()} style={{background:"rgba(200,169,106,0.9)",border:"none",padding:"6px 14px",cursor:"pointer",fontSize:11,fontWeight:500,color:"var(--bg)",display:"flex",alignItems:"center",gap:6,borderRadius:1}}>
                            <Icon name="RefreshCw" size={12}/>Заменить
                          </button>
                          <button onClick={clearFile} style={{background:"rgba(200,169,106,0.15)",border:"1px solid var(--gold-dim)",padding:"6px 14px",cursor:"pointer",fontSize:11,color:"#e05555",display:"flex",alignItems:"center",gap:6,borderRadius:1}}>
                            <Icon name="Trash2" size={12}/>Убрать
                          </button>
                        </div>
                        {uploadSt==="up" && (
                          <div style={{position:"absolute",bottom:0,left:0,right:0,background:"rgba(0,0,0,0.7)",color:"var(--gold)",fontSize:11,padding:"6px 12px",display:"flex",alignItems:"center",gap:6,letterSpacing:"0.08em"}}>
                            <Icon name="Loader" size={12} className="animate-spin"/>Загружаем файл…
                          </div>
                        )}
                      </div>
                    )}

                    {msg && <p style={{fontSize:13,color:msg.startsWith("✓")?"#5aaa6a":"#e05555"}}>{msg}</p>}
                    <button className="btn-gold btn-gold-fill justify-center" onClick={add} disabled={saving}>
                      {saving ? <><Icon name="Loader" size={13} className="animate-spin"/>Сохраняю…</> : <><Icon name="Plus" size={13}/>Добавить товар</>}
                    </button>
                  </div>
                </div>

                {/* Список */}
                <p style={{fontSize:10,letterSpacing:"0.2em",textTransform:"uppercase",color:"var(--gold)",marginBottom:12}}>Список ({products.length})</p>
                <div className="flex flex-col gap-2" style={{maxHeight:260,overflowY:"auto"}}>
                  {products.length===0 && <p style={{color:"var(--txt-muted)",fontSize:13}}>Нет товаров</p>}
                  {products.map(p => (
                    <div key={p.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:"var(--bg-surface)",border:"1px solid var(--border-c)"}}>
                      <div style={{width:42,height:42,background:"var(--bg-card)",overflow:"hidden",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",border:"1px solid var(--border-c)"}}>
                        {p.image_url
                          ? isVid(p.image_url)
                            ? <Icon name="Video" size={16} style={{color:"var(--gold-dim)"}}/>
                            : <img src={p.image_url} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                          : <Icon name="Image" size={14} style={{color:"var(--txt-muted)"}}/>
                        }
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontWeight:500,fontSize:13,color:"var(--txt)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{p.name}</div>
                        <div style={{fontSize:11,color:"var(--txt-muted)"}}>{fmt(p.price)} · {p.category||"—"}</div>
                      </div>
                      <button onClick={() => del(p.id)} style={{background:"none",border:"none",cursor:"pointer",color:"#e05555",padding:4,flexShrink:0}}>
                        <Icon name="Trash2" size={14}/>
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
