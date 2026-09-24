import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Field, Icon, Logo } from '../components/ui'
import { useApp } from '../context/AppContext'
import { useForm } from '../hooks/useForm'
import { rules } from '../utils/validate'

export default function Auth({ mode }) {
  const su = mode === 'signup'
  const { me, register, login } = useApp(); const nav = useNavigate()
  const [track, setTrack] = useState('Formal'); const [err, setErr] = useState('')
  const f = useForm({ name: '', email: '', phone: '', password: '', confirm: '' },
    su ? { name: [rules.required(), rules.fullName()], email: [rules.required(), rules.email()], phone: [rules.required(), rules.phone()], password: [rules.required(), rules.password()], confirm: [rules.required(), rules.same('password', 'Passwords do not match')] }
       : { email: [rules.required('Enter your email or phone')], password: [rules.required('Enter your password')] })
  if (me) return <Navigate to={me.profile.onboarded ? '/home' : '/onboarding'} replace />
  const submit = (v) => { try { setErr(''); if (su) { register({ ...v, track }); nav('/onboarding') } else { login(v.email, v.password); nav('/home') } } catch (x) { setErr(x.message) } }
  return (
    <div className="auth">
      <div className="authside"><Logo light /><div><h2>{su ? 'Your next role starts with a profile.' : 'Welcome back.'}</h2>
        {['Live jobs and internships from trusted sources', 'Matches ranked to your field or trade', 'One-click applications with a tracker'].map((t) => <div key={t} className="row" style={{ marginTop: 14 }}><span className="dotck"><Icon n="check" size={14} /></span><span>{t}</span></div>)}</div><span className="mut-l sm">© AccessCred</span></div>
      <form className="authform" onSubmit={f.submit(submit)} noValidate>
        <div><h2>{su ? 'Create your account' : 'Log in'}</h2><p className="mut">{su ? 'Free for job seekers.' : 'Enter your details to continue.'}</p></div>
        {su && <div><label className="lbl">I am a</label><div className="seg">{[['Formal', 'Professional / Student'], ['Informal', 'Skilled tradesperson']].map(([k, l]) => <button type="button" key={k} className={track === k ? 'on' : ''} onClick={() => setTrack(k)}>{l}</button>)}</div></div>}
        {su && <Field label="Full name" placeholder="Amina Yusuf" autoComplete="name" {...f.bind('name')} />}
        <Field label={su ? 'Email address' : 'Email or phone'} placeholder="you@example.com" autoComplete="username" {...f.bind('email')} />
        {su && <Field label="Phone number" placeholder="+234 801 234 5678" {...f.bind('phone')} />}
        <Field label="Password" type="password" placeholder={su ? 'At least 8 characters, letters and numbers' : 'Your password'} autoComplete={su ? 'new-password' : 'current-password'} {...f.bind('password')} />
        {su && <Field label="Confirm password" type="password" {...f.bind('confirm')} />}
        {err && <div className="err" role="alert">{err}</div>}
        <button className="btn block">{su ? 'Create account' : 'Log in'}</button>
        <p className="mut" style={{ textAlign: 'center' }}>{su ? 'Already a member?' : 'New to AccessCred?'} <Link className="link" to={su ? '/login' : '/signup'}>{su ? 'Log in' : 'Join now'}</Link></p>
      </form>
    </div>
  )
}
