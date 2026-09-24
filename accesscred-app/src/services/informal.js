// Generated (seeded) listings for skilled-trade roles. No free public API covers these markets,
// so this module stands in for your backend. Replace `informalFor` with a real request
// (GET /jobs?track=informal&trade=...) and keep the same job shape.
const TRADES = {
  'fashion design': { alias: ['fashion', 'designer', 'stylist', 'clothing', 'apparel'], titles: ['Fashion Designer', 'Junior Fashion Designer', 'Pattern Maker', 'Fashion Design Assistant'], skills: ['Pattern making', 'Sketching', 'Sewing', 'Fabric selection', 'Fitting'], employers: ['Zuri Atelier', 'Adire Collective', 'Maison Lagos', 'Threadline Studio', 'Nairobi Runway House'] },
  tailoring: { alias: ['tailor', 'seamstress', 'sewing', 'garment', 'alterations'], titles: ['Tailor', 'Senior Tailor', 'Seamstress', 'Alterations Specialist'], skills: ['Sewing', 'Measuring', 'Alterations', 'Finishing', 'Pattern cutting'], employers: ['Kente & Co', 'Savile Row Africa', 'Bespoke Stitch House', 'Ankara Works', 'Golden Thimble'] },
  carpentry: { alias: ['carpent', 'wood', 'furniture', 'joiner'], titles: ['Carpenter', 'Furniture Maker', 'Joinery Assistant', 'Site Carpenter'], skills: ['Woodwork', 'Measuring', 'Joinery', 'Finishing', 'Blueprint reading'], employers: ['Oak & Iron Furniture', 'BuildRight Contractors', 'Heritage Woodworks', 'Prime Interiors', 'Timber Trade Ltd'] },
  'makeup & beauty': { alias: ['makeup', 'beauty', 'hair', 'salon', 'cosmetic'], titles: ['Makeup Artist', 'Beauty Therapist', 'Hair Stylist', 'Salon Assistant'], skills: ['Makeup application', 'Skin prep', 'Hair styling', 'Client care', 'Hygiene'], employers: ['Glow Studio', 'Velvet Beauty Lounge', 'Crown & Co Salon', 'Bloom Bridal', 'Radiant Skin Bar'] },
  'catering & baking': { alias: ['cater', 'bak', 'chef', 'cook', 'pastry'], titles: ['Pastry Assistant', 'Baker', 'Catering Assistant', 'Kitchen Cook'], skills: ['Baking', 'Food safety', 'Menu prep', 'Decorating', 'Stock control'], employers: ['Sweet Crumb Bakery', 'Harvest Table Catering', 'Golden Oven', 'Savour Events', 'Cocoa & Cream'] },
  welding: { alias: ['weld', 'fabricat', 'metal'], titles: ['Welder', 'Metal Fabricator', 'Welding Assistant', 'Gate & Grill Fabricator'], skills: ['Arc welding', 'Blueprint reading', 'Cutting', 'Safety', 'Finishing'], employers: ['SteelCraft Works', 'IronBridge Fabrication', 'Apex Metalworks', 'BuildRight Contractors', 'Titan Engineering'] },
  electrical: { alias: ['electric', 'wiring', 'solar'], titles: ['Electrician', 'Solar Installer', 'Electrical Assistant', 'Maintenance Technician'], skills: ['Wiring', 'Fault finding', 'Safety', 'Installation', 'Testing'], employers: ['BrightGrid Services', 'SunPeak Solar', 'Voltline Engineering', 'HomeSafe Electrical', 'Nova Power'] },
  photography: { alias: ['photo', 'video', 'camera', 'editing'], titles: ['Photographer', 'Photo Editor', 'Studio Assistant', 'Event Videographer'], skills: ['Photography', 'Lighting', 'Photo editing', 'Client care', 'Composition'], employers: ['Lens & Light Studio', 'Frame Story', 'Golden Hour Media', 'Aperture Africa', 'Snap Weddings'] },
}
const COUNTRY = {
  Nigeria: { cur: '₦', cities: ['Lagos', 'Abuja', 'Port Harcourt', 'Ibadan', 'Kano'], pay: [70000, 260000] },
  Kenya: { cur: 'KSh ', cities: ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru'], pay: [25000, 95000] },
  Ghana: { cur: 'GH₵', cities: ['Accra', 'Kumasi', 'Takoradi'], pay: [1500, 5500] },
  Uganda: { cur: 'USh ', cities: ['Kampala', 'Entebbe', 'Jinja'], pay: [500000, 1600000] },
}
const TYPES = ['Full-time', 'Full-time', 'Part-time', 'Apprenticeship', 'Contract']
const rng = (s) => () => { s |= 0; s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
const hash = (str) => [...str].reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 7)
const fmt = (n) => Math.round(n / 1000) * 1000

export const matchTrades = (focus = '') => {
  const f = focus.toLowerCase()
  if (!f) return []
  return Object.keys(TRADES).filter((k) => f.includes(k.split(' ')[0]) || k.includes(f) || TRADES[k].alias.some((a) => f.includes(a)))
}

export function generateJobs(trade, country = 'Nigeria', n = 10) {
  const T = TRADES[trade], C = COUNTRY[country] || COUNTRY.Nigeria
  const r = rng(hash(trade + country))
  return Array.from({ length: n }, (_, i) => {
    const type = TYPES[Math.floor(r() * TYPES.length)]
    const title = T.titles[i % T.titles.length]
    const org = T.employers[Math.floor(r() * T.employers.length)]
    const city = C.cities[Math.floor(r() * C.cities.length)]
    const lo = fmt(C.pay[0] + r() * (C.pay[1] - C.pay[0]) * 0.5), hi = fmt(lo * (1.3 + r() * 0.6))
    const sk = T.skills.slice(0, 3 + Math.floor(r() * 2))
    return {
      id: `gen-${trade.replace(/\W+/g, '')}-${country}-${i}`, source: 'AccessCred Partners', generated: true, verified: true, track: 'informal',
      title: type === 'Apprenticeship' ? `${title} (Apprentice)` : title, org, logo: '', location: `${city}, ${country}`, remote: false, type,
      level: type === 'Apprenticeship' ? 'Entry' : r() > 0.5 ? 'Mid' : 'Entry', category: trade, tags: sk,
      posted: new Date(Date.now() - Math.floor(r() * 18) * 864e5).toISOString(), url: '',
      salary: type === 'Apprenticeship' ? `${C.cur}${(lo / 2).toLocaleString()} stipend / month` : `${C.cur}${lo.toLocaleString()} – ${C.cur}${hi.toLocaleString()} / month`,
      desc: `${org} is hiring a ${title.toLowerCase()} in ${city}. You will work with our team on real client orders and be trusted with ${sk[0].toLowerCase()} and ${sk[1].toLowerCase()} from your first week.\n\nResponsibilities\n• Deliver quality work on time using ${sk.join(', ').toLowerCase()}\n• Communicate clearly with clients and teammates\n• Keep your workspace and tools organised\n\nRequirements\n• Hands-on experience in ${trade} (portfolio, photos or a verified AccessCred badge)\n• Reliable and punctual\n• ${type === 'Apprenticeship' ? 'No certificate needed. We train you on the job.' : 'At least 1 year of practical experience preferred'}`,
    }
  })
}

// Jobs shown to a user based on their profile focus (trade). Returns [] when the focus is not a trade.
export function informalFor(profile) {
  const trades = matchTrades(profile?.focus)
  const list = trades.length ? trades : profile?.track === 'Informal' ? ['tailoring', 'fashion design'] : []
  return list.flatMap((t) => generateJobs(t, profile?.country, 10))
}

// Sample applications and employer messages so new skilled-trade users see a realistic account.
export function seedInformal(profile) {
  const jobs = informalFor(profile).slice(0, 4)
  const states = [['Interview', 2], ['Under review', 4], ['Submitted', 6], ['Offer', 1]]
  const apps = jobs.map((j, i) => {
    const [status, days] = states[i]
    const d = Date.now() - days * 864e5
    return { jid: j.id, job: j, title: j.title, org: j.org, logo: '', location: j.location, type: j.type, url: '', gen: true, status, date: d, note: 'Portfolio photos attached.',
      events: [{ s: 'Submitted', t: d }, ...(status !== 'Submitted' ? [{ s: 'Under review', t: d + 864e5 }] : []), ...(status === 'Interview' || status === 'Offer' ? [{ s: 'Interview', t: d + 2 * 864e5 }] : []), ...(status === 'Offer' ? [{ s: 'Offer', t: d + 3 * 864e5 }] : [])] }
  })
  const threads = apps.filter((a) => ['Interview', 'Offer'].includes(a.status)).map((a) => ({
    id: 'emp-' + a.jid, name: a.org, msgs: [{ from: 'them', t: Date.now() - 864e5, text: a.status === 'Offer' ? `Hello! We enjoyed your work samples and would like to offer you the ${a.title} role. Can you visit us this week to sign?` : `Hello, thanks for applying for ${a.title}. Are you free for a short interview on Thursday at 10am?` }],
  }))
  return { apps, threads }
}
