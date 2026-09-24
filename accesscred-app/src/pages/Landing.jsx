import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Icon, JobCard, Logo, Skeleton } from '../components/ui'
import { useApp } from '../context/AppContext'
import { useJobs } from '../services/jobs'

const CATS = ['Marketing', 'Software Development', 'UX Design', 'Sales', 'Fashion Design', 'Tailoring', 'Carpentry', 'Makeup & Beauty']
export default function Landing() {
  const { me } = useApp(); const nav = useNavigate()
  const [q, setQ] = useState(''); const [loc, setLoc] = useState('')
  const { jobs, loading } = useJobs(null, '')
  const go = (e) => { e?.preventDefault(); nav(`/jobs?q=${encodeURIComponent(q)}&loc=${encodeURIComponent(loc)}`) }
  return (
    <div>
      <header className="nav dark"><div className="wrap-nav"><Logo light /><span className="grow" />
        <Link to="/jobs" className="navtext">Browse jobs</Link>
        {me ? <Link to="/home" className="btn sm">Go to dashboard</Link> : <><Link to="/login" className="navtext">Log in</Link><Link to="/signup" className="btn accent sm">Join now</Link></>}</div></header>
      <section className="hero"><div className="container">
        <span className="eyebrow">Jobs and internships across Africa and remote</span>
        <h1>Find work that fits<br />what you can do.</h1>
        <p>Whether you have a degree or a trade, AccessCred matches you to real jobs and internships based on your field and verified skills.</p>
        <form className="herosearch" onSubmit={go}>
          <div className="hs"><Icon n="search" /><input aria-label="Job title or keyword" placeholder="Job title, skill or field" value={q} onChange={(e) => setQ(e.target.value)} /></div>
          <div className="hs"><Icon n="pin" /><input aria-label="Location" placeholder="City, country or remote" value={loc} onChange={(e) => setLoc(e.target.value)} /></div>
          <button className="btn accent">Search jobs</button></form>
        <div className="row wrap" style={{ marginTop: 16 }}><span className="mut-l sm">Popular:</span>{CATS.map((c) => <Link key={c} className="chipl" to={'/jobs?q=' + encodeURIComponent(c)}>{c}</Link>)}</div>
      </div></section>
      <section className="container stats"><div><b>4</b><span>live job sources</span></div><div><b>20+</b><span>industries and trades</span></div><div><b>2</b><span>tracks: professional and skilled trades</span></div><div><b>1</b><span>profile for every application</span></div></section>
      <section className="container sec"><div className="row between"><h2>Latest openings</h2><Link to="/jobs" className="link">See all jobs →</Link></div>
        <div className="g2" style={{ marginTop: 16 }}>{loading && !jobs.length ? <Skeleton n={4} /> : jobs.slice(0, 6).map((j) => <JobCard key={j.id} job={j} onOpen={() => nav('/jobs/' + encodeURIComponent(j.id))} />)}</div></section>
      <section className="container sec"><h2>How AccessCred works</h2><div className="g3" style={{ marginTop: 16 }}>
        {[['user', 'Build your profile', 'Tell us your field or trade. Add skills, experience and optional proof of work.'], ['briefcase', 'Get matched to real jobs', 'Listings are pulled from live sources and ranked against your profile.'], ['shield', 'Apply and track', 'Apply in a few clicks, track every stage and message employers.']].map(([i, t, d], k) => <div className="card" key={t}><span className="ico"><Icon n={i} size={20} /></span><h3 style={{ margin: '12px 0 6px' }}>{k + 1}. {t}</h3><p className="mut">{d}</p></div>)}</div></section>
      <section className="container sec"><div className="g2">
        <div className="card split"><span className="eyebrow dk">Professionals</span><h3>Degrees, internships and remote roles</h3><p className="mut">Marketing, software, design, finance and more. Ranked to your field with match scores.</p><Link to="/signup" className="btn sm">Create professional profile</Link></div>
        <div className="card split"><span className="eyebrow dk">Skilled trades</span><h3>Fashion, tailoring, carpentry and more</h3><p className="mut">Prove your skill with a verified badge, apply to trade employers and apprenticeships near you.</p><Link to="/signup" className="btn outline sm">Create trades profile</Link></div></div></section>
      <footer className="footer"><div className="container row between wrap"><Logo light /><span className="mut-l sm">Prove what you can do. Job data from The Muse, Remotive, Jobicy and Arbeitnow.</span></div></footer>
    </div>
  )
}
