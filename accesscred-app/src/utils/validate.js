// Small validation toolkit. Each rule returns an error string or ''.
export const rules = {
  required: (m = 'This field is required') => (v) => (String(v ?? '').trim() === '' ? m : ''),
  min: (n, m) => (v) => (String(v).trim().length < n ? m || `Use at least ${n} characters` : ''),
  max: (n, m) => (v) => (String(v).length > n ? m || `Use at most ${n} characters` : ''),
  email: () => (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? '' : 'Enter a valid email address'),
  phone: () => (v) => (/^\+?[0-9\s-]{8,16}$/.test(v) ? '' : 'Enter a valid phone number, e.g. +234 801 234 5678'),
  password: () => (v) => (v.length < 8 ? 'Use at least 8 characters' : !/[A-Za-z]/.test(v) || !/\d/.test(v) ? 'Include both letters and numbers' : ''),
  fullName: () => (v) => (v.trim().split(/\s+/).length < 2 ? 'Enter your first and last name' : ''),
  range: (a, b) => (v) => (v === '' || (!isNaN(v) && +v >= a && +v <= b) ? '' : `Enter a number between ${a} and ${b}`),
  number: () => (v) => (v === '' || (!isNaN(v) && +v >= 0) ? '' : 'Enter a valid amount'),
  same: (other, m) => (v, all) => (v !== all[other] ? m || 'Values do not match' : ''),
}
// Optional fields: skip rules when empty.
export const optional = (...fs) => (v, all) => (String(v ?? '').trim() === '' ? '' : fs.map((f) => f(v, all)).find(Boolean) || '')
export const validate = (values, schema) =>
  Object.fromEntries(Object.entries(schema).map(([k, fs]) => [k, fs.map((f) => f(values[k] ?? '', values)).find(Boolean) || '']).filter(([, e]) => e))
