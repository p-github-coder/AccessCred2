import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon, Org, Tag } from '../components/ui'
import { useApp } from '../context/AppContext'

const STAGES = ['Submitted', 'Under review', 'Interview', 'Offer']
const ALL = [...STAGES, 'Rejected']
const d = (t) => new Date(t).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
export default function Applications() {
  const { me, patch } = useApp(); const [tab, setTab] = useState('All')
  const rows = me.apps.filter((a) => tab === 'All' || a.status === tab)
  const setStatus = (jid, s) => patch((u) => ({ ...u, apps: u.apps.map((a) => (a.jid === jid ? { ...a, status: s, events: [...a.events, { s, t: Date.now() }] } : a)) }))
  return (
    <div className="col">
      <div><h1>Applications</h1><p className="mut">Track every job you have applied to.</p></div>
      <div className="stats2">{['All', ...ALL].map((s) => <button key={s} className={'stat' + (tab === s ? ' on' : '')} onClick={() => setTab(s)}><b>{s === 'All' ? me.apps.length : me.apps.filter((a) => a.status === s).length}</b><span>{s}</span></button>)}</div>
      {rows.map((a) => {
        const idx = STAGES.indexOf(a.status)
        return (
          <div key={a.jid} className="card col">
            <div className="row" style={{ alignItems: 'flex-start' }}><Org o={a} /><div className="grow"><Link to={'/jobs/' + encodeURIComponent(a.jid)}><h4 className="jt">{a.title}</h4></Link><div className="mut sm">{a.org} • {a.location} • {a.type}</div><div className="mut sm">Applied {d(a.date)}</div></div>
              <Tag tone={a.status === 'Offer' ? 'ok' : a.status === 'Rejected' ? 'bad' : 'brand'}>{a.status}</Tag></div>
            {a.status !== 'Rejected' && <div className="pipe">{STAGES.map((s, i) => <div key={s} className={i <= idx ? 'on' : ''}><i />{s}</div>)}</div>}
            <div className="row between wrap"><span className="mut sm">Last update: {d(a.events[a.events.length - 1].t)}{a.gen ? ' • partner employer' : ''}</span>
              <div className="row"><select aria-label="Update status" value={a.status} onChange={(e) => setStatus(a.jid, e.target.value)}>{ALL.map((s) => <option key={s}>{s}</option>)}</select>
                <button className="btn ghost sm" onClick={() => confirm('Withdraw this application?') && patch((u) => ({ ...u, apps: u.apps.filter((x) => x.jid !== a.jid) }))}>Withdraw</button></div></div>
          </div>)
      })}
      {!rows.length && <div className="card col" style={{ alignItems: 'flex-start' }}><Icon n="file" size={24} /><b>No applications here yet</b><span className="mut">Find a job and apply. It will be tracked here.</span><Link to="/jobs" className="btn sm">Browse jobs</Link></div>}
    </div>
  )
}
