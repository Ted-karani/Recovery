import { useState, useEffect, useRef } from 'react'
import { iso } from './App.jsx'
import { Deadlines, Pipeline, Letters, Capsule, Family, Vision, WinAdd, Review, Backup } from './extras.jsx'

const AN = [['gym', 'Gym or move', 'Body'], ['code', 'Coding block', 'Craft'], ['reach', 'Reach out to someone', 'People']]
const AREAS = ['Body', 'Craft', 'Money', 'Faith', 'People', 'School']
const CARE = ['Ate a proper meal', 'Drank water', 'Slept by 11 last night', 'A quiet moment or prayer', 'Got some sunlight']
const QUOTES = ['You are 18 and already shipping real apps. Stack the days.', 'Do the minimum on bad days. That still counts.', 'You did not lose your worth. You got your time back.', 'Mum and Dad are why. Keep going.', 'Small daily reps beat one big burst.']
const lvl = (db, a) => Math.floor((db.xp[a] || 0) / 50) + 1
const addXp = (n, a, x) => { n.xp[a] = Math.max(0, (n.xp[a] || 0) + x) }
const dayOf = (n, T) => (n.days[T] = n.days[T] || { a: {}, care: {}, hard: 0, mood: 0, note: '' })
const since = (T, d) => Math.floor((new Date(T) - new Date(d)) / 864e5)
const fmt = s => Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0')
const hash = s => { let h = 5381; for (const c of s) h = (h * 33) ^ c.charCodeAt(0); return String(h >>> 0) }

function useTimer() {
  const [left, setLeft] = useState(0), ref = useRef()
  const start = (sec, done) => {
    clearInterval(ref.current); const end = Date.now() + sec * 1e3; setLeft(sec)
    ref.current = setInterval(() => { const r = Math.max(0, Math.round((end - Date.now()) / 1e3)); setLeft(r); if (!r) { clearInterval(ref.current); done && done() } }, 500)
  }
  useEffect(() => () => clearInterval(ref.current), [])
  return [left, start]
}

function done(day, hard) { return day && (hard ? ['gym', 'reach'] : ['gym', 'code', 'reach']).every(k => day.a[k]) }
function streak(db, T) {
  let n = 0, last = -99
  for (let k = 0; k < 400; k++) {
    const d = db.days[iso(new Date(Date.now() - k * 864e5))]
    if (done(d, d?.hard)) n++
    else if (k === 0) continue
    else { if (k - last < 7) break; last = k }
  }
  return n
}

function Wheel({ db }) {
  const pts = AREAS.map((a, i) => { const r = 15 + Math.min(lvl(db, a), 10) * 8, an = i / 6 * 6.283 - 1.571; return [100 + r * Math.cos(an), 100 + r * Math.sin(an)] })
  return (<svg viewBox="0 0 200 200" className="wheel"><circle cx="100" cy="100" r="95" className="ring" /><circle cx="100" cy="100" r="50" className="ring" />
    <polygon points={pts.map(p => p.join(',')).join(' ')} className="shape" />
    {AREAS.map((a, i) => { const an = i / 6 * 6.283 - 1.571; return <text key={a} x={100 + 94 * Math.cos(an)} y={103 + 94 * Math.sin(an)} textAnchor="middle" fontSize="9">{a} {lvl(db, a)}</text> })}</svg>)
}

