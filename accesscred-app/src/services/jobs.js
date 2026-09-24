import { useEffect, useMemo, useState } from 'react'
import { informalFor } from './informal'

// Live job sources (all free, no API key):
//   The Muse  https://www.themuse.com/developers/api/v2   jobs + internships across 20+ industries
//   Remotive  https://remotive.com/api                    remote jobs
//   Jobicy    https://jobicy.com/api/v2                   remote jobs
//   Arbeitnow https://www.arbeitnow.com/api               Europe/remote jobs
// Skilled-trade roles come from ./informal.js (replace with your backend).
// Jobs are ranked against the user's profile focus (e.g. "Marketing" or "Fashion Design").
const DEV = import.meta.env.DEV
const B = {
  rm: DEV ? '/proxy/remotive' : 'https://remotive.com/api',
  an: DEV ? '/proxy/arbeitnow' : 'https://www.arbeitnow.com/api',
  jb: DEV ? '/proxy/jobicy' : 'https://jobicy.com/api/v2',
  mu: DEV ? '/proxy/muse' : 'https://www.themuse.com/api/public',
}
const CATS = { marketing: 'Marketing', design: 'Design and UX', ux: 'Design and UX', software: 'Software Engineering', developer: 'Software Engineering', engineer: 'Software Engineering', data: 'Data and Analytics', sales: 'Sales', finance: 'Accounting and Finance', account: 'Accounting and Finance', educat: 'Education', teach: 'Education', health: 'Healthcare', 'human resources': 'Human Resources and Recruitment', hr: 'Human Resources and Recruitment', writ: 'Writing and Editing', content: 'Writing and Editing', project: 'Project Management', operations: 'Business Operations', legal: 'Legal Services' }
const SYN = { marketing: ['marketing', 'seo', 'social media', 'brand', 'content', 'growth', 'campaign'], design: ['design', 'ux', 'ui', 'graphic', 'creative'], software: ['software', 'developer', 'engineer', 'frontend', 'backend', 'react'], data: ['data', 'analyst', 'analytics', 'sql'], sales: ['sales', 'business development', 'account executive'], finance: ['finance', 'accounting', 'accountant', 'audit'], writ: ['writer', 'content', 'copy', 'editor'], fashion: ['fashion', 'garment', 'apparel', 'textile', 'stylist'] }
const CK = 'accesscred_jobs_v2', IK = 'accesscred_jobindex_v2', TTL = 3 * 3600e3
const memIndex = new Map()

