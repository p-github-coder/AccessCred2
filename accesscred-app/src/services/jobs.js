import { useEffect, useMemo, useState } from 'react'
import { informalFor } from './informal'

// African-centred job feed (Nigeria · Kenya · Ghana · Uganda).
// Free global APIs (Remotive / Jobicy / Muse) mostly return US/EU roles, so we:
//   1. Ship curated African formal listings (internships, jobs, scholarships)
//   2. Only keep API jobs that are Worldwide/Remote-open OR mention Africa / NG / KE / GH / UG
//   3. Drop USA / Europe-only / Americas-only roles
// Skilled-trade roles still come from ./informal.js

const DEV = import.meta.env.DEV
const B = {
  rm: DEV ? '/proxy/remotive' : 'https://remotive.com/api',
  jb: DEV ? '/proxy/jobicy' : 'https://jobicy.com/api/v2',
  mu: DEV ? '/proxy/muse' : 'https://www.themuse.com/api/public',
}

const CATS = {
  marketing: 'Marketing', design: 'Design and UX', ux: 'Design and UX',
  software: 'Software Engineering', developer: 'Software Engineering', engineer: 'Software Engineering',
  data: 'Data and Analytics', sales: 'Sales', finance: 'Accounting and Finance', account: 'Accounting and Finance',
  educat: 'Education', teach: 'Education', health: 'Healthcare',
  'human resources': 'Human Resources and Recruitment', hr: 'Human Resources and Recruitment',
  writ: 'Writing and Editing', content: 'Writing and Editing', project: 'Project Management',
  operations: 'Business Operations', legal: 'Legal Services',
}

const SYN = {
  marketing: ['marketing', 'seo', 'social media', 'brand', 'content', 'growth', 'campaign'],
  design: ['design', 'ux', 'ui', 'graphic', 'creative'],
  software: ['software', 'developer', 'engineer', 'frontend', 'backend', 'react'],
  data: ['data', 'analyst', 'analytics', 'sql'],
  sales: ['sales', 'business development', 'account executive'],
  finance: ['finance', 'accounting', 'accountant', 'audit'],
  writ: ['writer', 'content', 'copy', 'editor'],
  fashion: ['fashion', 'garment', 'apparel', 'textile', 'stylist'],
}

const CK = 'accesscred_jobs_af_v3'
const IK = 'accesscred_jobindex_af_v3'
const TTL = 3 * 3600e3
const memIndex = new Map()

const AF_WORDS = [
  'nigeria', 'kenya', 'ghana', 'uganda', 'lagos', 'nairobi', 'accra', 'kampala',
  'abuja', 'mombasa', 'kumasi', 'entebbe', 'ibadan', 'port harcourt',
  'west africa', 'east africa', 'africa', 'african',
]

// Locations that mean "not for our users" when they appear without Africa/Worldwide
const BLOCK_LOC = [
  'united states', 'usa', 'u.s.', 'america', 'americas', 'canada', 'latam',
  'europe', 'eu only', 'germany', 'france', 'uk only', 'united kingdom only',
  'apac', 'australia', 'new zealand', 'israel',
]

const plain = (h = '') =>
  new DOMParser()
    .parseFromString(
      String(h)
        .replace(/<\/(p|div|h\d|ul)>|<br\s*\/?>/gi, '\n')
        .replace(/<li[^>]*>/gi, '• '),
      'text/html',
    )
    .body.textContent.replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n+/g, '\n\n')
    .trim()
    .slice(0, 1400)

const ttype = (s = '') =>
  /intern/i.test(s) ? 'Internship'
    : /part/i.test(s) ? 'Part-time'
      : /contract/i.test(s) ? 'Contract'
        : /apprentice/i.test(s) ? 'Apprenticeship'
          : /fellow/i.test(s) ? 'Fellowship'
            : /scholar/i.test(s) ? 'Scholarship'
              : 'Full-time'

const isRemote = (l = '') => /remote|anywhere|worldwide|global|flexible/i.test(l)