export function Today({ db, upd, T }) {
  const n = since(T, db.start) + 1, d = db.days[T] || { a: {}, care: {}, hard: 0, mood: 0, note: '' }
  const need = AN.filter(a => !d.hard || a[0] !== 'code')
  const care = d.mood && d.mood <= 2 ? 'Rough day is allowed. Eat something real, drink water, and text one person. The minimum is enough today.' : d.mood ? 'Good. Spend that energy on your first anchor.' : 'How are you, really? Tap one.'
  const ms = { 7: 'One week in.', 30: '30 days. Real change.', 100: 'Day 100.', 365: 'One year. Proud of you.' }[n]
  return (<>
    <h1>Day {n} of building me</h1>
    <p className="m">{streak(db, T)}-day streak{ms ? ' · ' + ms : ''} · one miss a week is forgiven</p>
    {need.map(([k, l, area]) => <div key={k} className={'a' + (d.a[k] ? ' on' : '')} onClick={() => upd(x => { const y = dayOf(x, T); y.a[k] = !y.a[k]; addXp(x, area, y.a[k] ? 10 : -10) })}><b>{d.a[k] ? '✓' : '○'}</b><span>{l}</span></div>)}
    <button className="g" onClick={() => upd(x => { const y = dayOf(x, T); y.hard = y.hard ? 0 : 1 })}>{d.hard ? 'Back to full day' : 'Hard day mode'}</button>
    <h2>How are you?</h2>
    <div className="r">{['😞', '😕', '😐', '🙂', '😄'].map((e, i) => <button key={e} className="g" onClick={() => upd(x => { dayOf(x, T).mood = i + 1 })}>{e}{d.mood === i + 1 ? ' ✓' : ''}</button>)}</div>
    <div className="c">{care}</div>
    <input placeholder="One line about today" defaultValue={d.note} onBlur={e => upd(x => { dayOf(x, T).note = e.target.value })} />
    <h2>Look after yourself</h2>
    {CARE.map(c => <div key={c} className={'a' + (d.care[c] ? ' on' : '')} onClick={() => upd(x => { const y = dayOf(x, T); y.care[c] = !y.care[c] })}><b>{d.care[c] ? '✓' : '○'}</b><span>{c}</span></div>)}
    <div className="c">{QUOTES[n % QUOTES.length]}<div className="m">Why: a comfortable life for Mum and Dad.</div></div>
    <h2>Life wheel</h2><Wheel db={db} />
    <div className="c"><b>Boss of the week</b><input placeholder="One big goal" defaultValue={db.boss} onBlur={e => upd(x => { x.boss = e.target.value })} />
      <button onClick={() => upd(x => { if (!x.boss) return; AREAS.forEach(a => addXp(x, a, 25)); x.wins.push('Beat the boss: ' + x.boss); x.boss = '' })}>Defeated (+25 XP each)</button></div>
  </>)
}

export function Body({ db, upd, T }) {
  const [f, setF] = useState({ e: '', w: '', r: '' }), [left, start] = useTimer(), [msg, setMsg] = useState('')
  const save = () => {
    const w = +f.w, r = +f.r; if (!f.e || !w || !r) return
    const prev = db.gym.filter(x => x.e.toLowerCase() === f.e.toLowerCase()), pr = prev.length > 0 && prev.every(x => w > x.w)
    upd(x => { x.gym.push({ e: f.e, w, r, d: T }); addXp(x, 'Body', pr ? 15 : 5) }); setMsg(pr ? 'New PR!' : 'Saved'); setF({ e: '', w: '', r: '' })
  }
  return (<>
    <h1>Body</h1><h2>Log a set</h2>
    <input placeholder="Exercise" value={f.e} onChange={e => setF({ ...f, e: e.target.value })} />
    <div className="r"><input type="number" placeholder="kg" value={f.w} onChange={e => setF({ ...f, w: e.target.value })} /><input type="number" placeholder="reps" value={f.r} onChange={e => setF({ ...f, r: e.target.value })} /></div>
    <button onClick={save}>Save set</button> <span className="m">{msg}</span>
    <div className="c">{db.gym.length ? db.gym.slice(-8).reverse().map((x, i) => <div key={i}>{x.e} · {x.w}kg x {x.r} <span className="m">{x.d}</span></div>) : <span className="m">No sets yet. The first one is the hardest.</span>}</div>
    <h2>Rest timer</h2><div className="c big">{fmt(left)}</div>
    {[60, 90, 120].map(s => <button key={s} onClick={() => start(s)}>{s}s</button>)}
    <h2>My split</h2><textarea placeholder="Mon push, Tue pull, Wed legs..." defaultValue={db.split} onBlur={e => upd(x => { x.split = e.target.value })} />
  </>)
}

export function Grow({ db, upd, T }) {
  const [left, start] = useTimer(), [e, setE] = useState({ a: '', n: '' })
  const tot = db.earn.reduce((s, x) => s + x.a, 0), p = Math.min(100, tot / (db.fund || 1) * 100)
  return (<>
    <h1>Grow</h1><h2>Study timer</h2><div className="c big">{fmt(left)}</div>
    <button onClick={() => start(1500, () => upd(x => addXp(x, 'School', 15)))}>25 min focus</button><button className="g" onClick={() => start(300)}>5 min break</button>
    <h2>Mum and Dad Fund</h2><div className="bar"><i style={{ width: p + '%' }} /></div>
    <p className="m">KES {tot} of <input type="number" className="inl" defaultValue={db.fund} onBlur={ev => upd(x => { x.fund = +ev.target.value || 1 })} /></p>
    <div className="r"><input type="number" placeholder="KES earned" value={e.a} onChange={ev => setE({ ...e, a: ev.target.value })} /><input placeholder="From what" value={e.n} onChange={ev => setE({ ...e, n: ev.target.value })} /></div>
    <button onClick={() => { if (!+e.a) return; upd(x => { x.earn.push({ a: +e.a, n: e.n, d: T }); addXp(x, 'Money', 20) }); setE({ a: '', n: '' }) }}>Log earning</button>
    <div className="c m">Ideas: websites for barbers, salons and shops; small HTML/CSS/JS gigs; maths or Computer Studies tutoring. Set your own prices.</div>
    <Deadlines db={db} upd={upd} T={T} /><Pipeline db={db} upd={upd} />
  </>)
}

