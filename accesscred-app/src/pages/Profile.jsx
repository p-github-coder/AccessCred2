import { useState } from 'react'
import { Avatar, Field, Icon, Modal, Tag } from '../components/ui'
import { useApp } from '../context/AppContext'
import { useForm } from '../hooks/useForm'
import { rules } from '../utils/validate'

function Intro({ close }) {
  const { me, patch } = useApp(); const p = me.profile
  const f = useForm({ name: me.name, headline: p.headline, focus: p.focus, location: p.location, about: p.about }, { name: [rules.required(), rules.fullName()], headline: [rules.required(), rules.max(90)], focus: [rules.required()], location: [rules.required()], about: [rules.max(1000)] })
  return <Modal title="Edit intro" onClose={close}><form className="col" noValidate onSubmit={f.submit((v) => { patch((u) => ({ ...u, name: v.name, profile: { ...u.profile, headline: v.headline, focus: v.focus, location: v.location, about: v.about } })); close() })}>
    <Field label="Full name" {...f.bind('name')} /><Field label="Headline" {...f.bind('headline')} /><Field label="Field or trade" {...f.bind('focus')} /><Field label="City" {...f.bind('location')} /><Field label="About" as="textarea" rows="5" {...f.bind('about')} />
    <div className="row" style={{ justifyContent: 'flex-end' }}><button type="button" className="btn outline" onClick={close}>Cancel</button><button className="btn">Save</button></div></form></Modal>
}
function Item({ kind, close }) {
  const { patch } = useApp(); const exp = kind === 'experience'
  const f = useForm({ a: '', b: '', from: '', to: '', desc: '' }, { a: [rules.required()], b: [rules.required()], from: [rules.required('Enter a year'), rules.range(1970, 2100)], to: [(v, all) => (v && (isNaN(v) || +v < +all.from) ? 'End year must be after start' : '')] })
  return <Modal title={exp ? 'Add experience' : 'Add education'} onClose={close}><form className="col" noValidate onSubmit={f.submit((v) => { patch((u) => ({ ...u, profile: { ...u.profile, [kind]: [...u.profile[kind], v] } })); close() })}>
    <Field label={exp ? 'Job title' : 'Degree or certificate'} {...f.bind('a')} /><Field label={exp ? 'Company' : 'School'} {...f.bind('b')} />
    <div className="g2"><Field label="Start year" inputMode="numeric" {...f.bind('from')} /><Field label="End year (blank if current)" inputMode="numeric" {...f.bind('to')} /></div>
    {exp && <Field label="Description" as="textarea" rows="3" {...f.bind('desc')} />}
    <div className="row" style={{ justifyContent: 'flex-end' }}><button type="button" className="btn outline" onClick={close}>Cancel</button><button className="btn">Add</button></div></form></Modal>
}
export default function Profile() {
  const { me, patch } = useApp(); const p = me.profile
  const [modal, setModal] = useState(''); const [sk, setSk] = useState(''); const [err, setErr] = useState('')
  const addSkill = () => { const s = sk.trim(); if (s.length < 2) return setErr('Enter a skill'); if (p.skills.some((x) => x.toLowerCase() === s.toLowerCase())) return setErr('Already added'); patch((u) => ({ ...u, profile: { ...u.profile, skills: [...u.profile.skills, s] } })); setSk(''); setErr('') }
  const rm = (k, i) => patch((u) => ({ ...u, profile: { ...u.profile, [k]: u.profile[k].filter((_, x) => x !== i) } }))
  const Sec = ({ t, k, children }) => <div className="card col"><div className="row between"><h3>{t}</h3>{k && <button className="iconbtn" onClick={() => setModal(k)} aria-label={'Add ' + t}><Icon n="plus" /></button>}</div>{children}</div>
  return (
    <div className="col" style={{ maxWidth: 860, margin: '0 auto' }}>
      <div className="card"><div className="cover big" /><div className="row between" style={{ marginTop: -40, alignItems: 'flex-end' }}><Avatar name={me.name} size={84} /><button className="btn outline sm" onClick={() => setModal('intro')}><Icon n="edit" size={14} /> Edit</button></div>
        <h1 style={{ marginTop: 10 }}>{me.name}</h1><p>{p.headline}</p><p className="mut sm">{p.location}, {p.country} • {p.focus} • {p.track === 'Informal' ? 'Skilled trades' : 'Professional'}</p></div>
      <Sec t="About"><p className="mut" style={{ whiteSpace: 'pre-line' }}>{p.about || 'Add a short summary so employers know who you are.'}</p></Sec>
      <Sec t="Experience" k="experience">{p.experience.map((x, i) => <div className="li" key={i}><span className="ico"><Icon n="briefcase" /></span><div className="grow"><b>{x.a}</b><div className="mut sm">{x.b} • {x.from} – {x.to || 'Present'}</div>{x.desc && <p className="sm">{x.desc}</p>}</div><button className="linkbtn" onClick={() => rm('experience', i)}>Remove</button></div>)}{!p.experience.length && <span className="mut">No experience added.</span>}</Sec>
      <Sec t="Education" k="education">{p.education.map((x, i) => <div className="li" key={i}><span className="ico"><Icon n="cap" /></span><div className="grow"><b>{x.b}</b><div className="mut sm">{x.a} • {x.from} – {x.to || 'Present'}</div></div><button className="linkbtn" onClick={() => rm('education', i)}>Remove</button></div>)}{!p.education.length && <span className="mut">No education added.</span>}</Sec>
      <Sec t="Skills"><div className="row"><div className="grow"><Field name="skill" placeholder="Add a skill" value={sk} error={err} onChange={(e) => setSk(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addSkill()} /></div><button className="btn" onClick={addSkill}>Add</button></div>
        <div className="row wrap">{me.badges.map((b) => <Tag key={b.id} tone="ok">✓ Verified: {b.skill}</Tag>)}{p.skills.map((s, i) => <button key={s} className="chip" onClick={() => rm('skills', i)}>{s} ×</button>)}</div></Sec>
      {modal === 'intro' && <Intro close={() => setModal('')} />}{(modal === 'experience' || modal === 'education') && <Item kind={modal} close={() => setModal('')} />}
    </div>
  )
}
