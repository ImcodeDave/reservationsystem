import { useState, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import html2canvas from "html2canvas";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
const ADMIN_PASSWORD = "Perinvest";
const ROOMS = [
  { id: 1, name: "ALL STARS (lounge)", color: "#6366f1" },
  { id: 2, name: "CENTRE COURT (lounge)", color: "#22c55e" },
  { id: 3, name: "ICEDEN (2np)", color: "#f59e0b" },
];

const MONTHS = ["Leden","Únor","Březen","Duben","Květen","Červen",
  "Červenec","Srpen","Září","Říjen","Listopad","Prosinec"];
const DAYS = ["Po","Út","St","Čt","Pá","So","Ne"];

function pad(n) { return String(n).padStart(2, "0"); }
function toDateStr(y, m, d) { return `${y}-${pad(m+1)}-${pad(d)}`; }
function todayStr() {
  const n = new Date();
  return toDateStr(n.getFullYear(), n.getMonth(), n.getDate());
}

function getSvatek(dateStr) {
  const jmeniny = {
    "01-01": "🎆 Nový rok", "01-15": "Alice", "01-23": "Zdeněk",
    "02-14": "❤️ Valentýn", "03-19": "Josef", "04-23": "Vojtěch",
    "04-24": "Jiří", "05-08": "Den vítězství", "06-29": "Petr a Pavel",
    "07-05": "Cyril a Metoděj", "07-06": "Jan Hus", "09-28": "Václav",
    "10-28": "Den vzniku ČSR", "10-31": "🎃 Halloween",
    "11-17": "Den boje za svobodu", "12-24": "🎄 Štědrý den",
    "12-25": "🎄 1. svátek vánoční", "12-26": "🎄 2. svátek vánoční",
    "12-31": "🎇 Silvestr",
  };
  return jmeniny[dateStr.slice(5)] || null;
}

export default function App() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [visibleRooms, setVisibleRooms] = useState({ 1: true, 2: true, 3: true });

  const fetchReservations = useCallback(async () => {
    setLoading(true);
    const from = `${year}-${pad(month+1)}-01`;
    const to = `${year}-${pad(month+1)}-${new Date(year, month+1, 0).getDate()}`;
    const { data, error } = await supabase
      .from("reservations")
      .select("*")
      .gte("date", from)
      .lte("date", to)
      .order("date")
      .order("start_time");
    if (!error) setReservations(data || []);
    setLoading(false);
  }, [year, month]);

  useEffect(() => { fetchReservations(); }, [fetchReservations]);

  function openNew(date) {
    setError("");
    const pw = prompt("Zadej heslo:");
    if (pw !== ADMIN_PASSWORD) {
      if (pw !== null) alert("Špatné heslo.");
      return;
    }
    setForm({ date: date || todayStr(), room_id: 1, start_time: "09:00", end_time: "10:00", name: "", people: "" });
    setModal({ mode: "new" });
  }

  function openEdit(res) {
    setError("");
    const pw = prompt("Zadej heslo pro editaci:");
    if (pw !== ADMIN_PASSWORD) {
      if (pw !== null) alert("Špatné heslo.");
      return;
    }
    setForm({ ...res });
    setModal({ mode: "edit" });
  }

  async function moveReservation(id, newDate) {
    await supabase.from("reservations").update({ date: newDate }).eq("id", id);
    fetchReservations();
  }

  async function exportPng() {
    const el = document.querySelector(".cal-grid-wrap");
    const canvas = await html2canvas(el, { scale: 2 });
    const link = document.createElement("a");
    link.download = `zasedacky-${MONTHS[month]}-${year}.png`;
    link.href = canvas.toDataURL();
    link.click();
  }

  async function save() {
    if (!form.name?.trim()) { setError("Zadej jméno nebo název akce."); return; }
    if (form.start_time >= form.end_time) { setError("Konec musí být po začátku."); return; }

    const conflict = reservations.find(r =>
      r.id !== form.id &&
      r.room_id === form.room_id &&
      r.date === form.date &&
      r.start_time < form.end_time &&
      r.end_time > form.start_time
    );
    if (conflict) { setError(`Kolize s „${conflict.name}" (${conflict.start_time}–${conflict.end_time})`); return; }

    setSaving(true);
    setError("");
    if (modal.mode === "new") {
      const { error } = await supabase.from("reservations").insert([{
        date: form.date, room_id: form.room_id,
        start_time: form.start_time, end_time: form.end_time,
        name: form.name.trim(),
        people: form.people ? parseInt(form.people) : null,
      }]);
      if (error) { setError("Chyba při ukládání."); setSaving(false); return; }
    } else {
      const { error } = await supabase.from("reservations").update({
        date: form.date, room_id: form.room_id,
        start_time: form.start_time, end_time: form.end_time,
        name: form.name.trim(),
        people: form.people ? parseInt(form.people) : null,
      }).eq("id", form.id);
      if (error) { setError("Chyba při ukládání."); setSaving(false); return; }
    }
    setSaving(false);
    setModal(null);
    fetchReservations();
  }

  async function remove() {
    if (!confirm(`Smazat rezervaci „${form.name}"?`)) return;
    await supabase.from("reservations").delete().eq("id", form.id);
    setModal(null);
    fetchReservations();
  }

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  }

  function goToday() {
    setYear(now.getFullYear());
    setMonth(now.getMonth());
  }

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDow = (() => { let d = new Date(year, month, 1).getDay(); return d === 0 ? 6 : d - 1; })();
  const today = todayStr();
  const totalCells = Math.ceil((firstDow + daysInMonth) / 7) * 7;

  const resForDay = (dateStr) =>
    reservations.filter(r => r.date === dateStr && visibleRooms[r.room_id]);

  return (
    <div className="app">
      {/* ── Top bar ── */}
      <header className="app-header">
        <div className="header-left">
            <img src="/calendar.svg" alt="Zasedačky" style={{ height: "20px", width: "auto", opacity: 0.7 }} />
            <span className="app-title">Zasedačky</span>
        </div>

        <div className="header-center">
          {ROOMS.map(r => (
            <button
              key={r.id}
              className={`room-pill${visibleRooms[r.id] ? " active" : ""}`}
              onClick={() => setVisibleRooms(v => ({ ...v, [r.id]: !v[r.id] }))}
            >
              <span className="room-pill-dot" style={{ background: r.color }} />
              {r.name}
            </button>
          ))}
        </div>

        <div className="header-right">
            <button className="btn-export" onClick={exportPng}>📷</button>
            <button className="btn-add" onClick={() => openNew(null)}>+ Nová rezervace</button>
        </div>
      </header>

      {/* ── Calendar ── */}
      <main className="cal-main">
        <div className="cal-month-label">
          <div className="cal-month-label-left">
            <h2>{MONTHS[month]} {year}</h2>
            {getSvatek(today) && <span className="svatek-badge">{getSvatek(today)}</span>}
          </div>
          <div className="cal-month-label-right">
            <span className="header-count">{reservations.length} rezervací</span>
            <button className="btn-today" onClick={goToday}>Dnes</button>
            <div className="nav-group">
              <button className="nav-btn" onClick={prevMonth}>←</button>
              <button className="nav-btn" onClick={nextMonth}>→</button>
            </div>
          </div>
        </div>

        <div className="cal-grid-wrap">
          {loading && <div className="cal-loading">Načítám…</div>}

          {/* Head */}
          <div className="cal-head">
            {DAYS.map(d => <div key={d} className="cal-head-cell">{d}</div>)}
          </div>

          {/* Grid */}
          <div className="cal-grid">
            {Array.from({ length: totalCells }, (_, i) => {
              const dayNum = i - firstDow + 1;
              const isCurrentMonth = dayNum >= 1 && dayNum <= daysInMonth;
              const dateStr = isCurrentMonth ? toDateStr(year, month, dayNum) : null;
              const dayRes = dateStr ? resForDay(dateStr) : [];
              const isToday = dateStr === today;
              const dow = i % 7;
              const isWeekend = dow === 5 || dow === 6;

              // compute label for prev/next month days
              let label = "";
              if (!isCurrentMonth) {
                if (dayNum < 1) {
                  const prevTotal = new Date(year, month, 0).getDate();
                  label = prevTotal + dayNum;
                } else {
                  label = dayNum - daysInMonth;
                }
              } else {
                label = dayNum;
              }

              return (
                <div
                  key={i}
                  className={`cal-cell${isToday ? " today" : ""}${isWeekend ? " weekend" : ""}${!isCurrentMonth ? " other-month" : ""}`}
                  onClick={() => isCurrentMonth && openNew(dateStr)}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => {
                    e.preventDefault();
                    if (!isCurrentMonth) return;
                    const id = parseInt(e.dataTransfer.getData("id"));
                    moveReservation(id, dateStr);
                  }}
                >
                  <div className={`day-num${isToday ? " today-num" : ""}`}>{label}</div>
                  <div className="day-events">
                    {dayRes.map(r => {
                      const room = ROOMS.find(x => x.id === r.room_id);
                      return (
                        <div
                          key={r.id}
                          className="event"
                          draggable
                          onDragStart={e => { e.stopPropagation(); e.dataTransfer.setData("id", r.id); }}
                          onClick={e => { e.stopPropagation(); openEdit(r); }}
                        >
                          <div className="event-top">
                            <span className="event-dot" style={{ background: room?.color }} />
                            <span className="event-name">{r.name}</span>
                          </div>
                          <div className="event-time">
                            🕐 {r.start_time.slice(0,5)}–{r.end_time.slice(0,5)}
                            {r.people ? ` · 👤 ${r.people}` : ""}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* ── Modal ── */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{modal.mode === "new" ? "Nová rezervace" : "Upravit rezervaci"}</h3>
              <button className="modal-close" onClick={() => setModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="field">
                <label>Datum</label>
                <input type="date" value={form.date}
                  onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
              </div>
              <div className="field">
                <label>Místnost</label>
                <select value={form.room_id}
                  onChange={e => setForm(f => ({ ...f, room_id: parseInt(e.target.value) }))}>
                  {ROOMS.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
              <div className="field field-row">
                <div>
                  <label>Od</label>
                  <input type="time" value={form.start_time}
                    onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))} />
                </div>
                <div>
                  <label>Do</label>
                  <input type="time" value={form.end_time}
                    onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))} />
                </div>
              </div>
              <div className="field">
                <label>Jméno / název</label>
                <input type="text" placeholder="Kdo nebo co…" value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  onKeyDown={e => e.key === "Enter" && save()} autoFocus />
              </div>
              <div className="field">
                <label>Počet osob</label>
                <input type="number" min="1" max="50" placeholder="Kolik lidí…" value={form.people}
                  onChange={e => setForm(f => ({ ...f, people: e.target.value }))} />
              </div>
              {error && <p className="form-error">{error}</p>}
            </div>
            <div className="modal-footer">
              {modal.mode === "edit" && (
                <button className="btn-delete" onClick={remove}>Smazat</button>
              )}
              <div style={{ flex: 1 }} />
              <button className="btn-cancel" onClick={() => setModal(null)}>Zrušit</button>
              <button className="btn-save" onClick={save} disabled={saving}>
                {saving ? "Ukládám…" : "Uložit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
