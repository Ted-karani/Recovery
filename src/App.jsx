import { useState } from 'react'
import usePersisted from './usePersisted'
import { Today, Body, Grow, Mind, Me } from './tabs.jsx'

export const iso = d => new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10)
const T = iso(new Date())
const init = { start: '2026-09-29', days: {}, xp: {}, gym: [], earn: [], spiral: [], due: [], pipe: [], letters: [], cap: [], fam: {}, dog: {}, vis: {}, reviews: [], bless: [], wins: [], vault: null, nocheck: T, fund: 100000, boss: '' }
const TABS = [['today', 'Today', Today], ['body', 'Body', Body], ['grow', 'Grow', Grow], ['mind', 'Mind', Mind], ['me', 'Me', Me]]

export default function App() {
  const [db, setDb] = usePersisted('forward_v2', init)
  const [tab, setTab] = useState('today')
  const upd = fn => setDb(d => { const n = structuredClone(d); fn(n); return n })
  const Page = TABS.find(t => t[0] === tab)[2]
  return (<>
    <main><Page db={db} upd={upd} T={T} /></main>
    <nav>{TABS.map(([k, l]) => <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{l}</button>)}</nav>
  </>)
}