// --- Curated African formal opportunities (always shown) ---
const AFRICAN_JOBS = [
  {
    id: 'af-ng-1', source: 'AccessCred', title: 'Software Engineering Intern',
    org: 'Paystack', logo: '', location: 'Lagos, Nigeria', remote: false,
    type: 'Internship', level: 'Entry Level', category: 'Software Engineering',
    tags: ['React', 'Node.js', 'Fintech', 'Nigeria'],
    posted: daysAgo(3), url: 'https://paystack.com/careers',
    salary: '₦150,000 – ₦250,000 / month',
    desc: 'About The Company\nPaystack is a leading African fintech company that helps businesses accept payments online and offline across Nigeria and the continent.\n\nAbout the Role\nJoin our engineering team as a Software Engineering Intern. You will work on real product features, contribute to payment infrastructure, and learn from experienced engineers.\n\nResponsibilities\n• Build and maintain frontend features using React\n• Collaborate with product and design teams\n• Write clean, tested code\n• Participate in code reviews and standups\n\nRequirements\n• Currently pursuing a degree in Computer Science or related field\n• Strong knowledge of JavaScript and React\n• Available for 3–6 months',
  },
  {
    id: 'af-ng-2', source: 'AccessCred', title: 'Data Science Fellowship',
    org: 'Data Science Nigeria', logo: '', location: 'Lagos / Remote, Nigeria', remote: true,
    type: 'Fellowship', level: 'Entry Level', category: 'Data and Analytics',
    tags: ['Python', 'Machine Learning', 'AI', 'Nigeria'],
    posted: daysAgo(5), url: 'https://www.datasciencenigeria.org',
    salary: 'Stipend + Mentorship',
    desc: 'About The Company\nData Science Nigeria trains African data scientists and drives AI adoption across the continent.\n\nAbout the Role\nA 6-month intensive fellowship with practical machine learning projects, mentorship, and placement support.\n\nWhat You\'ll Gain\n• Hands-on projects with African datasets\n• Mentorship from senior data scientists\n• Certificate and job placement assistance\n\nIdeal Candidate\n• Strong Python fundamentals\n• Interest in solving African problems with AI',
  },
  {
    id: 'af-ng-3', source: 'AccessCred', title: 'Product Design Intern',
    org: 'Flutterwave', logo: '', location: 'Lagos, Nigeria', remote: false,
    type: 'Internship', level: 'Entry Level', category: 'Design and UX',
    tags: ['Figma', 'UI/UX', 'Fintech', 'Nigeria'],
    posted: daysAgo(4), url: 'https://flutterwave.com/careers',
    salary: '₦120,000 – ₦180,000 / month',
    desc: 'About The Company\nFlutterwave is Africa\'s leading payments technology company.\n\nAbout the Role\nWork with the product design team on user flows, prototypes, and the design system used by millions.\n\nRequirements\n• Portfolio demonstrating UI/UX skills\n• Proficiency in Figma\n• Passion for fintech and African markets',
  },
  {
    id: 'af-ng-4', source: 'AccessCred', title: 'Frontend Developer (Junior)',
    org: 'Interswitch', logo: '', location: 'Lagos, Nigeria', remote: false,
    type: 'Full-time', level: 'Junior', category: 'Software Engineering',
    tags: ['React', 'JavaScript', 'Fintech', 'Nigeria'],
    posted: daysAgo(6), url: 'https://www.interswitchgroup.com/careers',
    salary: '₦200,000 – ₦350,000 / month',
    desc: 'About The Company\nInterswitch powers digital payments and digital commerce in Africa.\n\nAbout the Role\nBuild and improve web experiences for merchants and consumers across our payment products.\n\nRequirements\n• 0–2 years experience with React or similar\n• Solid JavaScript fundamentals\n• Based in Lagos or willing to relocate',
  },
  {
    id: 'af-ng-5', source: 'AccessCred', title: 'Graduate Trainee – Technology',
    org: 'Andela', logo: '', location: 'Lagos / Remote, Nigeria', remote: true,
    type: 'Internship', level: 'Entry Level', category: 'Software Engineering',
    tags: ['Training', 'Software', 'Nigeria'],
    posted: daysAgo(2), url: 'https://andela.com',
    salary: 'Competitive stipend',
    desc: 'About The Programme\nAndela\'s graduate pathway trains early-career African engineers and connects them with global and local opportunities.\n\nRequirements\n• Recent graduate or final-year student in a technical field\n• Demonstrated interest in software development\n• Strong problem-solving ability',
  },
  {
    id: 'af-ke-1', source: 'AccessCred', title: 'Full Stack Developer Intern',
    org: 'Safaricom', logo: '', location: 'Nairobi, Kenya', remote: false,
    type: 'Internship', level: 'Entry Level', category: 'Software Engineering',
    tags: ['Full Stack', 'JavaScript', 'Kenya'],
    posted: daysAgo(3), url: 'https://www.safaricom.co.ke/careers',
    salary: 'KSh 40,000 – 60,000 / month',
    desc: 'About The Company\nSafaricom is Kenya\'s leading telecommunications company and the innovator behind M-Pesa.\n\nAbout the Role\nContribute to customer-facing applications and internal tools serving millions of Kenyans.\n\nRequirements\n• Computer Science or related degree (ongoing or recent)\n• Solid JavaScript knowledge\n• Familiarity with React or similar frameworks',
  },
  {
    id: 'af-ke-2', source: 'AccessCred', title: 'Agritech Operations Intern',
    org: 'Twiga Foods', logo: '', location: 'Nairobi, Kenya', remote: false,
    type: 'Internship', level: 'Entry Level', category: 'Business Operations',
    tags: ['Agritech', 'Operations', 'Kenya'],
    posted: daysAgo(7), url: 'https://twiga.com',
    salary: 'KSh 25,000 – 35,000 / month',
    desc: 'About The Company\nTwiga Foods connects farmers to retailers through a technology-enabled supply chain.\n\nAbout the Role\nSupport operations, farmer onboarding, and data collection. Ideal for students passionate about agriculture and technology.',
  },
  {
    id: 'af-ke-3', source: 'AccessCred', title: 'Junior Software Engineer',
    org: 'Cellulant', logo: '', location: 'Nairobi, Kenya', remote: false,
    type: 'Full-time', level: 'Junior', category: 'Software Engineering',
    tags: ['Backend', 'Payments', 'Kenya'],
    posted: daysAgo(5), url: 'https://www.cellulant.com',
    salary: 'KSh 80,000 – 150,000 / month',
    desc: 'About The Company\nCellulant builds payment and commerce infrastructure across Africa.\n\nAbout the Role\nJoin a product engineering team building APIs and services used by banks, telcos, and businesses across the continent.\n\nRequirements\n• Experience with at least one backend language\n• Understanding of REST APIs\n• Based in Nairobi',
  },
  {
    id: 'af-ke-4', source: 'AccessCred', title: 'Digital Marketing Associate',
    org: 'Jumia Kenya', logo: '', location: 'Nairobi, Kenya', remote: false,
    type: 'Full-time', level: 'Entry Level', category: 'Marketing',
    tags: ['SEO', 'Social Media', 'E-commerce', 'Kenya'],
    posted: daysAgo(4), url: 'https://group.jumia.com',
    salary: 'KSh 50,000 – 80,000 / month',
    desc: 'About The Company\nJumia is Africa\'s leading e-commerce platform.\n\nAbout the Role\nDrive acquisition and engagement through digital channels, social campaigns, and performance marketing.',
  },
  {
    id: 'af-gh-1', source: 'AccessCred', title: 'Software Engineering Scholarship & Internship',
    org: 'Ghana Tech Lab', logo: '', location: 'Accra, Ghana', remote: true,
    type: 'Scholarship', level: 'Entry Level', category: 'Software Engineering',
    tags: ['Scholarship', 'Training', 'Ghana'],
    posted: daysAgo(2), url: 'https://ghanatechlab.com',
    salary: 'Full scholarship + stipend',
    desc: 'About The Programme\nCombined scholarship and internship pathway for Ghanaian software engineers — training followed by placement support.\n\nBenefits\n• Tuition coverage for selected courses\n• Monthly stipend\n• Mentorship and internship interviews with partners\n\nEligibility\n• Ghanaian citizen or resident\n• Interest in software development',
  },
  {
    id: 'af-gh-2', source: 'AccessCred', title: 'Digital Marketing Associate',
    org: 'Jumia Ghana', logo: '', location: 'Accra, Ghana', remote: false,
    type: 'Full-time', level: 'Entry Level', category: 'Marketing',
    tags: ['SEO', 'Social Media', 'E-commerce', 'Ghana'],
    posted: daysAgo(6), url: 'https://group.jumia.com',
    salary: 'GH₵ 3,500 – 5,500 / month',
    desc: 'About The Company\nJumia connects consumers and sellers across Africa.\n\nAbout the Role\nManage social campaigns, analyse performance, and optimise conversion for the Ghana market.',
  },
  {
    id: 'af-gh-3', source: 'AccessCred', title: 'Product Analyst Intern',
    org: 'Hubtel', logo: '', location: 'Accra, Ghana', remote: false,
    type: 'Internship', level: 'Entry Level', category: 'Data and Analytics',
    tags: ['Analytics', 'Product', 'Ghana'],
    posted: daysAgo(8), url: 'https://hubtel.com',
    salary: 'GH₵ 1,500 – 2,500 / month',
    desc: 'About The Company\nHubtel provides payments, commerce, and service solutions in Ghana.\n\nAbout the Role\nSupport product decisions with data analysis, dashboards, and user insights.',
  },
  {
    id: 'af-ug-1', source: 'AccessCred', title: 'Junior Software Developer',
    org: 'SafeBoda', logo: '', location: 'Kampala, Uganda', remote: false,
    type: 'Full-time', level: 'Junior', category: 'Software Engineering',
    tags: ['Mobile', 'Backend', 'Startup', 'Uganda'],
    posted: daysAgo(3), url: 'https://safeboda.com',
    salary: 'USh 1,500,000 – 2,500,000 / month',
    desc: 'About The Company\nSafeBoda transforms urban mobility in Uganda with ride-hailing and logistics.\n\nAbout the Role\nWork across the stack on features used by thousands of riders and drivers daily.\n\nRequirements\n• Experience with mobile or backend development\n• Comfortable in a fast-moving startup',
  },
  {
    id: 'af-ug-2', source: 'AccessCred', title: 'Graduate Trainee – Operations',
    org: 'Wave Mobile Money', logo: '', location: 'Kampala, Uganda', remote: false,
    type: 'Internship', level: 'Entry Level', category: 'Business Operations',
    tags: ['Fintech', 'Operations', 'Uganda'],
    posted: daysAgo(5), url: 'https://www.wave.com',
    salary: 'Competitive stipend',
    desc: 'About The Company\nWave provides fast, affordable mobile money across several African markets.\n\nAbout the Role\nSupport agent networks, customer operations, and process improvement in Uganda.',
  },
  {
    id: 'af-ug-3', source: 'AccessCred', title: 'UI/UX Design Intern',
    org: 'Xente', logo: '', location: 'Kampala, Uganda', remote: false,
    type: 'Internship', level: 'Entry Level', category: 'Design and UX',
    tags: ['UI/UX', 'Figma', 'Uganda'],
    posted: daysAgo(9), url: 'https://xente.co',
    salary: 'USh 500,000 – 800,000 / month',
    desc: 'About The Company\nXente builds digital payment and lifestyle products for East Africa.\n\nAbout the Role\nDesign user flows and interfaces for consumer and merchant apps.\n\nRequirements\n• Portfolio in Figma or similar\n• Interest in fintech UX',
  },
  {
    id: 'af-pan-1', source: 'AccessCred', title: 'Africa Software Engineering Internship',
    org: 'Google', logo: '', location: 'Remote (Africa)', remote: true,
    type: 'Internship', level: 'Entry Level', category: 'Software Engineering',
    tags: ['Internship', 'Tech', 'Remote', 'Africa'],
    posted: daysAgo(2), url: 'https://careers.google.com/students',
    salary: 'Competitive stipend',
    desc: 'About the Opportunity\nJoin Google\'s internship programmes open to students in Africa. Work on real projects, learn from industry experts, and build skills that transfer globally.\n\nRequirements\n• Currently enrolled in a university\n• Relevant technical skills (CS, Engineering, etc.)\n• Strong problem-solving and communication skills\n\nBenefits\n• Stipend · Mentorship · Certificate · Networking',
  },
  {
    id: 'af-pan-2', source: 'AccessCred', title: 'Microsoft Learn Student Ambassador',
    org: 'Microsoft', logo: '', location: 'Remote (Africa)', remote: true,
    type: 'Fellowship', level: 'Entry Level', category: 'Software Engineering',
    tags: ['Community', 'Learning', 'Africa'],
    posted: daysAgo(10), url: 'https://studentambassadors.microsoft.com',
    salary: 'Non-paid · Benefits & community',
    desc: 'About the Programme\nStudent Ambassadors lead learning communities on campus, host workshops, and get early access to Microsoft tools and mentorship.\n\nEligibility\n• University student in a participating country (including many in Africa)\n• Passion for technology and community building',
  },
  {
    id: 'af-pan-3', source: 'AccessCred', title: 'Remote Frontend Developer',
    org: 'Hotjar (Africa-friendly remote)', logo: '', location: 'Remote (Worldwide)', remote: true,
    type: 'Full-time', level: 'Mid', category: 'Software Engineering',
    tags: ['React', 'Remote', 'Worldwide'],
    posted: daysAgo(4), url: 'https://www.hotjar.com/careers',
    salary: 'Competitive (USD)',
    desc: 'About the Role\nFully remote frontend role open to talent worldwide, including Africa. Work on product analytics UX used by thousands of companies.\n\nRequirements\n• Strong React experience\n• Comfortable in async remote culture',
  },
]

