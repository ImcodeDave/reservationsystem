import { useState, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import { Analytics } from "@vercel/analytics/react";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const ROOMS = [
  { id: 1, name: "Zasedačka Lounge 1", color: "#1a1a1a" },
  { id: 2, name: "Zasedačka Lounge 2", color: "#555" },
  { id: 3, name: "Zasedačka 2np", color: "#999" },
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

export default function App() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | { mode: "new"|"edit", data }
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
    setForm({ date: date || todayStr(), room_id: 1, start_time: "09:00", end_time: "10:00", name: "" });
    setModal({ mode: "new" });
  }

  function openEdit(res) {
    setError("");
    setForm({ ...res });
    setModal({ mode: "edit" });
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
      }]);
      if (error) { setError("Chyba při ukládání."); setSaving(false); return; }
    } else {
      const { error } = await supabase.from("reservations").update({
        date: form.date, room_id: form.room_id,
        start_time: form.start_time, end_time: form.end_time,
        name: form.name.trim(),
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

  // Build calendar grid
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDow = (() => { let d = new Date(year, month, 1).getDay(); return d === 0 ? 6 : d - 1; })();
  const today = todayStr();

  const resForDay = (dateStr) =>
    reservations.filter(r => r.date === dateStr && visibleRooms[r.room_id]);

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <div className="logo">⬛</div>
          <span className="app-title">Zasedačky</span>
        </div>
        <button className="btn-add" onClick={() => openNew(null)}>
          <span>+</span> Nová rezervace
        </button>
      </header>

      <main className="main">
        <div className="sidebar">
          <div className="sidebar-section">
            <p className="sidebar-label">Místnosti</p>
            {ROOMS.map(r => (
              <label key={r.id} className="room-toggle">
                <input type="checkbox" checked={visibleRooms[r.id]}
                  onChange={() => setVisibleRooms(v => ({ ...v, [r.id]: !v[r.id] }))} />
                <span className="room-dot" style={{ background: r.color }} />
                <span className="room-name">{r.name}</span>
              </label>
            ))}
          </div>

          <div className="sidebar-section">
            <p className="sidebar-label">Tento měsíc</p>
            <p className="sidebar-stat">{reservations.length} rezervací</p>
          </div>
        </div>

        <div className="calendar-area">
          <div className="cal-nav">
            <button className="nav-btn" onClick={prevMonth}>←</button>
            <h2 className="cal-title">{MONTHS[month]} {year}</h2>
            <button className="nav-btn" onClick={nextMonth}>→</button>
          </div>

          <div className="cal-grid-wrap">
            {loading && <div className="cal-loading">Načítám…</div>}
            <div className="cal-head">
              {DAYS.map(d => <div key={d} className="cal-head-cell">{d}</div>)}
            </div>
            <div className="cal-grid">
              {Array.from({ length: firstDow }).map((_, i) => (
                <div key={`e${i}`} className="cal-cell empty" />
              ))}
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => {
                const dateStr = toDateStr(year, month, d);
                const dayRes = resForDay(dateStr);
                const isToday = dateStr === today;
                return (
                  <div key={d} className={`cal-cell${isToday ? " today" : ""}`}
                    onClick={() => openNew(dateStr)}>
                    <div className={`day-num${isToday ? " today-num" : ""}`}>{d}</div>
                    {dayRes.map(r => {
                      const room = ROOMS.find(x => x.id === r.room_id);
                      return (
                        <div key={r.id} className="event"
                          style={{ background: room?.color + "12", borderLeft: `2px solid ${room?.color}` }}
                          onClick={e => { e.stopPropagation(); openEdit(r); }}>
                          <span className="event-time">{r.start_time}</span>
                          <span className="event-name">{r.name}</span>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

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
      <Analytics />
    </div>
  );
}