const plain = (h = '') => new DOMParser().parseFromString(String(h).replace(/<\/(p|div|h\d|ul)>|<br\s*\/?>/gi, '\n').replace(/<li[^>]*>/gi, '• '), 'text/html').body.textContent.replace(/[ \t]+/g, ' ').replace(/\n\s*\n+/g, '\n\n').trim().slice(0, 1400)
const ttype = (s = '') => (/intern/i.test(s) ? 'Internship' : /part/i.test(s) ? 'Part-time' : /contract|freelance/i.test(s) ? 'Contract' : /apprentice/i.test(s) ? 'Apprenticeship' : 'Full-time')
async function getJson(url) {
  const c = new AbortController(); const id = setTimeout(() => c.abort(), 12000)
  try { const r = await fetch(url, { signal: c.signal }); if (!r.ok) throw new Error(r.status); return await r.json() } finally { clearTimeout(id) }
}
const isRemote = (l = '') => /remote|anywhere|worldwide/i.test(l)
const N = {
  rm: (d) => (d.jobs || []).map((j) => ({ id: 'rm-' + j.id, source: 'Remotive', title: j.title, org: j.company_name, logo: j.company_logo, location: j.candidate_required_location || 'Remote', remote: true, type: ttype(j.job_type + ' ' + j.title), level: '', category: j.category, tags: (j.tags || []).slice(0, 5), posted: j.publication_date, url: j.url, salary: j.salary || '', desc: plain(j.description) })),
  jb: (d) => (d.jobs || []).map((j) => ({ id: 'jb-' + j.id, source: 'Jobicy', title: j.jobTitle, org: j.companyName, logo: j.companyLogo, location: j.jobGeo || 'Remote', remote: true, type: ttype([].concat(j.jobType || []).join(' ') + ' ' + j.jobTitle), level: [].concat(j.jobLevel || []).join(', '), category: [].concat(j.jobIndustry || [])[0] || '', tags: [].concat(j.jobIndustry || []).slice(0, 4), posted: j.pubDate, url: j.url, salary: j.annualSalaryMin ? `${j.salaryCurrency || '$'} ${Number(j.annualSalaryMin).toLocaleString()} – ${Number(j.annualSalaryMax || j.annualSalaryMin).toLocaleString()} / year` : '', desc: plain(j.jobDescription || j.jobExcerpt) })),
  an: (d) => (d.data || []).map((j) => ({ id: 'an-' + j.slug, source: 'Arbeitnow', title: j.title, org: j.company_name, logo: '', location: j.location || (j.remote ? 'Remote' : ''), remote: !!j.remote, type: ttype((j.job_types || []).join(' ') + ' ' + j.title), level: '', category: '', tags: (j.tags || []).slice(0, 4), posted: new Date(j.created_at * 1000).toISOString(), url: j.url, salary: '', desc: plain(j.description) })),
  mu: (d) => (d.results || []).map((j) => { const lv = (j.levels || [])[0]?.name || ''; const loc = (j.locations || []).map((l) => l.name).join(' • ') || 'Flexible / Remote'; return { id: 'mu-' + j.id, source: 'The Muse', title: j.name, org: j.company?.name || '', logo: '', location: loc, remote: isRemote(loc), type: /intern/i.test(lv) ? 'Internship' : ttype(j.name), level: lv, category: (j.categories || [])[0]?.name || '', tags: (j.categories || []).map((c) => c.name).slice(0, 3), posted: j.publication_date, url: j.refs?.landing_page, salary: '', desc: plain(j.contents) } }),
}

export const termsOf = (p) => {
  const f = (p?.focus || '').toLowerCase().trim()
  if (!f) return []
  const out = new Set([f, ...f.split(/[\s,&/]+/).filter((w) => w.length > 2)])
  Object.entries(SYN).forEach(([k, v]) => f.includes(k) && v.forEach((x) => out.add(x)))
  return [...out]
}
export function relevance(j, terms) {
  const t = j.title.toLowerCase(), g = (j.tags.join(' ') + ' ' + j.category).toLowerCase(), d = j.desc.toLowerCase()
  return terms.reduce((s, x) => s + (t.includes(x) ? 5 : 0) + (g.includes(x) ? 3 : 0) + (d.includes(x) ? 1 : 0), 0)
}
export function matchInfo(j, p) {
  const terms = [...termsOf(p), ...(p?.skills || []).map((s) => s.toLowerCase())]
  const hay = (j.title + ' ' + j.tags.join(' ') + ' ' + j.category + ' ' + j.desc).toLowerCase()
  const hits = [...new Set(terms.filter((x) => hay.includes(x)))]
  if (!terms.length) return null
  return { pct: Math.min(97, 42 + hits.length * 11), hits: hits.slice(0, 5) }
}
export const ago = (iso) => { const d = Math.max(0, Math.floor((Date.now() - new Date(iso)) / 864e5)); return d === 0 ? 'Today' : d === 1 ? '1 day ago' : d < 7 ? `${d} days ago` : d < 30 ? `${Math.floor(d / 7)} wk ago` : `${Math.floor(d / 30)} mo ago` }

