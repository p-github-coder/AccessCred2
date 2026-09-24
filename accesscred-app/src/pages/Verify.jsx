import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon, Tag } from '../components/ui'
import { useApp } from '../context/AppContext'
import { TASKS } from '../data/content'

export default function Verify() {
  const { me, patch } = useApp()
  const [tid, setTid] = useState(null); const [step, setStep] = useState(1); const [imgs, setImgs] = useState([]); const [err, setErr] = useState('')
  const t = TASKS.find((x) => x.id === tid)
  const pick = (id) => { setTid(id); setStep(1); setImgs([]); setErr('') }
  const files = (e) => { const fs = [...e.target.files].filter((f) => f.type.startsWith('image/')).slice(0, 6); setErr(fs.length < 3 ? 'Choose 3 to 6 image files.' : ''); setImgs(fs.map((f) => URL.createObjectURL(f))) }
  const submit = () => {
    setStep(3)
    setTimeout(() => { patch((u) => ({ ...u, badges: [...u.badges.filter((b) => b.id !== t.id), { id: t.id, skill: t.skill, title: t.title, date: Date.now() }], profile: u.profile.skills.includes(t.skill) ? u.profile : { ...u.profile, skills: [...u.profile.skills, t.skill] } })); setStep(4) }, 2500)
  }
  return (
    <div className="col" style={{ maxWidth: 860, margin: '0 auto' }}>
      <div><h1>Skill verification</h1><p className="mut">Prove your skill with real work. Verified badges appear on your profile and improve your job matches.</p></div>
      {!t && <div className="g2">{TASKS.map((x) => { const done = me.badges.some((b) => b.id === x.id); return <div key={x.id} className="card col"><div className="row"><span className="ico"><Icon n={x.icon} size={20} /></span><div className="grow"><b>{x.title}</b><div className="mut sm">{x.skill}</div></div>{done && <Tag tone="ok">Verified</Tag>}</div><p className="mut sm">{x.desc}</p><button className="btn outline sm" onClick={() => pick(x.id)}>{done ? 'Retake' : 'Start task'}</button></div> })}</div>}
      {t && <div className="card col">
        <div className="steps">{['Task', 'Upload', 'Review', 'Badge'].map((s, i) => <div key={s} className={step > i ? 'on' : ''}><b>{step > i + 1 ? <Icon n="check" size={14} /> : i + 1}</b>{s}</div>)}</div>
        {step === 1 && <><h3>{t.title}</h3><p className="mut">{t.desc}</p><div className="note"><b>What to submit</b><p className="sm">{t.submit}</p></div><div className="row"><button className="btn outline" onClick={() => setTid(null)}>Back</button><button className="btn" onClick={() => setStep(2)}>Start</button></div></>}
        {step === 2 && <><label className="drop"><Icon n="upload" size={26} /><br />Choose 3 to 6 photos<input type="file" accept="image/*" multiple hidden onChange={files} /></label>{err && <div className="ferr">{err}</div>}<div className="thumbs">{imgs.map((u) => <img key={u} src={u} alt="" />)}</div>
          <div className="row between"><button className="btn outline" onClick={() => setStep(1)}>Back</button><button className="btn" disabled={imgs.length < 3} onClick={submit}>Submit for review</button></div></>}
        {step === 3 && <div className="col center"><Icon n="clock" size={28} /><h3>Reviewing your work…</h3><p className="mut">A quick automated check runs, then a reviewer approves. This demo approves after a few seconds.</p></div>}
        {step === 4 && <div className="col center"><Icon n="award" size={32} /><h3>Verified: {t.skill}</h3><p className="mut">Your badge is now on your profile and counts toward your job matches.</p><div className="row"><button className="btn outline" onClick={() => setTid(null)}>More tasks</button><Link to="/jobs" className="btn">See matching jobs</Link></div></div>}
      </div>}
    </div>
  )
}
