import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Field, Icon, Modal, Org, Tag } from './ui'
import { useApp } from '../context/AppContext'
import { useForm } from '../hooks/useForm'
import { rules, optional } from '../utils/validate'
import { ago, matchInfo } from '../services/jobs'

function ApplyModal({ job, onClose }) {
  const { me, patch } = useApp()
  const [done, setDone] = useState(false)
  const f = useForm({ name: me.name, email: me.email, phone: me.phone || '', availability: 'Immediately', pay: '', note: '' }, {
    name: [rules.required(), rules.fullName()], email: [rules.required(), rules.email()], phone: [rules.required(), rules.phone()],
    pay: [optional(rules.number())], note: [rules.required('Add a short cover note'), rules.min(20, 'Write at least 20 characters'), rules.max(600, 'Keep it under 600 characters')],
  })
  const send = (v) => {
    const now = Date.now()
    patch((u) => ({ ...u, apps: [{ jid: job.id, job, title: job.title, org: job.org, logo: job.logo, location: job.location, type: job.type, url: job.url, gen: !!job.generated, status: 'Submitted', date: now, note: v.note, events: [{ s: 'Submitted', t: now }] }, ...u.apps.filter((a) => a.jid !== job.id)] }))
    setDone(true)
    if (job.url) window.open(job.url, '_blank', 'noopener')
  }
  if (done) return (
    <Modal title="Application submitted" onClose={onClose}><div className="col"><p className="mut">Your application for <b>{job.title}</b> at {job.org} is saved and tracked.{job.url && ' We also opened the employer page so you can finish there.'}</p><div className="row"><Link to="/applications" className="btn" onClick={onClose}>View applications</Link><button className="btn outline" onClick={onClose}>Keep browsing</button></div></div></Modal>
  )
  return (
    <Modal title={`Apply to ${job.org}`} onClose={onClose}>
      <form className="col" onSubmit={f.submit(send)} noValidate>
        <div className="row"><Org o={job} /><div><b>{job.title}</b><div className="mut sm">{job.location}</div></div></div>
        <Field label="Full name" {...f.bind('name')} />
        <div className="g2"><Field label="Email" type="email" {...f.bind('email')} /><Field label="Phone" placeholder="+234 801 234 5678" {...f.bind('phone')} /></div>
        <div className="g2"><Field label="Availability" as="select" {...f.bind('availability')}>{['Immediately', 'Within 2 weeks', 'Within a month'].map((x) => <option key={x}>{x}</option>)}</Field><Field label="Expected pay (optional)" inputMode="numeric" placeholder="e.g. 150000" {...f.bind('pay')} /></div>
        <Field label="Cover note" as="textarea" rows="4" placeholder="Why are you a good fit? Mention your experience and any verified badges." hint={`${f.values.note.length}/600`} {...f.bind('note')} />
        <div className="row" style={{ justifyContent: 'flex-end' }}><button type="button" className="btn outline" onClick={onClose}>Cancel</button><button className="btn">Submit application</button></div>
      </form>
    </Modal>
  )
}

export default function JobDetail({ job, full }) {
  const { me, patch } = useApp()
  const nav = useNavigate()
  const [apply, setApply] = useState(false)
  const saved = me?.saved.includes(job.id); const applied = me?.apps.some((a) => a.jid === job.id)
  const m = matchInfo(job, me?.profile)
  const need = (fn) => () => (me ? fn() : nav('/login'))
  const toggle = need(() => patch((u) => ({ ...u, saved: u.saved.includes(job.id) ? u.saved.filter((x) => x !== job.id) : [...u.saved, job.id] })))
  const badges = me?.badges || []
  return (
    <div className={full ? 'card col detail' : 'col detail'}>
      <div className="row" style={{ alignItems: 'flex-start' }}><Org o={job} size={56} />
        <div className="grow"><h2>{job.title}</h2><div className="mut">{job.org} • {job.location}</div><div className="mut sm">Posted {ago(job.posted)} via {job.source}</div></div></div>
      <div className="row wrap"><Tag>{job.type}</Tag>{job.remote && <Tag>Remote</Tag>}{job.level && <Tag>{job.level}</Tag>}{job.verified && <Tag tone="ok">Verified employer</Tag>}{job.tags.slice(0, 4).map((t) => <Tag key={t}>{t}</Tag>)}</div>
      {job.salary && <div className="row"><Icon n="dollar" size={16} /><b>{job.salary}</b></div>}
      <div className="row wrap">
        <button className="btn" onClick={need(() => setApply(true))}>{applied ? 'Applied ✓ Update application' : 'Apply now'}</button>
        <button className="btn outline" onClick={toggle}>{saved ? 'Saved' : 'Save'}</button>
        {job.url && <a className="btn ghost" href={job.url} target="_blank" rel="noreferrer">View original <Icon n="ext" size={14} /></a>}
      </div>
      {m && <div className="note"><b>Why this fits you • {m.pct}% match</b><div className="mut sm">{m.hits.length ? 'Matches: ' + m.hits.join(', ') : 'Add more skills to improve your match.'}{badges.length ? ` • ${badges.length} verified badge${badges.length > 1 ? 's' : ''} on profile` : ''}</div></div>}
      <div><h3>About the job</h3><p className="mut" style={{ whiteSpace: 'pre-line', marginTop: 8 }}>{job.desc || 'See the original listing for full details.'}</p></div>
      {apply && <ApplyModal job={job} onClose={() => setApply(false)} />}
    </div>
  )
}