const readJ = (k) => { try { return JSON.parse(localStorage.getItem(k)) } catch { return null } }
function index(list) {
  list.forEach((j) => memIndex.set(j.id, j))
  try { const all = [...memIndex.values()].slice(-350); localStorage.setItem(IK, JSON.stringify(all)) } catch {}
}
export function getJob(id, profile) {
  if (memIndex.has(id)) return memIndex.get(id)
  const saved = readJ(IK) || []; saved.forEach((j) => memIndex.set(j.id, j))
  return memIndex.get(id) || informalFor(profile).find((j) => j.id === id) || null
}

export async function fetchApiJobs(profile, q = '') {
  const f = (q || profile?.focus || '').toLowerCase().trim()
  const key = f || '*'
  const cache = readJ(CK) || {}
  if (cache[key] && Date.now() - cache[key].ts < TTL) return cache[key].list
  const words = f.split(/\s+/).filter((w) => w.length > 2)
  const qs = f ? [f, ...(words.length > 1 ? [words[words.length - 1]] : [])] : []
  const cat = Object.entries(CATS).find(([k]) => f.includes(k))?.[1]
  const mu = (level) => `${B.mu}/jobs?` + new URLSearchParams([['page', '1'], ...(cat ? [['category', cat]] : []), ['level', level]])
  const reqs = [
    ...(qs.length ? qs.map((s) => getJson(`${B.rm}/remote-jobs?limit=30&search=${encodeURIComponent(s)}`).then(N.rm)) : [getJson(`${B.rm}/remote-jobs?limit=30`).then(N.rm)]),
    ...(qs.length ? qs.slice(0, 1).map((s) => getJson(`${B.jb}/remote-jobs?count=30&tag=${encodeURIComponent(s)}`).then(N.jb)) : [getJson(`${B.jb}/remote-jobs?count=20`).then(N.jb)]),
    getJson(mu('Internship')).then(N.mu), getJson(mu('Entry Level')).then(N.mu), getJson(`${B.an}/job-board-api`).then(N.an),
  ]
  const res = await Promise.allSettled(reqs)
  const seen = new Set()
  const list = res.flatMap((r) => (r.status === 'fulfilled' ? r.value : [])).filter((j) => j.id && j.title && !seen.has(j.id) && seen.add(j.id))
  if (!list.length) { if (cache[key]) return cache[key].list; throw new Error('Could not reach the job APIs. Check your connection and retry.') }
  try { cache[key] = { ts: Date.now(), list }; localStorage.setItem(CK, JSON.stringify(cache)) } catch { try { localStorage.setItem(CK, JSON.stringify({ [key]: cache[key] })) } catch {} }
  return list
}
export const clearJobCache = () => { localStorage.removeItem(CK); localStorage.removeItem(IK); memIndex.clear() }

// useJobs(profile, q): trade jobs appear instantly, API jobs stream in and everything is ranked by profile relevance.
export function useJobs(profile, q = '') {
  const [api, setApi] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(''); const [n, setN] = useState(0)
  const focus = profile?.focus || ''
  useEffect(() => {
    let live = true; setLoading(true); setError('')
    fetchApiJobs(profile, q).then((l) => live && (setApi(l), index(l))).catch((e) => live && setError(e.message)).finally(() => live && setLoading(false))
    return () => { live = false }
  }, [focus, q, n]) // eslint-disable-line
  const jobs = useMemo(() => {
    const terms = termsOf(q ? { focus: q } : profile)
    const trade = q ? informalFor({ ...profile, focus: q }) : informalFor(profile)
    index(trade)
    const all = [...trade, ...api]
    if (!terms.length) return all.sort((a, b) => new Date(b.posted) - new Date(a.posted))
    const scored = all.map((j) => ({ j, s: relevance(j, terms) + (j.generated ? 2 : 0) }))
    const hit = scored.filter((x) => x.s > 0)
    return (hit.length >= 3 ? hit : scored).sort((a, b) => b.s - a.s || new Date(b.j.posted) - new Date(a.j.posted)).map((x) => x.j)
  }, [api, focus, q]) // eslint-disable-line
  return { jobs, loading, error, reload: () => { localStorage.removeItem(CK); setN((x) => x + 1) } }
}
