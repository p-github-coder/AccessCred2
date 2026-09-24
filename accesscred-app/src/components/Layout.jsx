import { useState } from 'react'
import { Link, Navigate, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Avatar, Icon, Logo } from './ui'
import { useApp } from '../context/AppContext'

const ITEMS = [['/home', 'Home', 'home'], ['/jobs', 'Jobs', 'briefcase'], ['/applications', 'Applications', 'file'], ['/messages', 'Messages', 'msg'], ['/verify', 'Skills', 'shield']]
export function RequireAuth() {
  const { me } = useApp()
  if (!me) return <Navigate to="/login" replace />
  return me.profile.onboarded ? <Outlet /> : <Navigate to="/onboarding" replace />
}
export default function Layout() {
  const { me, logout } = useApp()
  const nav = useNavigate(); const [q, setQ] = useState(''); const [menu, setMenu] = useState(false)
  return (
    <>
      <header className="nav"><div className="wrap-nav">
        <Logo to={me ? '/home' : '/'} />
        <form className="navsearch" onSubmit={(e) => { e.preventDefault(); nav('/jobs?q=' + encodeURIComponent(q)) }}><Icon n="search" size={16} /><input aria-label="Search jobs" placeholder="Search jobs, skills, companies" value={q} onChange={(e) => setQ(e.target.value)} /></form>
        <nav className="navlinks">{me && ITEMS.map(([p, l, i]) => <NavLink key={p} to={p} className={({ isActive }) => (isActive ? 'on' : '')}><Icon n={i} /><span>{l}</span></NavLink>)}{!me && <NavLink to="/jobs" className={({ isActive }) => (isActive ? 'on' : '')}><Icon n="briefcase" /><span>Jobs</span></NavLink>}</nav>
        {me ? <div className="menuwrap"><button className="avbtn" onClick={() => setMenu(!menu)} aria-label="Account menu"><Avatar name={me.name} /><Icon n="chev" size={14} /></button>
          {menu && <div className="menu" onClick={() => setMenu(false)}><div className="menuhead"><b>{me.name}</b><div className="mut sm">{me.profile.focus || me.email}</div></div><Link to="/profile">View profile</Link><Link to="/settings">Settings</Link><button onClick={logout}>Log out</button></div>}</div>
          : <div className="row"><Link to="/login" className="btn outline sm">Log in</Link><Link to="/signup" className="btn sm">Join now</Link></div>}
      </div></header>
      <main className="page"><Outlet /></main>
      {me && <nav className="bottom">{ITEMS.map(([p, l, i]) => <NavLink key={p} to={p} className={({ isActive }) => (isActive ? 'on' : '')}><Icon n={i} /><span>{l}</span></NavLink>)}</nav>}
    </>
  )
}
