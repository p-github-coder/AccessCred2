import { useMemo, useState } from 'react'
import { validate } from '../utils/validate'

// const f = useForm({ email: '' }, { email: [rules.required(), rules.email()] })
// <Field label="Email" {...f.bind('email')} />   <form onSubmit={f.submit(values => ...)}>
export function useForm(initial, schema) {
  const [values, setValues] = useState(initial)
  const [touched, setTouched] = useState({})
  const errors = useMemo(() => validate(values, schema), [values]) // eslint-disable-line
  const bind = (k) => ({
    name: k, value: values[k],
    onChange: (e) => setValues((v) => ({ ...v, [k]: e.target.value })),
    onBlur: () => setTouched((t) => ({ ...t, [k]: true })),
    error: touched[k] ? errors[k] : '',
  })
  const submit = (fn) => (e) => {
    e?.preventDefault()
    setTouched(Object.fromEntries(Object.keys(schema).map((k) => [k, true])))
    if (Object.keys(errors).length) return
    fn(values)
  }
  return { values, setValues, errors, bind, submit }
}
