import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, NavLink, Route, Routes, useNavigate } from 'react-router-dom'
import { AlertTriangle, ArrowRight, CheckCircle2, Compass, LogOut, MapPinned, Plus, ShieldCheck, Siren } from 'lucide-react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import api from './api'
import type { Report, User } from './types'

const TN_DISTRICTS = ['Ariyalur','Chengalpattu','Chennai','Coimbatore','Cuddalore','Dharmapuri','Dindigul','Erode','Kallakurichi','Kancheepuram','Kanniyakumari','Karur','Krishnagiri','Madurai','Mayiladuthurai','Nagapattinam','Namakkal','Nilgiris','Perambalur','Pudukkottai','Ramanathapuram','Ranipet','Salem','Sivaganga','Tenkasi','Thanjavur','Theni','Thoothukudi','Tiruchirappalli','Tirunelveli','Tirupathur','Tiruppur','Tiruvallur','Tiruvannamalai','Tiruvarur','Vellore','Viluppuram','Virudhunagar']
const DISTRICT_CENTRES: Record<string, [number, number]> = {
  Chennai:[13.0827,80.2707], Coimbatore:[11.0168,76.9558], Madurai:[9.9252,78.1198],
  Tiruchirappalli:[10.7905,78.7047], Salem:[11.6643,78.1460], Tirunelveli:[8.7139,77.7567],
  Erode:[11.3410,77.7172], Tiruppur:[11.1085,77.3411], Thanjavur:[10.7870,79.1378],
  Vellore:[12.9165,79.1325], Dindigul:[10.3673,77.9803], Thoothukudi:[8.7642,78.1348],
  Kanyakumari:[8.0883,77.5385], Kanniyakumari:[8.0883,77.5385], Kancheepuram:[12.8342,79.7036],
  Chengalpattu:[12.6819,79.9888], Tiruvallur:[13.1439,79.9089], Cuddalore:[11.7480,79.7714],
  Krishnagiri:[12.5186,78.2137], Dharmapuri:[12.1277,78.1579], Namakkal:[11.2189,78.1677],
  Karur:[10.9601,78.0766], Theni:[10.0104,77.4768], Ramanathapuram:[9.3639,78.8395],
  Sivaganga:[9.8433,78.4809], Virudhunagar:[9.5680,77.9624], Tenkasi:[8.9590,77.3152],
  Nagapattinam:[10.7672,79.8449], Mayiladuthurai:[11.1035,79.6550], Tiruvarur:[10.7727,79.6368],
  Nilgiris:[11.4102,76.6950], Ariyalur:[11.1401,79.0786], Perambalur:[11.2342,78.8807],
  Pudukkottai:[10.3797,78.8208], Viluppuram:[11.9401,79.4861], Kallakurichi:[11.7380,78.9639],
  Ranipet:[12.9273,79.3333], Tirupathur:[12.4967,78.5730]
}
const HAZARD_CATEGORIES = ['POTHOLE','FLOODING','WATERLOGGING','ROAD_DAMAGE','OPEN_MANHOLE','STREETLIGHT','SIGNAL','BLOCKAGE','FALLEN_TREE','STRAY_CATTLE','ROADWORK','OTHER']

const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41]
})

function coords(r: Report): [number, number] {
  const loc: any = r.location
  if (loc?.coordinates) return [loc.coordinates[1], loc.coordinates[0]]
  return [loc?.y ?? 13.0827, loc?.x ?? 80.2707]
}