export function Mind({ db, upd, T }) {
  const [left, start] = useTimer(), [s, setS] = useState({ f: '', a: '', r: '', c: '' })
  return (<>
    <h1>Mind</h1>
    <div className="c"><b>Want to check her page or reread a chat?</b><br /><button onClick={() => start(600)}>Wait 10 minutes</button>
      {left > 0 && <p>{fmt(left)}<br /><span className="m">Walk, shower, call Mum, code for 10 minutes. You already have what is useful from that page.</span></p>}</div>
    <div className="c">Days without checking: <b>{since(T, db.nocheck)}</b> <button className="g" onClick={() => upd(x => { x.nocheck = T })}>I checked</button></div>
    <h2>Spiral tool</h2>
    {[['f', 'Facts: what actually happened'], ['a', 'Assumptions: what I am guessing'], ['r', 'Fears: what I am scared of'], ['c', 'What I control right now']].map(([k, l]) => <textarea key={k} placeholder={l} value={s[k]} onChange={e => setS({ ...s, [k]: e.target.value })} />)}
    <button onClick={() => { upd(x => { x.spiral.push({ ...s, d: T }) }); setS({ f: '', a: '', r: '', c: '' }) }}>Save</button>
    {db.spiral.slice(-2).reverse().map((x, i) => <div key={i} className="c m">{x.d}<br />Facts: {x.f}<br />Control: {x.c}</div>)}
    <Letters db={db} upd={upd} T={T} /><Capsule db={db} upd={upd} T={T} />
  </>)
}

export function Me({ db, upd, T }) {
  const [un, setUn] = useState(false), [pw, setPw] = useState(''), [tx, setTx] = useState(''), [bl, setBl] = useState(''), [pick, setPick] = useState('')
  return (<>
    <h1>Me</h1><h2>Sealed vault</h2>
    {!db.vault ? <><input type="password" placeholder="Choose a password" value={pw} onChange={e => setPw(e.target.value)} /><textarea placeholder="Paste the message here" value={tx} onChange={e => setTx(e.target.value)} />
      <button onClick={() => { if (pw && tx) { upd(x => { x.vault = { h: hash(pw), t: tx } }); setPw(''); setTx('') } }}>Seal it</button></>
      : un ? <><div className="c pre">{db.vault.t}</div><button className="g" onClick={() => setUn(false)}>Lock again</button></>
      : <><input type="password" placeholder="Password" value={pw} onChange={e => setPw(e.target.value)} /><button onClick={() => { if (hash(pw) === db.vault.h) { setUn(true); setPw('') } else setPick('Wrong password') }}>Unlock</button></>}
    <p className="m">This hides it from casual opening. It is not strong encryption.</p>
    <h2>The story, told fairly</h2>
    <div className="c">There was real love: she called me her safe place, and I put real effort into her. There was also a loop: I felt unsure and asked for reassurance, she felt questioned, distance grew, I got more anxious. We had different paces with affection. Some things hurt me, like delayed replies and seeing her partying during the break, and I do not know what she felt privately. I made mistakes and so did she. Nobody is the villain. It ended kindly. I tried, I learned, I move forward for me.</div>
    <h2>What I need next time</h2>
    <div className="c">Steady communication. Feeling wanted. A pace we both like. Trust that does not need daily proof. Green flags: shows up, says what she feels, respects my effort, good with my family and faith.</div>
    <h2>Blessings jar</h2>
    <div className="r"><input placeholder="One thing I am grateful for" value={bl} onChange={e => setBl(e.target.value)} /><button onClick={() => { if (bl) { upd(x => { x.bless.push(bl); addXp(x, 'Faith', 10) }); setBl('') } }}>Add</button></div>
    <button className="g" onClick={() => db.bless.length && setPick(db.bless[Math.floor(Math.random() * db.bless.length)])}>Shake the jar</button>
    <div className="c m">{pick || db.bless.length + ' blessings saved'}</div>
    <h2>Wins</h2><WinAdd upd={upd} />{db.wins.slice(-5).reverse().map((w, i) => <div key={i} className="c">{w}</div>)}
    <Vision db={db} upd={upd} /><Family db={db} upd={upd} T={T} /><Review db={db} upd={upd} T={T} /><Backup db={db} upd={upd} />
  </>)
}
