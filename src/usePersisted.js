import { useState, useEffect } from 'react'
export default function usePersisted(key, init) {
  const [v, setV] = useState(() => {
    try { const s = localStorage.getItem(key); return s ? { ...init, ...JSON.parse(s) } : init } catch { return init }
  })
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(v)) } catch {} }, [v, key])
  return [v, setV]
}
