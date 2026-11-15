import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowRight, CheckCircle2, Compass, LogOut, MapPinned, Plus, ShieldCheck, Siren } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import api from './api';
const TN_DISTRICTS = ['Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore', 'Dharmapuri', 'Dindigul', 'Erode', 'Kallakurichi', 'Kancheepuram', 'Kanniyakumari', 'Karur', 'Krishnagiri', 'Madurai', 'Mayiladuthurai', 'Nagapattinam', 'Namakkal', 'Nilgiris', 'Perambalur', 'Pudukkottai', 'Ramanathapuram', 'Ranipet', 'Salem', 'Sivaganga', 'Tenkasi', 'Thanjavur', 'Theni', 'Thoothukudi', 'Tiruchirappalli', 'Tirunelveli', 'Tirupathur', 'Tiruppur', 'Tiruvallur', 'Tiruvannamalai', 'Tiruvarur', 'Vellore', 'Viluppuram', 'Virudhunagar'];
const DISTRICT_CENTRES = {
    Chennai: [13.0827, 80.2707], Coimbatore: [11.0168, 76.9558], Madurai: [9.9252, 78.1198],
    Tiruchirappalli: [10.7905, 78.7047], Salem: [11.6643, 78.1460], Tirunelveli: [8.7139, 77.7567],
    Erode: [11.3410, 77.7172], Tiruppur: [11.1085, 77.3411], Thanjavur: [10.7870, 79.1378],
    Vellore: [12.9165, 79.1325], Dindigul: [10.3673, 77.9803], Thoothukudi: [8.7642, 78.1348],
    Kanyakumari: [8.0883, 77.5385], Kanniyakumari: [8.0883, 77.5385], Kancheepuram: [12.8342, 79.7036],
    Chengalpattu: [12.6819, 79.9888], Tiruvallur: [13.1439, 79.9089], Cuddalore: [11.7480, 79.7714],
    Krishnagiri: [12.5186, 78.2137], Dharmapuri: [12.1277, 78.1579], Namakkal: [11.2189, 78.1677],
    Karur: [10.9601, 78.0766], Theni: [10.0104, 77.4768], Ramanathapuram: [9.3639, 78.8395],
    Sivaganga: [9.8433, 78.4809], Virudhunagar: [9.5680, 77.9624], Tenkasi: [8.9590, 77.3152],
    Nagapattinam: [10.7672, 79.8449], Mayiladuthurai: [11.1035, 79.6550], Tiruvarur: [10.7727, 79.6368],
    Nilgiris: [11.4102, 76.6950], Ariyalur: [11.1401, 79.0786], Perambalur: [11.2342, 78.8807],
    Pudukkottai: [10.3797, 78.8208], Viluppuram: [11.9401, 79.4861], Kallakurichi: [11.7380, 78.9639],
    Ranipet: [12.9273, 79.3333], Tirupathur: [12.4967, 78.5730]
};
const HAZARD_CATEGORIES = ['POTHOLE', 'FLOODING', 'WATERLOGGING', 'ROAD_DAMAGE', 'OPEN_MANHOLE', 'STREETLIGHT', 'SIGNAL', 'BLOCKAGE', 'FALLEN_TREE', 'STRAY_CATTLE', 'ROADWORK', 'OTHER'];
const markerIcon = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41]
});
function coords(r) {
    const loc = r.location;
    if (loc?.coordinates)
        return [loc.coordinates[1], loc.coordinates[0]];
    return [loc?.y ?? 13.0827, loc?.x ?? 80.2707];
}
function Reveal({ children, className = '', delay = 0 }) {
    const ref = useRef(null);
    useEffect(() => {
        const node = ref.current;
        if (!node)
            return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            node.classList.add('is-visible');
            return;
        }
        if (!('IntersectionObserver' in window)) {
            node.classList.add('is-visible');
            return;
        }
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                node.classList.add('is-visible');
                observer.unobserve(node);
            }
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
        observer.observe(node);
        return () => observer.disconnect();
    }, []);
    return _jsx("div", { ref: ref, className: `reveal ${className}`, style: { transitionDelay: `${delay}ms` }, children: children });
}
function Header({ user, onLogout }) {
    return _jsxs("header", { className: "topbar", children: [_jsxs(Link, { to: "/", className: "brand", children: [_jsx("span", { className: "brand-mark", children: _jsx(ShieldCheck, { size: 20 }) }), " SafeRoute ", _jsx("small", { className: "brand-region", children: "\u0BA4\u0BAE\u0BBF\u0BB4\u0BCD\u0BA8\u0BBE\u0B9F\u0BC1" })] }), _jsxs("nav", { children: [_jsx(NavLink, { to: "/", children: "Home / \u0BAE\u0BC1\u0B95\u0BAA\u0BCD\u0BAA\u0BC1" }), _jsx(NavLink, { to: "/map", children: "Tamil Nadu map" }), _jsx(NavLink, { to: "/report", children: "Report issue" })] }), _jsx("div", { className: "account", children: user ? _jsxs(_Fragment, { children: [_jsx("span", { className: "user-chip", children: user.name }), _jsx("button", { className: "icon-btn", onClick: onLogout, title: "Log out", children: _jsx(LogOut, { size: 17 }) })] }) :
                    _jsx(Link, { className: "button button-small", to: "/login", children: "Sign in" }) })] });
}
function App() {
    const [user, setUser] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('saferoute_user') || 'null');
        }
        catch {
            return null;
        }
    });
    const [reports, setReports] = useState([]);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    async function loadReports() {
        try {
            const res = await api.get('/reports');
            setReports(res.data);
        }
        catch {
            setError('Could not load reports. Check that the backend and database are running.');
        }
    }
    useEffect(() => { loadReports(); }, []);
    function logout() {
        localStorage.removeItem('saferoute_token');
        localStorage.removeItem('saferoute_user');
        setUser(null);
        navigate('/');
    }
    function onAuth(token, nextUser) {
        localStorage.setItem('saferoute_token', token);
        localStorage.setItem('saferoute_user', JSON.stringify(nextUser));
        setUser(nextUser);
        navigate('/');
    }
    return _jsxs("div", { className: "app-shell", children: [_jsx(Header, { user: user, onLogout: logout }), error && _jsx("div", { className: "notice", children: error }), _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(Home, { reports: reports, user: user }) }), _jsx(Route, { path: "/map", element: _jsx(MapPage, { reports: reports }) }), _jsx(Route, { path: "/report", element: _jsx(ReportPage, { user: user, onCreated: loadReports }) }), _jsx(Route, { path: "/login", element: _jsx(AuthPage, { mode: "login", onAuth: onAuth }) }), _jsx(Route, { path: "/register", element: _jsx(AuthPage, { mode: "register", onAuth: onAuth }) }), _jsx(Route, { path: "/admin", element: _jsx(AdminPage, { user: user, onChanged: loadReports }) }), _jsx(Route, { path: "*", element: _jsx(Home, { reports: reports, user: user }) })] }), _jsxs("footer", { children: ["\u00A9 ", new Date().getFullYear(), " SafeRoute Tamil Nadu ", _jsx("span", { children: "\u0BAE\u0B95\u0BCD\u0B95\u0BB3\u0BCD \u0BAA\u0B99\u0BCD\u0B95\u0BB3\u0BBF\u0BAA\u0BCD\u0BAA\u0BC1\u0B9F\u0BA9\u0BCD \u0B9A\u0BBE\u0BB2\u0BC8 \u0BAA\u0BBE\u0BA4\u0BC1\u0B95\u0BBE\u0BAA\u0BCD\u0BAA\u0BC1 \u00B7 Community-powered road safety" })] })] });
}
function Home({ reports, user }) {
    const verified = reports.filter(r => r.status === 'VERIFIED').length;
    const pending = reports.filter(r => r.status === 'PENDING').length;
    return _jsxs("main", { children: [_jsxs("section", { className: "hero", children: [_jsxs(Reveal, { className: "hero-copy", children: [_jsxs("div", { className: "eyebrow", children: [_jsx("span", { className: "pulse" }), " TAMIL NADU ROAD AWARENESS \u00B7 \u0BA4\u0BAE\u0BBF\u0BB4\u0BCD\u0BA8\u0BBE\u0B9F\u0BC1 \u0B9A\u0BBE\u0BB2\u0BC8 \u0BAA\u0BBE\u0BA4\u0BC1\u0B95\u0BBE\u0BAA\u0BCD\u0BAA\u0BC1"] }), _jsxs("h1", { children: ["Safer roads for", _jsx("br", {}), _jsx("em", { children: "every Tamil Nadu journey." })] }), _jsx("p", { children: "From Chennai traffic to Nilgiris hill roads and monsoon waterlogging, help your district identify hazards and make informed journeys." }), _jsxs("div", { className: "hero-actions", children: [_jsxs(Link, { to: "/map", className: "button", children: ["Explore the map ", _jsx(ArrowRight, { size: 17 })] }), _jsxs(Link, { to: "/report", className: "button button-outline", children: [_jsx(Plus, { size: 17 }), " Report a hazard"] })] }), _jsxs("div", { className: "trust-line", children: [_jsx(ShieldCheck, { size: 16 }), " 38 districts \u00B7 Community-powered \u00B7 \u0BA4\u0BAE\u0BBF\u0BB4\u0BCD + English"] })] }), _jsxs(Reveal, { className: "hero-visual", delay: 140, children: [_jsxs("div", { className: "map-orbit", children: [_jsx("div", { className: "orbit-line" }), _jsx("div", { className: "map-dot dot-one", children: _jsx(AlertTriangle, { size: 17 }) }), _jsx("div", { className: "map-dot dot-two", children: _jsx(Siren, { size: 17 }) }), _jsx("div", { className: "map-dot dot-three", children: _jsx(MapPinned, { size: 17 }) }), _jsxs("div", { className: "orbit-center", children: [_jsx(Compass, { size: 44 }), _jsxs("b", { children: ["SAFER", _jsx("br", {}), "ROUTES"] })] })] }), _jsxs("div", { className: "floating-card", children: [_jsx("span", { className: "live-dot" }), " Tamil Nadu reports ", _jsx("strong", { children: reports.length }), _jsx("small", { children: "Community submissions" })] })] })] }), _jsx(Reveal, { children: _jsxs("section", { className: "stats-grid", children: [_jsx(Stat, { icon: _jsx(MapPinned, {}), label: "Total reports", value: reports.length }), _jsx(Stat, { icon: _jsx(CheckCircle2, {}), label: "Verified reports", value: verified }), _jsx(Stat, { icon: _jsx(AlertTriangle, {}), label: "Awaiting review", value: pending })] }) }), _jsx(Reveal, { children: _jsxs("section", { className: "section-head", children: [_jsxs("div", { children: [_jsx("div", { className: "eyebrow", children: "COMMUNITY ACTIVITY" }), _jsx("h2", { children: "Recent district reports" })] }), _jsxs(Link, { to: "/map", className: "text-link", children: ["View map ", _jsx(ArrowRight, { size: 15 })] })] }) }), _jsx(Reveal, { children: _jsx(ReportList, { reports: reports.slice(0, 5) }) }), !user && _jsx(Reveal, { children: _jsxs("section", { className: "join-banner", children: [_jsxs("div", { children: [_jsx("h2", { children: "\u0B89\u0B99\u0BCD\u0B95\u0BB3\u0BCD \u0BAA\u0B95\u0BC1\u0BA4\u0BBF\u0BAF\u0BC8 \u0BAA\u0BBE\u0BA4\u0BC1\u0B95\u0BBE\u0BAA\u0BCD\u0BAA\u0BBE\u0B95\u0BCD\u0B95\u0BC1\u0B99\u0BCD\u0B95\u0BB3\u0BCD." }), _jsx("p", { children: "Create an account to report potholes, flooding, unsafe junctions and other local road issues." })] }), _jsxs(Link, { to: "/register", className: "button", children: ["Join SafeRoute ", _jsx(ArrowRight, { size: 16 })] })] }) })] });
}
function Stat({ icon, label, value }) {
    return _jsxs("div", { className: "stat-card", children: [_jsx("div", { className: "stat-icon", children: icon }), _jsxs("div", { children: [_jsx("strong", { children: value }), _jsx("span", { children: label })] })] });
}
function ReportList({ reports }) {
    if (!reports.length)
        return _jsxs("div", { className: "empty-state", children: [_jsx(MapPinned, { size: 28 }), _jsx("b", { children: "No reports yet" }), _jsx("span", { children: "Be the first to share a road condition in your area." })] });
    return _jsx("div", { className: "report-list", children: reports.map(r => _jsxs("article", { className: "report-row", children: [_jsx("div", { className: `severity-icon ${r.severity?.toLowerCase()}`, children: _jsx(AlertTriangle, { size: 18 }) }), _jsxs("div", { className: "report-main", children: [_jsx("b", { children: r.title }), _jsxs("span", { children: [r.category?.replaceAll('_', ' '), " \u00B7 ", r.address || 'Location submitted'] })] }), _jsx("span", { className: `status status-${r.status?.toLowerCase()}`, children: r.status }), _jsx("span", { className: "date", children: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'Recently' })] }, r.id)) });
}
function MapPage({ reports }) {
    const [filter, setFilter] = useState('ALL');
    const [district, setDistrict] = useState('ALL');
    const visible = reports.filter(r => (filter === 'ALL' || r.category === filter) && (district === 'ALL' || (r.address || '').toLowerCase().includes(district.toLowerCase())));
    const mapCentre = district === 'ALL' ? [10.9, 78.4] : (DISTRICT_CENTRES[district] || [10.9, 78.4]);
    return _jsxs("main", { className: "page", children: [_jsx(Reveal, { children: _jsxs("div", { className: "page-title", children: [_jsxs("div", { children: [_jsx("div", { className: "eyebrow", children: "38 DISTRICTS \u00B7 \u0BA4\u0BAE\u0BBF\u0BB4\u0BCD\u0BA8\u0BBE\u0B9F\u0BC1" }), _jsx("h1", { children: "Tamil Nadu safety map" }), _jsx("p", { children: "Find community-reported road hazards across Tamil Nadu." })] }), _jsxs(Link, { to: "/report", className: "button", children: [_jsx(Plus, { size: 16 }), " Report hazard"] })] }) }), _jsxs("div", { className: "map-filters", children: [_jsx("label", { children: "District" }), _jsxs("select", { value: district, onChange: e => setDistrict(e.target.value), children: [_jsx("option", { value: "ALL", children: "All Tamil Nadu" }), TN_DISTRICTS.map(d => _jsx("option", { value: d, children: d }, d))] }), _jsx("label", { children: "Hazard" }), _jsxs("select", { value: filter, onChange: e => setFilter(e.target.value), children: [_jsx("option", { value: "ALL", children: "All categories" }), HAZARD_CATEGORIES.map(x => _jsx("option", { value: x, children: x.replaceAll('_', ' ') }, x))] }), _jsxs("span", { children: [visible.length, " reports shown"] })] }), _jsx(Reveal, { children: _jsxs("div", { className: "map-layout", children: [_jsx("div", { className: "map-frame", children: _jsxs(MapContainer, { center: mapCentre, zoom: district === 'ALL' ? 6.5 : 11, scrollWheelZoom: true, style: { height: '100%', width: '100%' }, children: [_jsx(TileLayer, { attribution: '\u00A9 OpenStreetMap contributors', url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" }), visible.map(r => _jsx(Marker, { position: coords(r), icon: markerIcon, children: _jsxs(Popup, { children: [_jsx("b", { children: r.title }), _jsx("br", {}), r.category, " \u00B7 ", r.severity, _jsx("br", {}), r.status] }) }, r.id))] }, district) }), _jsxs("aside", { className: "map-side", children: [_jsx("h3", { children: district === 'ALL' ? 'Tamil Nadu reports' : `${district} reports` }), _jsx(ReportList, { reports: visible.slice(0, 12) }), _jsx("small", { children: "Map tiles \u00A9 OpenStreetMap contributors. Select a district to zoom in. Report coordinates are community supplied and may need verification." })] })] }) })] });
}
function ReportPage({ user, onCreated }) {
    const [district, setDistrict] = useState('Chennai');
    const [form, setForm] = useState({ title: '', description: '', category: 'POTHOLE', severity: 'MEDIUM', latitude: '13.0827', longitude: '80.2707', address: '' });
    const [message, setMessage] = useState('');
    const [busy, setBusy] = useState(false);
    const nav = useNavigate();
    async function locate() {
        if (!navigator.geolocation) {
            setMessage('Geolocation is not supported by this browser.');
            return;
        }
        navigator.geolocation.getCurrentPosition(pos => setForm(f => ({ ...f, latitude: String(pos.coords.latitude), longitude: String(pos.coords.longitude) })), () => setMessage('Location permission was unavailable. You can enter coordinates manually.'));
    }
    async function submit(e) {
        e.preventDefault();
        setMessage('');
        if (!user) {
            nav('/login');
            return;
        }
        setBusy(true);
        try {
            const districtAddress = [form.address.trim(), district, 'Tamil Nadu'].filter(Boolean).join(', ');
            await api.post('/reports', { ...form, address: districtAddress, latitude: Number(form.latitude), longitude: Number(form.longitude) });
            setMessage('Report submitted. It will appear as pending until reviewed.');
            setForm(f => ({ ...f, title: '', description: '', address: '' }));
            onCreated();
        }
        catch (err) {
            setMessage(err.response?.data?.message || 'Could not submit report. Please try again.');
        }
        finally {
            setBusy(false);
        }
    }
    return _jsxs("main", { className: "page narrow", children: [_jsx(Reveal, { children: _jsx("div", { className: "page-title", children: _jsxs("div", { children: [_jsx("div", { className: "eyebrow", children: "REPORT FOR YOUR DISTRICT \u00B7 \u0B89\u0B99\u0BCD\u0B95\u0BB3\u0BCD \u0BAA\u0B95\u0BC1\u0BA4\u0BBF\u0BAF\u0BBF\u0BB2\u0BCD \u0BA4\u0BC6\u0BB0\u0BBF\u0BB5\u0BBF\u0B95\u0BCD\u0B95\u0BB5\u0BC1\u0BAE\u0BCD" }), _jsx("h1", { children: "Report a local road issue" }), _jsx("p", { children: "Help your district respond to potholes, waterlogging, unsafe roads and other hazards. Never put yourself in danger to report an issue." })] }) }) }), !user && _jsxs("div", { className: "notice", children: ["You need to ", _jsx(Link, { to: "/login", children: "sign in" }), " before submitting a report."] }), _jsx(Reveal, { children: _jsxs("form", { className: "form-card", onSubmit: submit, children: [_jsxs("label", { children: ["Report title", _jsx("input", { required: true, maxLength: 120, placeholder: "e.g. Large pothole near the bus stop", value: form.title, onChange: e => setForm({ ...form, title: e.target.value }) })] }), _jsxs("div", { className: "form-grid", children: [_jsxs("label", { children: ["District / \u0BAE\u0BBE\u0BB5\u0B9F\u0BCD\u0B9F\u0BAE\u0BCD", _jsx("select", { value: district, onChange: e => { const next = e.target.value; setDistrict(next); const centre = DISTRICT_CENTRES[next]; if (centre)
                                                setForm(f => ({ ...f, latitude: String(centre[0]), longitude: String(centre[1]) })); }, children: TN_DISTRICTS.map(d => _jsx("option", { value: d, children: d }, d)) })] }), _jsxs("label", { children: ["Hazard category / \u0BAA\u0BBF\u0BB0\u0B9A\u0BCD\u0B9A\u0BBF\u0BA9\u0BC8", _jsx("select", { value: form.category, onChange: e => setForm({ ...form, category: e.target.value }), children: HAZARD_CATEGORIES.map(x => _jsx("option", { value: x, children: x.replaceAll('_', ' ') }, x)) })] })] }), _jsxs("label", { children: ["Severity", _jsx("select", { value: form.severity, onChange: e => setForm({ ...form, severity: e.target.value }), children: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map(x => _jsx("option", { children: x }, x)) })] }), _jsxs("label", { children: ["Description", _jsx("textarea", { required: true, maxLength: 2000, rows: 4, placeholder: "Describe the issue, nearby landmark, traffic impact and when you noticed it...", value: form.description, onChange: e => setForm({ ...form, description: e.target.value }) })] }), _jsxs("label", { children: ["Address or nearby landmark", _jsx("input", { maxLength: 140, placeholder: "Street, area, bus stop or nearby landmark", value: form.address, onChange: e => setForm({ ...form, address: e.target.value }) })] }), _jsxs("div", { className: "form-grid", children: [_jsxs("label", { children: ["Latitude", _jsx("input", { required: true, type: "number", step: "any", value: form.latitude, onChange: e => setForm({ ...form, latitude: e.target.value }) })] }), _jsxs("label", { children: ["Longitude", _jsx("input", { required: true, type: "number", step: "any", value: form.longitude, onChange: e => setForm({ ...form, longitude: e.target.value }) })] })] }), _jsxs("button", { type: "button", className: "button button-outline", onClick: locate, children: [_jsx(MapPinned, { size: 16 }), " Use my current location"] }), _jsx("div", { className: "privacy-note", children: "Location is used to place the report on the map. Only submit reports for genuine observations." }), message && _jsx("div", { className: "notice", children: message }), _jsxs("button", { disabled: busy || !user, className: "button submit-button", children: [busy ? 'Submitting…' : 'Submit report', " ", _jsx(ArrowRight, { size: 16 })] })] }) })] });
}
function AuthPage({ mode, onAuth }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);
    async function submit(e) {
        e.preventDefault();
        setBusy(true);
        setError('');
        try {
            const res = await api.post(`/auth/${mode}`, mode === 'register' ? { name, email, password } : { email, password });
            onAuth(res.data.token, res.data.user);
        }
        catch (err) {
            setError(err.response?.data?.message || 'Authentication failed. Check your details and backend.');
        }
        finally {
            setBusy(false);
        }
    }
    return _jsx("main", { className: "auth-wrap", children: _jsx(Reveal, { children: _jsxs("form", { className: "form-card auth-card", onSubmit: submit, children: [_jsxs("div", { className: "brand large", children: [_jsx("span", { className: "brand-mark", children: _jsx(ShieldCheck, {}) }), " SafeRoute"] }), _jsx("div", { className: "eyebrow", children: mode === 'login' ? 'WELCOME BACK' : 'JOIN THE COMMUNITY' }), _jsx("h1", { children: mode === 'login' ? 'Sign in' : 'Create account' }), mode === 'register' && _jsxs("label", { children: ["Your name", _jsx("input", { required: true, value: name, onChange: e => setName(e.target.value), placeholder: "Full name" })] }), _jsxs("label", { children: ["Email address", _jsx("input", { required: true, type: "email", value: email, onChange: e => setEmail(e.target.value), placeholder: "you@example.com" })] }), _jsxs("label", { children: ["Password", _jsx("input", { required: true, minLength: 8, type: "password", value: password, onChange: e => setPassword(e.target.value), placeholder: "At least 8 characters" })] }), error && _jsx("div", { className: "notice", children: error }), _jsx("button", { className: "button submit-button", disabled: busy, children: busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account' }), _jsxs("p", { className: "auth-switch", children: [mode === 'login' ? "New to SafeRoute? " : "Already registered? ", _jsx(Link, { to: mode === 'login' ? '/register' : '/login', children: mode === 'login' ? 'Create an account' : 'Sign in' })] })] }) }) });
}
function AdminPage({ user, onChanged }) {
    const [items, setItems] = useState([]);
    const [msg, setMsg] = useState('');
    useEffect(() => { if (user?.role === 'ADMIN')
        api.get('/admin/reports/pending').then(r => setItems(r.data)).catch(() => setMsg('Unable to load admin reports.')); }, [user]);
    async function act(id, action) {
        try {
            await api.patch(`/admin/reports/${id}/${action}`);
            setItems(old => old.filter(x => x.id !== id));
            onChanged();
        }
        catch {
            setMsg('Action failed. Check that your account has ADMIN role.');
        }
    }
    if (!user)
        return _jsx("main", { className: "page", children: _jsx("div", { className: "notice", children: "Please sign in with an admin account." }) });
    if (user.role !== 'ADMIN')
        return _jsx("main", { className: "page", children: _jsx("div", { className: "notice", children: "Access denied. Admin permission is required." }) });
    return _jsxs("main", { className: "page", children: [_jsx(Reveal, { children: _jsx("div", { className: "page-title", children: _jsxs("div", { children: [_jsx("div", { className: "eyebrow", children: "MODERATION" }), _jsx("h1", { children: "Admin review" }), _jsx("p", { children: "Review community reports before they are shown as verified." })] }) }) }), msg && _jsx("div", { className: "notice", children: msg }), _jsx(Reveal, { children: _jsxs("div", { className: "report-list", children: [items.map(r => _jsxs("div", { className: "admin-row", children: [_jsxs("div", { children: [_jsx("b", { children: r.title }), _jsx("p", { children: r.description }), _jsxs("small", { children: [r.category, " \u00B7 ", r.severity, " \u00B7 ", r.address] })] }), _jsxs("div", { className: "admin-actions", children: [_jsx("button", { className: "button button-small", onClick: () => act(r.id, 'verify'), children: "Verify" }), _jsx("button", { className: "button button-small button-danger", onClick: () => act(r.id, 'reject'), children: "Reject" })] })] }, r.id)), !items.length && _jsx("div", { className: "empty-state", children: "No pending reports." })] }) })] });
}
export default App;