function daysAgo(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

function isAfricanJob(j) {
  const loc = (j.location || '').toLowerCase()
  const blob = (j.title + ' ' + j.org + ' ' + (j.desc || '') + ' ' + (j.tags || []).join(' ')).toLowerCase()
  if (AF_WORDS.some((w) => loc.includes(w) || blob.includes(w))) return true
  // True worldwide remote — keep
  if (j.remote && /worldwide|anywhere|global|remote \(worldwide\)|remote \(africa\)/i.test(loc)) return true
  if (j.remote && loc === 'remote') return true
  return false
}

function isBlockedLocation(j) {
  const loc = (j.location || '').toLowerCase()
  if (!loc) return false
  // If it explicitly includes Africa keywords, never block
  if (AF_WORDS.some((w) => loc.includes(w))) return false
  if (/worldwide|anywhere|global/i.test(loc)) return false
  // Block US / Europe / Americas-only style locations
  return BLOCK_LOC.some((b) => loc.includes(b))
}

const N = {
  rm: (d) =>
    (d.jobs || []).map((j) => ({
      id: 'rm-' + j.id,
      source: 'Remotive',
      title: j.title,
      org: j.company_name,
      logo: j.company_logo,
      location: j.candidate_required_location || 'Remote',
      remote: true,
      type: ttype(j.job_type + ' ' + j.title),
      level: '',
      category: j.category,
      tags: (j.tags || []).slice(0, 5),
      posted: j.publication_date,
      url: j.url,
      salary: j.salary || '',
      desc: plain(j.description),
    })),
  jb: (d) =>
    (d.jobs || []).map((j) => ({
      id: 'jb-' + j.id,
      source: 'Jobicy',
      title: j.jobTitle,
      org: j.companyName,
      logo: j.companyLogo,
      location: j.jobGeo || 'Remote',
      remote: true,
      type: ttype([].concat(j.jobType || []).join(' ') + ' ' + j.jobTitle),
      level: [].concat(j.jobLevel || []).join(', '),
      category: [].concat(j.jobIndustry || [])[0] || '',
      tags: [].concat(j.jobIndustry || []).slice(0, 4),
      posted: j.pubDate,
      url: j.url,
      salary: j.annualSalaryMin
        ? `${j.salaryCurrency || '$'} ${Number(j.annualSalaryMin).toLocaleString()} – ${Number(j.annualSalaryMax || j.annualSalaryMin).toLocaleString()} / year`
        : '',
      desc: plain(j.jobDescription || j.jobExcerpt),
    })),
  mu: (d) =>
    (d.results || []).map((j) => {
      const lv = (j.levels || [])[0]?.name || ''
      const loc = (j.locations || []).map((l) => l.name).join(' • ') || 'Flexible / Remote'
      return {
        id: 'mu-' + j.id,
        source: 'The Muse',
        title: j.name,
        org: j.company?.name || '',
        logo: '',
        location: loc,
        remote: isRemote(loc),
        type: /intern/i.test(lv) ? 'Internship' : ttype(j.name),
        level: lv,
        category: (j.categories || [])[0]?.name || '',
        tags: (j.categories || []).map((c) => c.name).slice(0, 3),
        posted: j.publication_date,
        url: j.refs?.landing_page,
        salary: '',
        desc: plain(j.contents),
      }
    }),
}

export const termsOf = (p) => {
  const f = (p?.focus || '').toLowerCase().trim()
  if (!f) return []
  const out = new Set([f, ...f.split(/[\s,&/]+/).filter((w) => w.length > 2)])
  Object.entries(SYN).forEach(([k, v]) => f.includes(k) && v.forEach((x) => out.add(x)))
  return [...out]
}

export function relevance(j, terms) {
  const t = j.title.toLowerCase()
  const g = (j.tags.join(' ') + ' ' + j.category).toLowerCase()
  const d = (j.desc || '').toLowerCase()
  let s = terms.reduce(
    (acc, x) => acc + (t.includes(x) ? 5 : 0) + (g.includes(x) ? 3 : 0) + (d.includes(x) ? 1 : 0),
    0,
  )
  // Strong boost for African locations
  const loc = (j.location || '').toLowerCase()
  if (AF_WORDS.some((w) => loc.includes(w))) s += 20
  else if (j.source === 'AccessCred') s += 15
  else if (j.remote && /worldwide|global|anywhere|africa/i.test(loc)) s += 8
  return s
}

export function matchInfo(j, p) {
  const terms = [...termsOf(p), ...(p?.skills || []).map((s) => s.toLowerCase())]
  const hay = (j.title + ' ' + j.tags.join(' ') + ' ' + j.category + ' ' + (j.desc || '')).toLowerCase()
  const hits = [...new Set(terms.filter((x) => hay.includes(x)))]
  if (!terms.length) return null
  return { pct: Math.min(97, 42 + hits.length * 11), hits: hits.slice(0, 5) }
}

export const ago = (iso) => {
  const d = Math.max(0, Math.floor((Date.now() - new Date(iso)) / 864e5))
  return d === 0 ? 'Today' : d === 1 ? '1 day ago' : d < 7 ? `${d} days ago` : d < 30 ? `${Math.floor(d / 7)} wk ago` : `${Math.floor(d / 30)} mo ago`
}

const readJ = (k) => {
  try {
    return JSON.parse(localStorage.getItem(k))
  } catch {
    return null
  }
}

function index(list) {
  list.forEach((j) => memIndex.set(j.id, j))
  try {
    const all = [...memIndex.values()].slice(-400)
    localStorage.setItem(IK, JSON.stringify(all))
  } catch {}
}

export function getJob(id, profile) {
  if (memIndex.has(id)) return memIndex.get(id)
  const saved = readJ(IK) || []
  saved.forEach((j) => memIndex.set(j.id, j))
  return memIndex.get(id) || informalFor(profile).find((j) => j.id === id) || AFRICAN_JOBS.find((j) => j.id === id) || null
}

async function getJson(url) {
  const r = await fetch(url)
  if (!r.ok) throw new Error('HTTP ' + r.status)
  return r.json()
}

/** Fetch optional remote API jobs, then keep only Africa-relevant / worldwide. */
export async function fetchApiJobs(profile, q = '') {
  const f = (q || profile?.focus || '').toLowerCase().trim()
  const key = 'af3:' + (f || '*')
  const cache = readJ(CK) || {}
  if (cache[key] && Date.now() - cache[key].ts < TTL) return cache[key].list

  // Always start with curated African roles
  let list = [...AFRICAN_JOBS]

  // Optional: pull remote API jobs and filter hard
  const words = f.split(/\s+/).filter((w) => w.length > 2)
  const focusTerm = f || 'software'
  const searches = [
    focusTerm + ' Africa',
    focusTerm + ' Nigeria',
    'Africa',
    'Nigeria',
    'Kenya',
  ].filter((v, i, a) => a.indexOf(v) === i).slice(0, 4)

  const cat = Object.entries(CATS).find(([k]) => f.includes(k))?.[1]
  const mu = (level) =>
    B.mu +
    '/jobs?' +
    new URLSearchParams([['page', '1'], ...(cat ? [['category', cat]] : []), ['level', level]])

  try {
    const reqs = [
      ...searches.slice(0, 2).map((s) => getJson(B.rm + '/remote-jobs?limit=20&search=' + encodeURIComponent(s)).then(N.rm)),
      getJson(B.jb + '/remote-jobs?count=20&tag=' + encodeURIComponent(focusTerm)).then(N.jb),
      getJson(mu('Internship')).then(N.mu),
      getJson(mu('Entry Level')).then(N.mu),
    ]
    const res = await Promise.allSettled(reqs)
    const seen = new Set(list.map((j) => j.id))
    const apiJobs = res
      .flatMap((r) => (r.status === 'fulfilled' ? r.value : []))
      .filter((j) => j.id && j.title && !seen.has(j.id) && seen.add(j.id))
      // HARD FILTER: drop US/EU-only; keep African + true worldwide remote
      .filter((j) => !isBlockedLocation(j) && isAfricanJob(j))

    list = [...list, ...apiJobs]
  } catch {
    // Curated list alone is enough if APIs fail
  }

  // Filter curated by focus lightly when user is searching
  if (f) {
    const terms = termsOf({ focus: f })
    const scored = list.map((j) => ({ j, s: relevance(j, terms) }))
    const hits = scored.filter((x) => x.s > 0)
    if (hits.length >= 4) list = hits.sort((a, b) => b.s - a.s).map((x) => x.j)
    else list = scored.sort((a, b) => b.s - a.s).map((x) => x.j)
  }

  try {
    cache[key] = { ts: Date.now(), list }
    localStorage.setItem(CK, JSON.stringify(cache))
  } catch {
    try {
      localStorage.setItem(CK, JSON.stringify({ [key]: cache[key] }))
    } catch {}
  }
  return list
}

export const clearJobCache = () => {
  localStorage.removeItem(CK)
  localStorage.removeItem(IK)
  memIndex.clear()
}

export function useJobs(profile, q = '') {
  const [api, setApi] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [n, setN] = useState(0)
  const focus = profile?.focus || ''

  useEffect(() => {
    let live = true
    setLoading(true)
    setError('')
    fetchApiJobs(profile, q)
      .then((l) => live && (setApi(l), index(l)))
      .catch((e) => live && setError(e.message))
      .finally(() => live && setLoading(false))
    return () => {
      live = false
    }
  }, [focus, q, n]) // eslint-disable-line

  const jobs = useMemo(() => {
    const terms = termsOf(q ? { focus: q } : profile)
    const trade = q ? informalFor({ ...profile, focus: q }) : informalFor(profile)
    index(trade)
    const all = [...trade, ...api]
    if (!terms.length) return all.sort((a, b) => new Date(b.posted) - new Date(a.posted))
    const scored = all.map((j) => ({ j, s: relevance(j, terms) + (j.generated ? 2 : 0) }))
    const hit = scored.filter((x) => x.s > 0)
    return (hit.length >= 3 ? hit : scored)
      .sort((a, b) => b.s - a.s || new Date(b.j.posted) - new Date(a.j.posted))
      .map((x) => x.j)
  }, [api, focus, q]) // eslint-disable-line

  return {
    jobs,
    loading,
    error,
    reload: () => {
      localStorage.removeItem(CK)
      setN((x) => x + 1)
    },
  }
}
