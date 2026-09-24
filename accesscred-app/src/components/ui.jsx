import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ago, matchInfo } from '../services/jobs'

const P = {
  home: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10',
  briefcase: 'M4 7h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16',
  user: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z M9 12l2 2 4-4',
  msg: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
  search: 'M11 3a8 8 0 1 0 0 16 8 8 0 0 0 0-16z M21 21l-4.3-4.3',
  bookmark: 'M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z',
  file: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M9 13h6 M9 17h6',
  scissors: 'M6 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6z M6 15a3 3 0 1 0 0 6 3 3 0 0 0 0-6z M20 4L8.1 15.9 M14.5 14.5L20 20 M8.1 8.1L12 12',
  tool: 'M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4z',
  trend: 'M23 6l-9.5 9.5-5-5L1 18 M17 6h6v6',
  edit: 'M12 20h9 M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z',
  check: 'M20 6L9 17l-5-5', x: 'M18 6L6 18 M6 6l12 12', plus: 'M12 5v14 M5 12h14',
  pin: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
  clock: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M12 6v6l4 2',
  send: 'M22 2L11 13 M22 2l-7 20-4-9-9-4z',
  ext: 'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6 M15 3h6v6 M10 14L21 3',
  building: 'M3 21h18 M5 21V7l7-4 7 4v14 M9 9h.01 M9 13h.01 M9 17h.01 M15 9h.01 M15 13h.01 M15 17h.01',
  chev: 'M6 9l6 6 6-6', upload: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M17 8l-5-5-5 5 M12 3v12',
  award: 'M12 2a6 6 0 1 0 0 12 6 6 0 0 0 0-12z M8.2 13.9L7 23l5-3 5 3-1.2-9.1',
  dollar: 'M12 1v22 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
  globe: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M2 12h20 M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20',
  cap: 'M22 10L12 5 2 10l10 5z M6 12v5c3 3 9 3 12 0v-5',
}
export const Icon = ({ n, size = 18, fill }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {(P[n] || '').split(' M').map((d, i) => <path key={i} d={(i ? 'M' : '') + d} />)}
  </svg>
)
export const Logo = ({ to = '/', light }) => (
  <Link to={to} className={'logo' + (light ? ' light' : '')}><img src={light ? '/logo-mark-white.png' : '/logo-mark.png'} alt="" /><span>Access<b>Cred</b></span></Link>
)
const COL = ['#1D4E89', '#B5432B', '#2F7D5B', '#5B4B9A', '#0F172A', '#8A6212']
export function Org({ o, size = 44 }) {
  const [bad, setBad] = useState(false)
  const c = COL[[...(o.org || 'x')].reduce((a, ch) => a + ch.charCodeAt(0), 0) % COL.length]
  const st = { width: size, height: size, borderRadius: 8, flex: 'none' }
  return o.logo && !bad
    ? <img src={o.logo} alt="" onError={() => setBad(true)} style={{ ...st, objectFit: 'contain', background: '#fff', border: '1px solid var(--ln)', padding: 4 }} />
    : <span className="mono" style={{ ...st, background: c, fontSize: size / 2.4 }}>{(o.org || '?')[0]}</span>
}
export const Avatar = ({ name, size = 36 }) => <span className="avatar" style={{ width: size, height: size, fontSize: size / 3 }}>{name.split(' ').map((x) => x[0]).slice(0, 2).join('').toUpperCase()}</span>
export const Tag = ({ children, tone }) => <span className={'tag' + (tone ? ' ' + tone : '')}>{children}</span>

export function Field({ label, error, hint, as: As = 'input', children, ...p }) {
  return (
    <div className="fld">
      {label && <label htmlFor={p.name}>{label}</label>}
      <As id={p.name} {...p} className={error ? 'bad' : ''} aria-invalid={!!error}>{children}</As>
      {error ? <div className="ferr" role="alert">{error}</div> : hint ? <div className="hint">{hint}</div> : null}
    </div>
  )
}
export function Modal({ title, onClose, children }) {
  useEffect(() => { const f = (e) => e.key === 'Escape' && onClose(); addEventListener('keydown', f); return () => removeEventListener('keydown', f) }, [onClose])
  return (
    <div className="overlay" onMouseDown={onClose}><div className="modal" role="dialog" aria-modal="true" onMouseDown={(e) => e.stopPropagation()}>
      <div className="row between"><h3>{title}</h3><button className="iconbtn" onClick={onClose} aria-label="Close"><Icon n="x" /></button></div>{children}</div></div>
  )
}
export const Skeleton = ({ n = 4 }) => Array.from({ length: n }, (_, i) => <div key={i} className="skel" />)

export function JobCard({ job, profile, active, saved, onSave, onOpen }) {
  const m = matchInfo(job, profile)
  return (
    <article className={'job' + (active ? ' active' : '')} onClick={() => onOpen(job)}>
      <Org o={job} />
      <div className="grow">
        <h4 className="jt">{job.title}</h4>
        <div className="mut sm">{job.org}</div>
        <div className="mut sm row" style={{ gap: 6, flexWrap: 'wrap' }}><span className="row" style={{ gap: 3 }}><Icon n="pin" size={12} />{job.location || 'Not specified'}</span><span>•</span><span>{job.type}</span>{job.remote && <><span>•</span><span>Remote</span></>}</div>
        {job.salary && <div className="sm" style={{ fontWeight: 600, marginTop: 4 }}>{job.salary}</div>}
        <div className="row wrap" style={{ gap: 6, marginTop: 8 }}>
          {job.verified && <Tag tone="ok">Verified employer</Tag>}
          {m && <Tag tone="brand">{m.pct}% match</Tag>}
          <span className="mut sm">{ago(job.posted)} • {job.source}</span>
        </div>
      </div>
      {onSave && <button className={'iconbtn' + (saved ? ' on' : '')} onClick={(e) => { e.stopPropagation(); onSave(job) }} aria-label="Save job"><Icon n="bookmark" fill={saved} /></button>}
    </article>
  )
}
