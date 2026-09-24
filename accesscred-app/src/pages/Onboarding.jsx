import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Field, Icon, Logo } from '../components/ui'
import { useApp } from '../context/AppContext'
import { useForm } from '../hooks/useForm'
import { rules, optional } from '../utils/validate'
import { COUNTRIES, FOCUS_SUGGESTIONS, JOB_TYPES, SKILL_HINTS } from '../data/content'
import { seedInformal } from '../services/informal'

export default function Onboarding() {
  const { me, patch } = useApp(); const nav = useNavigate()
  const [step, setStep] = useState(1); const [skills, setSkills] = useState(me?.profile.skills || []); const [types, setTypes] = useState(me?.profile.jobTypes || []); const [sk, setSk] = useState(''); const [skErr, setSkErr] = useState('')
  const p = me?.profile || {}
  const f = useForm({ focus: p.focus || '', country: p.country || 'Nigeria', location: p.location || '', headline: p.headline || '', cgpa: p.cgpa || '' },
    { focus: [rules.required('Tell us your field or trade'), rules.min(3)], location: [rules.required('Enter your city')], headline: [rules.required('Add a short headline'), rules.max(90)], cgpa: [optional(rules.range(0, 5))] })
  if (!me) return <Navigate to="/login" replace />
  if (p.onboarded) return <Navigate to="/home" replace />
  const trade = p.track === 'Informal'
  const add = (s) => { s = s.trim(); if (!s) return; if (skills.some((x) => x.toLowerCase() === s.toLowerCase())) return setSkErr('Already added'); setSkills([...skills, s]); setSk(''); setSkErr('') }
  const finish = () => {
    if (skills.length < 3) return setSkErr('Add at least 3 skills')
    const prof = { ...p, ...f.values, skills, jobTypes: types, onboarded: true }
    const seed = trade ? seedInformal(prof) : { apps: [], threads: [] }
    patch((u) => ({ ...u, profile: prof, apps: [...seed.apps, ...u.apps], threads: [...seed.threads, ...u.threads] }))
    nav('/home')
  }
  return (
    <div className="onb"><Logo />
      <div className="steps">{['Your focus', 'Skills', 'Preferences'].map((s, i) => <div key={s} className={step > i ? 'on' : ''}><b>{step > i + 1 ? <Icon n="check" size={14} /> : i + 1}</b>{s}</div>)}</div>
      {step === 1 && <form className="card col" onSubmit={f.submit(() => setStep(2))} noValidate>
        <div><h2>{trade ? 'What is your trade?' : 'What field are you looking for work in?'}</h2><p className="mut">We use this to pick the jobs and internships you see. Example: {trade ? 'Fashion Design' : 'Marketing'}.</p></div>
        <Field label={trade ? 'Trade' : 'Field or role'} placeholder={trade ? 'Fashion Design' : 'Marketing'} list="focus" {...f.bind('focus')} /><datalist id="focus">{FOCUS_SUGGESTIONS[trade ? 'Informal' : 'Formal'].map((x) => <option key={x} value={x} />)}</datalist>
        <div className="row wrap">{FOCUS_SUGGESTIONS[trade ? 'Informal' : 'Formal'].map((x) => <button type="button" key={x} className={'chip' + (f.values.focus === x ? ' on' : '')} onClick={() => f.setValues({ ...f.values, focus: x })}>{x}</button>)}</div>
        <Field label="Professional headline" placeholder={trade ? 'Fashion designer with 4 years of bridal experience' : 'Marketing student focused on social media and SEO'} {...f.bind('headline')} />
        <div className="g2"><Field label="Country" as="select" {...f.bind('country')}>{COUNTRIES.map((c) => <option key={c}>{c}</option>)}</Field><Field label="City" placeholder="Lagos" {...f.bind('location')} /></div>
        {!trade && <Field label="CGPA (optional)" placeholder="4.2" inputMode="decimal" hint="Out of 5.0" {...f.bind('cgpa')} />}
        <button className="btn" style={{ alignSelf: 'flex-end' }}>Continue</button></form>}
      {step === 2 && <div className="card col"><div><h2>Add your skills</h2><p className="mut">Add at least 3. They are used to calculate your match scores.</p></div>
        <div className="row"><div className="grow"><Field name="sk" placeholder="Type a skill and press Enter" value={sk} error={skErr} onChange={(e) => setSk(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add(sk))} /></div><button className="btn" onClick={() => add(sk)}>Add</button></div>
        <div className="row wrap">{skills.map((s) => <button key={s} className="chip on" onClick={() => setSkills(skills.filter((x) => x !== s))}>{s} ×</button>)}</div>
        <div className="row wrap"><span className="mut sm">Suggested:</span>{SKILL_HINTS[trade ? 'Informal' : 'Formal'].filter((s) => !skills.includes(s)).map((s) => <button key={s} className="chip" onClick={() => add(s)}>+ {s}</button>)}</div>
        <div className="row between"><button className="btn outline" onClick={() => setStep(1)}>Back</button><button className="btn" onClick={() => (skills.length < 3 ? setSkErr('Add at least 3 skills') : setStep(3))}>Continue</button></div></div>}
      {step === 3 && <div className="card col"><div><h2>Job preferences</h2><p className="mut">Choose the kinds of roles you want. You can change this later.</p></div>
        <div className="row wrap">{JOB_TYPES.map((t) => <button key={t} className={'chip' + (types.includes(t) ? ' on' : '')} onClick={() => setTypes(types.includes(t) ? types.filter((x) => x !== t) : [...types, t])}>{t}</button>)}</div>
        <div className="row between"><button className="btn outline" onClick={() => setStep(2)}>Back</button><button className="btn accent" onClick={finish}>Finish and see jobs</button></div></div>}
    </div>
  )
}
