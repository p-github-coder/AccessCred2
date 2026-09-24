import { useState } from 'react'
import { Field } from '../components/ui'
import { useApp } from '../context/AppContext'
import { useForm } from '../hooks/useForm'
import { rules } from '../utils/validate'
import { clearJobCache } from '../services/jobs'

export default function Settings() {
  const { me, patch, remove } = useApp(); const s = me.settings
  const [tab, setTab] = useState('Account'); const [msg, setMsg] = useState('')
  const a = useForm({ name: me.name, phone: me.phone || '' }, { name: [rules.required(), rules.fullName()], phone: [rules.required(), rules.phone()] })
  const pw = useForm({ cur: '', next: '', again: '' }, { cur: [rules.required('Enter your current password')], next: [rules.required(), rules.password()], again: [rules.required(), rules.same('next', 'Passwords do not match')] })
  const flip = (k) => patch((u) => ({ ...u, settings: { ...u.settings, [k]: !u.settings[k] } }))
  const Row = ({ k, l, d }) => <div className="li"><div className="grow"><b>{l}</b><div className="mut sm">{d}</div></div><button className={'tog' + (s[k] ? ' on' : '')} onClick={() => flip(k)} role="switch" aria-checked={!!s[k]} aria-label={l} /></div>
  return (
    <div className="col" style={{ maxWidth: 720, margin: '0 auto' }}>
      <h1>Settings</h1>
      <div className="tabs">{['Account', 'Notifications', 'Privacy', 'Appearance'].map((t) => <button key={t} className={tab === t ? 'on' : ''} onClick={() => { setTab(t); setMsg('') }}>{t}</button>)}</div>
      {tab === 'Account' && <><form className="card col" noValidate onSubmit={a.submit((v) => { patch((u) => ({ ...u, name: v.name, phone: v.phone })); setMsg('Account saved.') })}><h3>Account details</h3><Field label="Full name" {...a.bind('name')} /><Field label="Email" value={me.email} disabled readOnly /><Field label="Phone" {...a.bind('phone')} /><button className="btn" style={{ alignSelf: 'flex-start' }}>Save changes</button></form>
        <form className="card col" noValidate onSubmit={pw.submit((v) => { if (btoa(v.cur) !== me.password) return setMsg('Current password is incorrect.'); patch((u) => ({ ...u, password: btoa(v.next) })); pw.setValues({ cur: '', next: '', again: '' }); setMsg('Password updated.') })}><h3>Change password</h3><Field label="Current password" type="password" {...pw.bind('cur')} /><div className="g2"><Field label="New password" type="password" {...pw.bind('next')} /><Field label="Confirm new password" type="password" {...pw.bind('again')} /></div><button className="btn outline" style={{ alignSelf: 'flex-start' }}>Update password</button></form>
        <div className="card col"><h3>Danger zone</h3><button className="btn danger" style={{ alignSelf: 'flex-start' }} onClick={() => confirm('Delete your account and all saved data?') && remove()}>Delete account</button></div></>}
      {tab === 'Notifications' && <div className="card"><Row k="whatsapp" l="WhatsApp alerts" d="Get new matching jobs and status updates." /><Row k="email" l="Email notifications" d="Application updates and messages." /><Row k="digest" l="Weekly job digest" d="A summary of the best new matches." /></div>}
      {tab === 'Privacy' && <div className="card col"><Row k="publicProfile" l="Public profile" d="Let employers find your profile and verified badges." /><Row k="offline" l="Offline cache" d="Keep recent jobs available without a connection." /><button className="btn outline" style={{ alignSelf: 'flex-start' }} onClick={() => { clearJobCache(); setMsg('Job cache cleared.') }}>Clear cached jobs</button></div>}
      {tab === 'Appearance' && <div className="card col"><h3>Theme</h3><div className="seg">{['light', 'dark'].map((t) => <button key={t} className={s.theme === t ? 'on' : ''} onClick={() => patch((u) => ({ ...u, settings: { ...u.settings, theme: t } }))}>{t[0].toUpperCase() + t.slice(1)}</button>)}</div></div>}
      {msg && <div className="note" role="status">{msg}</div>}
    </div>
  )
}
