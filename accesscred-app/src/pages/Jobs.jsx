import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import JobDetail from '../components/JobDetail'
import { Icon, JobCard, Skeleton } from '../components/ui'
import { useApp } from '../context/AppContext'
import { getJob, useJobs } from '../services/jobs'
import { JOB_TYPES } from '../data/content'

export default function Jobs() {
  const { me, patch } = useApp(); const nav = useNavigate(); const [sp, setSp] = useSearchParams()
  const q = sp.get('q') ?? '', loc = sp.get('loc') ?? '', onlySaved = sp.get('saved') === '1'
  const [type, setType] = useState(''); const [remote, setRemote] = useState(false); const [days, setDays] = useState(0); const [sel, setSel] = useState(null); const [draft, setDraft] = useState(q)
  const { jobs, loading, error, reload } = useJobs(me?.profile, q)
  const rows = useMemo(() => jobs.filter((j) => (!type || j.type === type) && (!remote || j.remote) && (!loc || (j.location + ' ' + (j.remote ? 'remote' : '')).toLowerCase().includes(loc.toLowerCase())) && (!days || Date.now() - new Date(j.posted) < days * 864e5) && (!onlySaved || me?.saved.includes(j.id))), [jobs, type, remote, loc, days, onlySaved, me])
  const cur = sel && rows.find((j) => j.id === sel) || rows[0]
  const open = (j) => (innerWidth < 1000 ? nav('/jobs/' + encodeURIComponent(j.id)) : setSel(j.id))
  const toggle = (j) => (me ? patch((u) => ({ ...u, saved: u.saved.includes(j.id) ? u.saved.filter((x) => x !== j.id) : [...u.saved, j.id] })) : nav('/login'))
  const set = (k, v) => { const n = new URLSearchParams(sp); v ? n.set(k, v) : n.delete(k); setSp(n) }
  return (
    <div className="col">
      <div className="card filters">
        <form className="row grow" onSubmit={(e) => { e.preventDefault(); set('q', draft.trim()) }}><div className="hs light"><Icon n="search" size={16} /><input aria-label="Keyword" placeholder="Job title, skill or field" value={draft} onChange={(e) => setDraft(e.target.value)} /></div>
          <div className="hs light"><Icon n="pin" size={16} /><input aria-label="Location" placeholder="Location" value={loc} onChange={(e) => set('loc', e.target.value)} /></div><button className="btn">Search</button></form>
        <div className="row wrap"><select aria-label="Job type" value={type} onChange={(e) => setType(e.target.value)}><option value="">All job types</option>{JOB_TYPES.map((t) => <option key={t}>{t}</option>)}</select>
          <select aria-label="Date posted" value={days} onChange={(e) => setDays(+e.target.value)}><option value={0}>Any time</option><option value={1}>Past 24 hours</option><option value={7}>Past week</option><option value={30}>Past month</option></select>
          <label className="chk"><input type="checkbox" checked={remote} onChange={(e) => setRemote(e.target.checked)} /> Remote only</label>
          {me && <label className="chk"><input type="checkbox" checked={onlySaved} onChange={(e) => set('saved', e.target.checked ? '1' : '')} /> Saved</label>}
          <button className="btn ghost sm" onClick={reload}>Refresh</button></div>
      </div>
      <div className="mut sm">{loading ? 'Loading live jobs…' : `${rows.length} jobs${q ? ` for “${q}”` : me?.profile.focus ? ` matched to ${me.profile.focus}` : ''}`}</div>
      <div className="jobsplit">
        <div className="col">{loading && !rows.length && <Skeleton n={5} />}
          {error && <div className="card row between"><span className="mut">{error}</span><button className="btn sm" onClick={reload}>Retry</button></div>}
          {!loading && !rows.length && !error && <div className="card mut">No jobs match these filters. Try a broader keyword or clear filters.</div>}
          {rows.slice(0, 40).map((j) => <JobCard key={j.id} job={j} profile={me?.profile} active={cur?.id === j.id} saved={me?.saved.includes(j.id)} onSave={toggle} onOpen={open} />)}</div>
        <div className="pane">{cur && <JobDetail key={cur.id} job={cur} full />}</div>
      </div>
    </div>
  )
}
export function JobPage() {
  const { id } = useParams(); const { me } = useApp()
  const job = getJob(decodeURIComponent(id), me?.profile)
  if (!job) return <div className="card col"><b>This job is no longer in your cache.</b><span className="mut">Search again to find it.</span><Link to="/jobs" className="btn sm" style={{ alignSelf: 'flex-start' }}>Back to jobs</Link></div>
  return <div className="col" style={{ maxWidth: 820, margin: '0 auto' }}><Link to="/jobs" className="link">‹ Back to jobs</Link><JobDetail job={job} full /></div>
}
