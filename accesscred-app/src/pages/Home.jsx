import { Link, useNavigate } from 'react-router-dom'
import { Avatar, Icon, JobCard, Skeleton, Tag } from '../components/ui'
import { completion, useApp } from '../context/AppContext'
import { useJobs } from '../services/jobs'

const STAGES = ['Submitted', 'Under review', 'Interview', 'Offer']
export default function Home() {
  const { me, patch } = useApp(); const nav = useNavigate(); const p = me.profile
  const { jobs, loading, error, reload } = useJobs(p)
  const pct = completion(me)
  const toggle = (j) => patch((u) => ({ ...u, saved: u.saved.includes(j.id) ? u.saved.filter((x) => x !== j.id) : [...u.saved, j.id] }))
  const todo = [[p.about, 'Write your About section'], [p.skills.length >= 5, 'Add 5 or more skills'], [p.experience.length, 'Add work experience'], [me.badges.length, 'Earn a verified skill badge']].filter(([d]) => !d)
  return (
    <div className="grid3">
      <aside className="col">
        <div className="card center"><div className="cover" /><div style={{ marginTop: -28 }}><Avatar name={me.name} size={56} /></div><h3>{me.name}</h3><p className="mut sm">{p.headline}</p><p className="mut sm">{p.location}, {p.country}</p>
          <div className="bar"><u style={{ width: pct + '%' }} /></div><span className="sm mut">Profile strength {pct}%</span><Link to="/profile" className="btn outline sm block">View profile</Link></div>
        <div className="card col" style={{ gap: 8 }}><Link to="/jobs?saved=1" className="row between"><span>Saved jobs</span><b>{me.saved.length}</b></Link><Link to="/applications" className="row between"><span>Applications</span><b>{me.apps.length}</b></Link><Link to="/verify" className="row between"><span>Verified badges</span><b>{me.badges.length}</b></Link></div>
      </aside>
      <section className="col">
        <div className="card"><h3>Recommended for {p.focus || 'you'}</h3><p className="mut sm">Based on your field, skills and location. Sources: The Muse, Remotive, Jobicy, Arbeitnow{p.track === 'Informal' || jobs.some((j) => j.generated) ? ' and AccessCred partner employers' : ''}.</p></div>
        {loading && !jobs.length && <Skeleton n={4} />}
        {error && <div className="card row between"><span className="mut">{error}</span><button className="btn sm" onClick={reload}>Retry</button></div>}
        {jobs.slice(0, 12).map((j) => <JobCard key={j.id} job={j} profile={p} saved={me.saved.includes(j.id)} onSave={toggle} onOpen={() => nav('/jobs/' + encodeURIComponent(j.id))} />)}
        <Link to={'/jobs?q=' + encodeURIComponent(p.focus)} className="btn outline block">See all matching jobs</Link>
      </section>
      <aside className="col">
        <div className="card col"><h3>Your applications</h3>{STAGES.map((s) => <Link to="/applications" key={s} className="row between"><span>{s}</span><Tag tone={me.apps.filter((a) => a.status === s).length ? 'brand' : ''}>{me.apps.filter((a) => a.status === s).length}</Tag></Link>)}</div>
        {todo.length > 0 && <div className="card col"><h3>Strengthen your profile</h3>{todo.slice(0, 3).map(([, t]) => <Link key={t} to={t.includes('badge') ? '/verify' : '/profile'} className="row"><Icon n="plus" size={14} /><span className="sm">{t}</span></Link>)}</div>}
      </aside>
    </div>
  )
}
