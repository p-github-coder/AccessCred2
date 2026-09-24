import { useState } from 'react'
import { Avatar, Icon } from '../components/ui'
import { useApp } from '../context/AppContext'

export default function Messages() {
  const { me, patch } = useApp()
  const [q, setQ] = useState(''); const [sel, setSel] = useState(me.threads[0].id); const [txt, setTxt] = useState('')
  const th = me.threads.find((x) => x.id === sel) || me.threads[0]
  const tm = (t) => new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const add = (id, m) => patch((u) => ({ ...u, threads: u.threads.map((x) => (x.id === id ? { ...x, msgs: [...x.msgs, m] } : x)) }))
  const send = (e) => {
    e.preventDefault(); const t = txt.trim(); if (!t) return
    add(th.id, { from: 'me', text: t, t: Date.now() }); setTxt('')
    setTimeout(() => add(th.id, { from: 'them', t: Date.now(), text: th.id === 'support' ? 'Thanks for your message. Our team will reply here shortly.' : 'Thank you. We will confirm the details and get back to you today.' }), 1400)
  }
  return (
    <div className="msgs card">
      <div className="mlist"><div className="mhead"><h3>Messages</h3><input aria-label="Search conversations" placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        {me.threads.filter((x) => x.name.toLowerCase().includes(q.toLowerCase())).map((x) => <div key={x.id} className={'conv' + (x.id === th.id ? ' on' : '')} onClick={() => setSel(x.id)}><Avatar name={x.name} /><div className="grow"><b>{x.name}</b><div className="mut sm ell">{x.msgs[x.msgs.length - 1].text}</div></div></div>)}</div>
      <div className="mthread"><div className="mhead"><b>{th.name}</b></div>
        <div className="mbody">{th.msgs.map((m, i) => <div key={i} className={'bub' + (m.from === 'me' ? ' me' : '')}>{m.text}<div className="sm" style={{ opacity: .65 }}>{tm(m.t)}</div></div>)}</div>
        <form className="row mcomp" onSubmit={send}><input aria-label="Message" placeholder="Write a message" value={txt} onChange={(e) => setTxt(e.target.value)} /><button className="btn" aria-label="Send"><Icon n="send" /></button></form></div>
    </div>
  )
}
