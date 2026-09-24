import { createContext, useContext, useEffect, useState } from 'react'

// localStorage "database". Each user lives at db.users[email].
// BACKEND: replace register/login/logout/remove/patch with API calls; keep the shapes below.
const KEY = 'accesscred_db_v2'
const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) || { users: {}, session: null } } catch { return { users: {}, session: null } } }
const blank = (u) => ({
  ...u,
  profile: { track: 'Formal', focus: '', country: 'Nigeria', location: '', headline: '', about: '', level: '', institution: '', cgpa: '', skills: [], jobTypes: [], experience: [], education: [], docs: [], onboarded: false },
  saved: [], apps: [], badges: [],
  threads: [{ id: 'support', name: 'AccessCred Support', msgs: [{ from: 'them', t: Date.now(), text: 'Welcome to AccessCred! Message us anytime about your profile or applications.' }] }],
  settings: { whatsapp: true, email: true, digest: true, offline: true, publicProfile: true, theme: 'light' },
})
const Ctx = createContext(null)
export const useApp = () => useContext(Ctx)

export function AppProvider({ children }) {
  const [db, setDb] = useState(read)
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(db)) } catch {} }, [db])
  const me = db.session ? db.users[db.session] : null
  useEffect(() => { document.documentElement.dataset.theme = me?.settings.theme || 'light' }, [me?.settings.theme])
  const api = {
    me,
    register({ name, email, phone, password, track }) {
      const id = email.trim().toLowerCase()
      if (db.users[id]) throw new Error('An account with this email already exists.')
      const u = blank({ id, name: name.trim(), email: id, phone, password: btoa(password) }); u.profile.track = track
      setDb({ users: { ...db.users, [id]: u }, session: id })
    },
    login(idf, password) {
      const k = idf.trim().toLowerCase()
      const u = Object.values(db.users).find((x) => x.email === k || x.phone === idf.trim())
      if (!u || u.password !== btoa(password)) throw new Error('Incorrect email/phone or password.')
      setDb({ ...db, session: u.id })
    },
    logout: () => setDb({ ...db, session: null }),
    remove() { const users = { ...db.users }; delete users[db.session]; setDb({ users, session: null }) },
    patch: (fn) => setDb((d) => (d.session ? { ...d, users: { ...d.users, [d.session]: fn(d.users[d.session]) } } : d)),
  }
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>
}

export function completion(me) {
  const p = me.profile
  const c = [p.focus, p.headline, p.about, p.skills.length >= 3, p.location, p.experience.length || p.education.length, me.badges.length || p.docs.length]
  return Math.round((c.filter(Boolean).length / c.length) * 100)
}
export const initials = (n = '') => n.split(' ').map((x) => x[0]).slice(0, 2).join('').toUpperCase()