function Reveal({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const node = ref.current
    if (!node) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      node.classList.add('is-visible')
      return
    }
    if (!('IntersectionObserver' in window)) {
      node.classList.add('is-visible')
      return
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        node.classList.add('is-visible')
        observer.unobserve(node)
      }
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])
  return <div ref={ref} className={`reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>{children}</div>
}

function Header({ user, onLogout }: { user: User | null; onLogout: () => void }) {
  return <header className="topbar">
    <Link to="/" className="brand"><span className="brand-mark"><ShieldCheck size={20}/></span> SafeRoute <small className="brand-region">தமிழ்நாடு</small></Link>
    <nav><NavLink to="/">Home / முகப்பு</NavLink><NavLink to="/map">Tamil Nadu map</NavLink><NavLink to="/report">Report issue</NavLink></nav>
    <div className="account">
      {user ? <><span className="user-chip">{user.name}</span><button className="icon-btn" onClick={onLogout} title="Log out"><LogOut size={17}/></button></> :
        <Link className="button button-small" to="/login">Sign in</Link>}
    </div>
  </header>
}

function App() {
  const [user, setUser] = useState<User | null>(() => {
    try { return JSON.parse(localStorage.getItem('saferoute_user') || 'null') } catch { return null }
  })
  const [reports, setReports] = useState<Report[]>([])
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function loadReports() {
    try { const res = await api.get('/reports'); setReports(res.data) }
    catch { setError('Could not load reports. Check that the backend and database are running.') }
  }
  useEffect(() => { loadReports() }, [])

  function logout() {
    localStorage.removeItem('saferoute_token'); localStorage.removeItem('saferoute_user')
    setUser(null); navigate('/')
  }
  function onAuth(token: string, nextUser: User) {
    localStorage.setItem('saferoute_token', token); localStorage.setItem('saferoute_user', JSON.stringify(nextUser))
    setUser(nextUser); navigate('/')
  }

  return <div className="app-shell">
    <Header user={user} onLogout={logout}/>
    {error && <div className="notice">{error}</div>}
    <Routes>
      <Route path="/" element={<Home reports={reports} user={user}/>}/>
      <Route path="/map" element={<MapPage reports={reports}/>}/>
      <Route path="/report" element={<ReportPage user={user} onCreated={loadReports}/>}/>
      <Route path="/login" element={<AuthPage mode="login" onAuth={onAuth}/>}/>
      <Route path="/register" element={<AuthPage mode="register" onAuth={onAuth}/>}/>
      <Route path="/admin" element={<AdminPage user={user} onChanged={loadReports}/>}/>
      <Route path="*" element={<Home reports={reports} user={user}/>}/>
    </Routes>
    <footer>© {new Date().getFullYear()} SafeRoute Tamil Nadu <span>மக்கள் பங்களிப்புடன் சாலை பாதுகாப்பு · Community-powered road safety</span></footer>
  </div>
}

function Home({ reports, user }: { reports: Report[]; user: User | null }) {
  const verified = reports.filter(r => r.status === 'VERIFIED').length
  const pending = reports.filter(r => r.status === 'PENDING').length
  return <main>
    <section className="hero">
      <Reveal className="hero-copy">
        <div className="eyebrow"><span className="pulse"/> TAMIL NADU ROAD AWARENESS · தமிழ்நாடு சாலை பாதுகாப்பு</div>
        <h1>Safer roads for<br/><em>every Tamil Nadu journey.</em></h1>
        <p>From Chennai traffic to Nilgiris hill roads and monsoon waterlogging, help your district identify hazards and make informed journeys.</p>
        <div className="hero-actions"><Link to="/map" className="button">Explore the map <ArrowRight size={17}/></Link><Link to="/report" className="button button-outline"><Plus size={17}/> Report a hazard</Link></div>
        <div className="trust-line"><ShieldCheck size={16}/> 38 districts · Community-powered · தமிழ் + English</div>
      </Reveal>
      <Reveal className="hero-visual" delay={140}>
        <div className="map-orbit"><div className="orbit-line"/><div className="map-dot dot-one"><AlertTriangle size={17}/></div><div className="map-dot dot-two"><Siren size={17}/></div><div className="map-dot dot-three"><MapPinned size={17}/></div><div className="orbit-center"><Compass size={44}/><b>SAFER<br/>ROUTES</b></div></div>
        <div className="floating-card"><span className="live-dot"/> Tamil Nadu reports <strong>{reports.length}</strong><small>Community submissions</small></div>
      </Reveal>
    </section>
    <Reveal><section className="stats-grid">
      <Stat icon={<MapPinned/>} label="Total reports" value={reports.length}/>
      <Stat icon={<CheckCircle2/>} label="Verified reports" value={verified}/>
      <Stat icon={<AlertTriangle/>} label="Awaiting review" value={pending}/>
    </section></Reveal>
    <Reveal><section className="section-head"><div><div className="eyebrow">COMMUNITY ACTIVITY</div><h2>Recent district reports</h2></div><Link to="/map" className="text-link">View map <ArrowRight size={15}/></Link></section></Reveal>
    <Reveal><ReportList reports={reports.slice(0,5)}/></Reveal>
    {!user && <Reveal><section className="join-banner"><div><h2>உங்கள் பகுதியை பாதுகாப்பாக்குங்கள்.</h2><p>Create an account to report potholes, flooding, unsafe junctions and other local road issues.</p></div><Link to="/register" className="button">Join SafeRoute <ArrowRight size={16}/></Link></section></Reveal>}
  </main>
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return <div className="stat-card"><div className="stat-icon">{icon}</div><div><strong>{value}</strong><span>{label}</span></div></div>
}

function ReportList({ reports }: { reports: Report[] }) {
  if (!reports.length) return <div className="empty-state"><MapPinned size={28}/><b>No reports yet</b><span>Be the first to share a road condition in your area.</span></div>
  return <div className="report-list">{reports.map(r => <article className="report-row" key={r.id}>
    <div className={`severity-icon ${r.severity?.toLowerCase()}`}><AlertTriangle size={18}/></div>
    <div className="report-main"><b>{r.title}</b><span>{r.category?.replaceAll('_',' ')} · {r.address || 'Location submitted'}</span></div>
    <span className={`status status-${r.status?.toLowerCase()}`}>{r.status}</span>
    <span className="date">{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'Recently'}</span>
  </article>)}</div>
}

function MapPage({ reports }: { reports: Report[] }) {
  const [filter, setFilter] = useState('ALL')
  const [district, setDistrict] = useState('ALL')
  const visible = reports.filter(r => (filter === 'ALL' || r.category === filter) && (district === 'ALL' || (r.address || '').toLowerCase().includes(district.toLowerCase())))
  const mapCentre = district === 'ALL' ? [10.9,78.4] as [number,number] : (DISTRICT_CENTRES[district] || [10.9,78.4])
  return <main className="page">
    <Reveal><div className="page-title"><div><div className="eyebrow">38 DISTRICTS · தமிழ்நாடு</div><h1>Tamil Nadu safety map</h1><p>Find community-reported road hazards across Tamil Nadu.</p></div><Link to="/report" className="button"><Plus size={16}/> Report hazard</Link></div></Reveal>
    <div className="map-filters"><label>District</label><select value={district} onChange={e=>setDistrict(e.target.value)}><option value="ALL">All Tamil Nadu</option>{TN_DISTRICTS.map(d=><option key={d} value={d}>{d}</option>)}</select><label>Hazard</label><select value={filter} onChange={e=>setFilter(e.target.value)}><option value="ALL">All categories</option>{HAZARD_CATEGORIES.map(x=><option key={x} value={x}>{x.replaceAll('_',' ')}</option>)}</select><span>{visible.length} reports shown</span></div>
    <Reveal><div className="map-layout"><div className="map-frame"><MapContainer key={district} center={mapCentre} zoom={district === 'ALL' ? 6.5 : 11} scrollWheelZoom style={{height:'100%',width:'100%'}}><TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>{visible.map(r=><Marker key={r.id} position={coords(r)} icon={markerIcon}><Popup><b>{r.title}</b><br/>{r.category} · {r.severity}<br/>{r.status}</Popup></Marker>)}</MapContainer></div><aside className="map-side"><h3>{district === 'ALL' ? 'Tamil Nadu reports' : `${district} reports`}</h3><ReportList reports={visible.slice(0,12)}/><small>Map tiles © OpenStreetMap contributors. Select a district to zoom in. Report coordinates are community supplied and may need verification.</small></aside></div></Reveal>
  </main>
}

function ReportPage({ user, onCreated }: { user: User | null; onCreated: () => void }) {
  const [district, setDistrict] = useState('Chennai')
  const [form, setForm] = useState({title:'',description:'',category:'POTHOLE',severity:'MEDIUM',latitude:'13.0827',longitude:'80.2707',address:''})
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const nav = useNavigate()
  async function locate() {
    if (!navigator.geolocation) { setMessage('Geolocation is not supported by this browser.'); return }
    navigator.geolocation.getCurrentPosition(pos => setForm(f=>({...f,latitude:String(pos.coords.latitude),longitude:String(pos.coords.longitude)})), () => setMessage('Location permission was unavailable. You can enter coordinates manually.'))
  }
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setMessage('')
    if (!user) { nav('/login'); return }
    setBusy(true)
    try {
      const districtAddress = [form.address.trim(), district, 'Tamil Nadu'].filter(Boolean).join(', ')
      await api.post('/reports', {...form, address:districtAddress, latitude:Number(form.latitude), longitude:Number(form.longitude)})
      setMessage('Report submitted. It will appear as pending until reviewed.')
      setForm(f=>({...f,title:'',description:'',address:''})); onCreated()
    } catch (err:any) { setMessage(err.response?.data?.message || 'Could not submit report. Please try again.') }
    finally { setBusy(false) }
  }
  return <main className="page narrow">
    <Reveal><div className="page-title"><div><div className="eyebrow">REPORT FOR YOUR DISTRICT · உங்கள் பகுதியில் தெரிவிக்கவும்</div><h1>Report a local road issue</h1><p>Help your district respond to potholes, waterlogging, unsafe roads and other hazards. Never put yourself in danger to report an issue.</p></div></div></Reveal>
    {!user && <div className="notice">You need to <Link to="/login">sign in</Link> before submitting a report.</div>}
    <Reveal><form className="form-card" onSubmit={submit}>
      <label>Report title<input required maxLength={120} placeholder="e.g. Large pothole near the bus stop" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></label>
      <div className="form-grid"><label>District / மாவட்டம்<select value={district} onChange={e=>{const next=e.target.value;setDistrict(next);const centre=DISTRICT_CENTRES[next];if(centre)setForm(f=>({...f,latitude:String(centre[0]),longitude:String(centre[1])}))}}>{TN_DISTRICTS.map(d=><option key={d} value={d}>{d}</option>)}</select></label><label>Hazard category / பிரச்சினை<select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>{HAZARD_CATEGORIES.map(x=><option key={x} value={x}>{x.replaceAll('_',' ')}</option>)}</select></label></div>
      <label>Severity<select value={form.severity} onChange={e=>setForm({...form,severity:e.target.value})}>{['LOW','MEDIUM','HIGH','CRITICAL'].map(x=><option key={x}>{x}</option>)}</select></label>
      <label>Description<textarea required maxLength={2000} rows={4} placeholder="Describe the issue, nearby landmark, traffic impact and when you noticed it..." value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></label>
      <label>Address or nearby landmark<input maxLength={140} placeholder="Street, area, bus stop or nearby landmark" value={form.address} onChange={e=>setForm({...form,address:e.target.value})}/></label>
      <div className="form-grid"><label>Latitude<input required type="number" step="any" value={form.latitude} onChange={e=>setForm({...form,latitude:e.target.value})}/></label><label>Longitude<input required type="number" step="any" value={form.longitude} onChange={e=>setForm({...form,longitude:e.target.value})}/></label></div>
      <button type="button" className="button button-outline" onClick={locate}><MapPinned size={16}/> Use my current location</button>
      <div className="privacy-note">Location is used to place the report on the map. Only submit reports for genuine observations.</div>
      {message && <div className="notice">{message}</div>}
      <button disabled={busy || !user} className="button submit-button">{busy?'Submitting…':'Submit report'} <ArrowRight size={16}/></button>
    </form></Reveal>
  </main>
}

function AuthPage({ mode, onAuth }: { mode: 'login'|'register'; onAuth: (token:string,user:User)=>void }) {
  const [name,setName] = useState(''); const [email,setEmail] = useState(''); const [password,setPassword] = useState('')
  const [error,setError] = useState(''); const [busy,setBusy] = useState(false)
  async function submit(e:React.FormEvent) {
    e.preventDefault(); setBusy(true); setError('')
    try {
      const res = await api.post(`/auth/${mode}`, mode==='register'?{name,email,password}:{email,password})
      onAuth(res.data.token,res.data.user)
    } catch(err:any) { setError(err.response?.data?.message || 'Authentication failed. Check your details and backend.') }
    finally { setBusy(false) }
  }
  return <main className="auth-wrap"><Reveal><form className="form-card auth-card" onSubmit={submit}>
    <div className="brand large"><span className="brand-mark"><ShieldCheck/></span> SafeRoute</div>
    <div className="eyebrow">{mode==='login'?'WELCOME BACK':'JOIN THE COMMUNITY'}</div><h1>{mode==='login'?'Sign in':'Create account'}</h1>
    {mode==='register' && <label>Your name<input required value={name} onChange={e=>setName(e.target.value)} placeholder="Full name"/></label>}
    <label>Email address<input required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/></label>
    <label>Password<input required minLength={8} type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 8 characters"/></label>
    {error && <div className="notice">{error}</div>}
    <button className="button submit-button" disabled={busy}>{busy?'Please wait…':mode==='login'?'Sign in':'Create account'}</button>
    <p className="auth-switch">{mode==='login'?"New to SafeRoute? ":"Already registered? "}<Link to={mode==='login'?'/register':'/login'}>{mode==='login'?'Create an account':'Sign in'}</Link></p>
  </form></Reveal></main>
}

function AdminPage({ user, onChanged }: { user: User | null; onChanged:()=>void }) {
  const [items,setItems] = useState<Report[]>([]); const [msg,setMsg] = useState('')
  useEffect(()=>{ if(user?.role==='ADMIN') api.get('/admin/reports/pending').then(r=>setItems(r.data)).catch(()=>setMsg('Unable to load admin reports.')) },[user])
  async function act(id:string, action:string) {
    try { await api.patch(`/admin/reports/${id}/${action}`); setItems(old=>old.filter(x=>x.id!==id)); onChanged() }
    catch { setMsg('Action failed. Check that your account has ADMIN role.') }
  }
  if(!user) return <main className="page"><div className="notice">Please sign in with an admin account.</div></main>
  if(user.role!=='ADMIN') return <main className="page"><div className="notice">Access denied. Admin permission is required.</div></main>
  return <main className="page"><Reveal><div className="page-title"><div><div className="eyebrow">MODERATION</div><h1>Admin review</h1><p>Review community reports before they are shown as verified.</p></div></div></Reveal>{msg&&<div className="notice">{msg}</div>}<Reveal><div className="report-list">{items.map(r=><div className="admin-row" key={r.id}><div><b>{r.title}</b><p>{r.description}</p><small>{r.category} · {r.severity} · {r.address}</small></div><div className="admin-actions"><button className="button button-small" onClick={()=>act(r.id,'verify')}>Verify</button><button className="button button-small button-danger" onClick={()=>act(r.id,'reject')}>Reject</button></div></div>)}{!items.length&&<div className="empty-state">No pending reports.</div>}</div></Reveal></main>
}

export default App
