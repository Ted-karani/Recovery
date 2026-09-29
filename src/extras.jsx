import { useState } from 'react'
const since = (T, d) => Math.floor((new Date(T) - new Date(d)) / 864e5)
const addXp = (n, a, x) => { n.xp[a] = Math.max(0, (n.xp[a] || 0) + x) }
const iso = d => new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10)
const STAGES = ['Lead', 'Pitched', 'Won', 'Paid']

export function Deadlines({ db, upd, T }) {
  const [f, setF] = useState({ t: '', d: '' })
  return (<><h2>Deadlines</h2>
    <div className="r"><input placeholder="Assignment or exam" value={f.t} onChange={e => setF({ ...f, t: e.target.value })} /><input type="date" value={f.d} onChange={e => setF({ ...f, d: e.target.value })} /></div>
    <button onClick={() => { if (f.t && f.d) { upd(x => { x.due.push(f) }); setF({ t: '', d: '' }) } }}>Add</button>
    {[...db.due].sort((a, b) => a.d < b.d ? -1 : 1).map(x => <div key={x.t + x.d} className="c">{x.t} <span className="m">{x.d} ({-since(T, x.d)} days)</span>
      <button className="g" onClick={() => upd(n => { n.due = n.due.filter(y => y !== x && !(y.t === x.t && y.d === x.d)); addXp(n, 'School', 10) })}>Done</button></div>)}</>)
}

export function Pipeline({ db, upd }) {
  const [n, setN] = useState('')
  return (<><h2>Gig pipeline</h2>
    <div className="r"><input placeholder="Business or client" value={n} onChange={e => setN(e.target.value)} /><button onClick={() => { if (n) { upd(x => { x.pipe.push({ n, s: 0 }) }); setN('') } }}>Add</button></div>
    {db.pipe.map((p, i) => <div key={i} className="a" onClick={() => upd(x => { const y = x.pipe[i]; y.s = (y.s + 1) % 4; if (y.s === 3) addXp(x, 'Money', 30) })}><span>{p.n}</span><b>{STAGES[p.s]}</b></div>)}
    <p className="m">Tap a client to move them forward: lead, pitched, won, paid.</p></>)
}

export function Letters({ db, upd, T }) {
  const [t, setT] = useState(''), [open, setOpen] = useState(-1)
  return (<><h2>Unsent letters</h2>
    <textarea placeholder="Say it here instead of sending it" value={t} onChange={e => setT(e.target.value)} />
    <button onClick={() => { if (t) { upd(x => { x.letters.push({ d: T, t }) }); setT('') } }}>Lock it away</button>
    {db.letters.map((l, i) => <div key={i} className="c" onClick={() => setOpen(open === i ? -1 : i)}>{open === i ? <span className="pre">{l.t}</span> : <span className="m">Letter from {l.d} (tap to read)</span>}</div>)}</>)
}

export function Capsule({ db, upd, T }) {
  const [t, setT] = useState(''), [days, setDays] = useState(30)
  return (<><h2>Letter to future me</h2>
    <textarea placeholder="Write to the you of the future" value={t} onChange={e => setT(e.target.value)} />
    <select value={days} onChange={e => setDays(+e.target.value)}><option value={30}>Open in 30 days</option><option value={90}>Open in 90 days</option><option value={365}>Open in 1 year</option></select>
    <button onClick={() => { if (t) { upd(x => { x.cap.push({ t, o: iso(new Date(Date.now() + days * 864e5)) }) }); setT('') } }}>Seal it</button>
    {db.cap.map((c, i) => <div key={i} className="c pre">{since(T, c.o) >= 0 ? c.t : 'Sealed until ' + c.o}</div>)}</>)
}

export function Family({ db, upd, T }) {
  const dog = (db.dog || {})[T]
  return (<><h2>People and home</h2>
    {['Mum', 'Dad', 'Cousin', 'A friend'].map(p => <div key={p} className="a" onClick={() => upd(x => { x.fam[p] = T; addXp(x, 'People', 5) })}><span>{p}</span><b className="m">{db.fam[p] ? since(T, db.fam[p]) + 'd ago' : 'reach out'}</b></div>)}
    <div className={'a' + (dog ? ' on' : '')} onClick={() => upd(x => { x.dog[T] = !x.dog[T] })}><b>{dog ? '✓' : '○'}</b><span>Played with or fed Majesty</span></div></>)
}

export function Vision({ db, upd }) {
  return (<><h2>Vision</h2>{[['v1', '1 year'], ['v5', '5 years'], ['v10', '10 years']].map(([k, l]) =>
    <textarea key={k} placeholder={l} defaultValue={db.vis[k] || ''} onBlur={e => upd(x => { x.vis[k] = e.target.value })} />)}</>)
}

export function WinAdd({ upd }) {
  const [w, setW] = useState('')
  return (<div className="r"><input placeholder="A win, big or small" value={w} onChange={e => setW(e.target.value)} /><button onClick={() => { if (w) { upd(x => { x.wins.push(w) }); setW('') } }}>Add</button></div>)
}

export function Review({ db, upd, T }) {
  const [a, setA] = useState(''), [b, setB] = useState('')
  const wk = [...Array(7)].map((_, k) => iso(new Date(Date.now() - k * 864e5)))
  const days = wk.filter(d => db.days[d] && Object.values(db.days[d].a).filter(Boolean).length >= 2).length
  const sets = db.gym.filter(g => wk.includes(g.d)).length, kes = db.earn.filter(e => wk.includes(e.d)).reduce((s, e) => s + e.a, 0)
  const last = (db.reviews || []).slice(-1)[0]
  return (<><h2>Weekly review</h2>
    <div className="c">Last 7 days: <b>{days}</b> solid days, <b>{sets}</b> gym sets, <b>KES {kes}</b> earned.</div>
    <textarea placeholder="What worked this week?" value={a} onChange={e => setA(e.target.value)} />
    <textarea placeholder="What will I change next week?" value={b} onChange={e => setB(e.target.value)} />
    <button onClick={() => { if (a || b) { upd(x => { x.reviews = [...(x.reviews || []), { d: T, a, b }] }); setA(''); setB('') } }}>Save review</button>
    {last && <div className="c m">{last.d}<br />Worked: {last.a}<br />Change: {last.b}</div>}</>)
}

export function Backup({ db, upd }) {
  const [box, setBox] = useState('')
  const flip = () => { const r = document.documentElement, dark = r.dataset.theme ? r.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme:dark)').matches; const t = dark ? 'light' : 'dark'; r.dataset.theme = t; try { localStorage.setItem('forward_theme', t) } catch {} }
  return (<><h2>Backup and theme</h2><textarea placeholder="Your data shows here" value={box} onChange={e => setBox(e.target.value)} />
    <button className="g" onClick={() => setBox(JSON.stringify(db))}>Show my data</button>
    <button className="g" onClick={() => { try { const p = JSON.parse(box); upd(x => { Object.assign(x, p) }) } catch { setBox('Could not read that') } }}>Restore from box</button>
    <button className="g" onClick={flip}>Switch theme</button>
    <p className="m">Copy the text somewhere safe (like a note to yourself) to keep a backup.</p></>)
}
