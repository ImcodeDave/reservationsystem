import { useState, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import html2canvas from "html2canvas";
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
const ADMIN_PASSWORD = "202626";
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
    "01-01": "🎆 Nový rok — Nováček", "01-02": "Karina", "01-03": "Radmila",
    "01-04": "Diana", "01-05": "Dalimil", "01-06": "Kašpar",
    "01-07": "Vilma", "01-08": "Čestmír", "01-09": "Vladan",
    "01-10": "Břetislav", "01-11": "Bohdana", "01-12": "Pravoslav",
    "01-13": "Edita", "01-14": "Radovan", "01-15": "Alice",
    "01-16": "Ctirad", "01-17": "Drahoslav", "01-18": "Vladislav",
    "01-19": "Doubravka", "01-20": "Ilona", "01-21": "Běla",
    "01-22": "Slavomír", "01-23": "Zdeněk", "01-24": "Milena",
    "01-25": "Miloš", "01-26": "Zora", "01-27": "Ingrid",
    "01-28": "Otýlie", "01-29": "Zdislava", "01-30": "Robin",
    "01-31": "Marika",
    "02-01": "Hynek", "02-02": "Nela", "02-03": "Blažej",
    "02-04": "Jarmila", "02-05": "Dobromila", "02-06": "Vanda",
    "02-07": "Veronika", "02-08": "Milada", "02-09": "Apolena",
    "02-10": "Mojmír", "02-11": "Dezider", "02-12": "Slavěna",
    "02-13": "Věnceslava", "02-14": "❤️ Valentýn", "02-15": "Jiřina",
    "02-16": "Ljuba", "02-17": "Miloslava", "02-18": "Gizela",
    "02-19": "Patrik", "02-20": "Oldřich", "02-21": "Lenka",
    "02-22": "Petr", "02-23": "Svatopluk", "02-24": "Matěj",
    "02-25": "Liliana", "02-26": "Dorota", "02-27": "Alexandr",
    "02-28": "Lumír", "02-29": "Horymír",
    "03-01": "Albín", "03-02": "Anežka", "03-03": "Kamil",
    "03-04": "Stela", "03-05": "Kazimír", "03-06": "Miroslav",
    "03-07": "Tomáš", "03-08": "Gabriela", "03-09": "Františka",
    "03-10": "Viktorie", "03-11": "Anděla", "03-12": "Řehoř",
    "03-13": "Růžena", "03-14": "Rút", "03-15": "Ida",
    "03-16": "Elena", "03-17": "Vlastimil", "03-18": "Eduard",
    "03-19": "Josef", "03-20": "Světlana", "03-21": "Radek",
    "03-22": "Leona", "03-23": "Ivona", "03-24": "Gabriel",
    "03-25": "Marián", "03-26": "Emanuel", "03-27": "Dita",
    "03-28": "Soňa", "03-29": "Taťána", "03-30": "Arnošt",
    "03-31": "Kvido",
    "04-01": "Hugo", "04-02": "Erika", "04-03": "Richard",
    "04-04": "Ivana", "04-05": "Miroslava", "04-06": "Vendula",
    "04-07": "Heřman", "04-08": "Ema", "04-09": "Dušan",
    "04-10": "Darja", "04-11": "Izabela", "04-12": "Julius",
    "04-13": "Aleš", "04-14": "Vincenc", "04-15": "Anastázie",
    "04-16": "Irena", "04-17": "Rudolf", "04-18": "Valérie",
    "04-19": "Rostislav", "04-20": "Marcela", "04-21": "Alexandra",
    "04-22": "Evženie", "04-23": "Vojtěch", "04-24": "Jiří",
    "04-25": "Marek", "04-26": "Oto", "04-27": "Jaroslav",
    "04-28": "Vlastislav", "04-29": "Robert", "04-30": "🧹 Čarodějnice — Blahoslav",
    "05-01": "Svátek práce — Václav", "05-02": "Zikmund", "05-03": "Alexej",
    "05-04": "Květoslav", "05-05": "Klaudie", "05-06": "Radoslav",
    "05-07": "Stanislav", "05-08": "Den vítězství — Stanislava", "05-09": "Ctibor",
    "05-10": "Blažena", "05-11": "Svatava", "05-12": "Pankrác",
    "05-13": "Servác", "05-14": "Bonifác", "05-15": "Žofie",
    "05-16": "Přemysl", "05-17": "Aneta", "05-18": "Nataša",
    "05-19": "Ivo", "05-20": "Zbyšek", "05-21": "Monika",
    "05-22": "Emil", "05-23": "Vladimír", "05-24": "Jana",
    "05-25": "Viola", "05-26": "Filip", "05-27": "Valdemar",
    "05-28": "Vilém", "05-29": "Maxmilián", "05-30": "Ferdinand",
    "05-31": "Kamila",
    "06-01": "Laura", "06-02": "Jarmil", "06-03": "Tamara",
    "06-04": "Dalibor", "06-05": "Dobroslav", "06-06": "Norbert",
    "06-07": "Iveta", "06-08": "Medard", "06-09": "Stanislava",
    "06-10": "Gita", "06-11": "Bruno", "06-12": "Antonie",
    "06-13": "Antonín", "06-14": "Roland", "06-15": "Vít",
    "06-16": "Zbyněk", "06-17": "Adolf", "06-18": "Milan",
    "06-19": "Leoš", "06-20": "Květa", "06-21": "☀️ Letní slunovrat — Alois",
    "06-22": "Pavla", "06-23": "Zdeňka", "06-24": "Jan",
    "06-25": "Ivan", "06-26": "Adriana", "06-27": "Ladislav",
    "06-28": "Lubomír", "06-29": "Petr a Pavel", "06-30": "Šárka",
    "07-01": "Jaroslava", "07-02": "Patricie", "07-03": "Radomír",
    "07-04": "Prokop", "07-05": "Cyril a Metoděj", "07-06": "Jan Hus",
    "07-07": "Bohuslava", "07-08": "Nora", "07-09": "Drahomíra",
    "07-10": "Libuše", "07-11": "Olga", "07-12": "Bořek",
    "07-13": "Markéta", "07-14": "Karolína", "07-15": "Jindřich",
    "07-16": "Luboš", "07-17": "Martina", "07-18": "Drahomír",
    "07-19": "Čeněk", "07-20": "Ilja", "07-21": "Vítězslav",
    "07-22": "Magdaléna", "07-23": "Libor", "07-24": "Kristýna",
    "07-25": "Jakub", "07-26": "Anna", "07-27": "Věroslav",
    "07-28": "Viktor", "07-29": "Marta", "07-30": "Bořivoj",
    "07-31": "Ignác",
    "08-01": "Oskar", "08-02": "Gustav", "08-03": "Miluše",
    "08-04": "Dominik", "08-05": "Kristián", "08-06": "Oldřiška",
    "08-07": "Lada", "08-08": "Soběslav", "08-09": "Roman",
    "08-10": "Vavřinec", "08-11": "Zuzana", "08-12": "Klára",
    "08-13": "Alžběta", "08-14": "Arnošt", "08-15": "Hana",
    "08-16": "Jáchym", "08-17": "Petra", "08-18": "Helena",
    "08-19": "Ludvík", "08-20": "Bernard", "08-21": "Johana",
    "08-22": "Bohuslav", "08-23": "Sandra", "08-24": "Bartoloměj",
    "08-25": "Radim", "08-26": "Luděk", "08-27": "Otakar",
    "08-28": "Augustýn", "08-29": "Evelína", "08-30": "Vladěna",
    "08-31": "Pavlína",
    "09-01": "Linda", "09-02": "Adéla", "09-03": "Bronislav",
    "09-04": "Jindřiška", "09-05": "Boris", "09-06": "Boleslav",
    "09-07": "Regína", "09-08": "Mariana", "09-09": "Daniela",
    "09-10": "Irma", "09-11": "Denisa", "09-12": "Marie",
    "09-13": "Lubor", "09-14": "Radka", "09-15": "Jolana",
    "09-16": "Ludmila", "09-17": "Naděžda", "09-18": "Kryštof",
    "09-19": "Zita", "09-20": "Oleg", "09-21": "Matouš",
    "09-22": "Darina", "09-23": "Bořislava", "09-24": "Jaromír",
    "09-25": "Zlata", "09-26": "Andrea", "09-27": "Jonáš",
    "09-28": "Václav", "09-29": "Michal", "09-30": "Jeroným",
    "10-01": "Igor", "10-02": "Olivie", "10-03": "Bohumil",
    "10-04": "František", "10-05": "Eliška", "10-06": "Hanuš",
    "10-07": "Justýna", "10-08": "Věra", "10-09": "Štefan",
    "10-10": "Marina", "10-11": "Andrej", "10-12": "Marcel",
    "10-13": "Renáta", "10-14": "Agáta", "10-15": "Tereza",
    "10-16": "Havel", "10-17": "Hedvika", "10-18": "Lukáš",
    "10-19": "Michaela", "10-20": "Vendelín", "10-21": "Brigita",
    "10-22": "Sabina", "10-23": "Teodor", "10-24": "Sobeslav",
    "10-25": "Beáta", "10-26": "Erik", "10-27": "Šarlota",
    "10-28": "Den vzniku ČSR — Záviš", "10-29": "Silvie", "10-30": "Tadeáš",
    "10-31": "🎃 Halloween — Štěpánka",
    "11-01": "Felix", "11-02": "Dušičky — Bohdan", "11-03": "Hubert",
    "11-04": "Karel", "11-05": "Miriam", "11-06": "Liběna",
    "11-07": "Saskie", "11-08": "Bohumír", "11-09": "Bohdan",
    "11-10": "Evžen", "11-11": "Martin", "11-12": "Benedikt",
    "11-13": "Tibor", "11-14": "Sáva", "11-15": "Leopold",
    "11-16": "Otmar", "11-17": "Den boje za svobodu — Mahulena", "11-18": "Romana",
    "11-19": "Alžběta", "11-20": "Nikola", "11-21": "Albert",
    "11-22": "Cecílie", "11-23": "Klement", "11-24": "Emílie",
    "11-25": "Kateřina", "11-26": "Artur", "11-27": "Xenie",
    "11-28": "René", "11-29": "Zina", "11-30": "Ondřej",
    "12-01": "Iva", "12-02": "Blanka", "12-03": "Svatoslav",
    "12-04": "Barbora", "12-05": "Jitka", "12-06": "Mikuláš",
    "12-07": "Ambrož", "12-08": "Květoslava", "12-09": "Vratislav",
    "12-10": "Julie", "12-11": "Dana", "12-12": "Simona",
    "12-13": "Lucie", "12-14": "Lýdie", "12-15": "Radana",
    "12-16": "Albína", "12-17": "Daniel", "12-18": "Miloslav",
    "12-19": "Ester", "12-20": "Dagmar", "12-21": "❄️ Zimní slunovrat — Natálie",
    "12-22": "Šimon", "12-23": "Vlasta", "12-24": "🎄 Štědrý den — Adam a Eva",
    "12-25": "🎄 1. svátek vánoční — Božena", "12-26": "🎄 2. svátek vánoční — Štěpán",
    "12-27": "Žaneta", "12-28": "Bohumila", "12-29": "Judita",
    "12-30": "Davida", "12-31": "🎇 Silvestr — Silvester",
  };
  return jmeniny[dateStr.slice(5)] || null;
}

function getGreeting() {
  const h = new Date().getHours();
  if (h >= 6 && h < 11) return "Dobré ráno! ☀️";
  if (h >= 11 && h < 13) return "Dobré dopoledne!";
  if (h >= 13 && h < 18) return "Dobré odpoledne!";
  if (h >= 18 && h < 22) return "Dobrý večer!";
  return "Dobrou noc! 🌙";
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
  const [darkMode, setDarkMode] = useState(false);
  const [cancelModal, setCancelModal] = useState(false);
  const [cancelName, setCancelName] = useState("");
  const [passwordModal, setPasswordModal] = useState(null); // null | { action: fn, label: string }
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");
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
  setPasswordInput("");
  setPasswordError("");
  setPasswordModal({
    action: () => {
      setForm({ date: date || todayStr(), room_id: 1, start_time: "09:00", end_time: "10:00", name: "", people: "" });
      setModal({ mode: "new" });
    },
    label: "novou rezervaci"
  });
}
  function openEdit(res) {
  setError("");
  setForm({ ...res });
  setModal({ mode: "view" });
  }
  function startEdit() {
  setPasswordInput("");
  setPasswordError("");
  setPasswordModal({ action: () => setModal({ mode: "edit" }), label: "editaci" });
  }
  function startDelete() {
  setPasswordInput("");
  setPasswordError("");
  setPasswordModal({ action: remove, label: "smazání" });
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
  async function requestCancel() {
  if (!cancelName.trim()) return;
  const room = ROOMS.find(r => r.id === form.room_id);
  await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/cancel-request`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      name: cancelName.trim(),
      reservation: { ...form, room_name: room?.name },
    }),
  });
  setCancelModal(false);
  setCancelName("");
  setModal(null);
  alert("Žádost o zrušení byla odeslána.");
}
  function checkPassword() {
  if (passwordInput !== ADMIN_PASSWORD) {
    setPasswordError("Špatné heslo.");
    return;
  }
  const action = passwordModal.action;
  setPasswordModal(null);
  setPasswordInput("");
  setPasswordError("");
  action();
}
  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  }

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDow = (() => { let d = new Date(year, month, 1).getDay(); return d === 0 ? 6 : d - 1; })();
  const today = todayStr();

  const resForDay = (dateStr) =>
    reservations.filter(r => r.date === dateStr && visibleRooms[r.room_id]);

  return (
    <div className={`app${darkMode ? " dark" : ""}`}>
      <header className="app-header">
        <div className="header-left">
          <img src="/calendar.svg" alt="Zasedačky" style={{ height: "24px", width: "auto" }} />
          <span className="app-title">Zasedačky</span>
        </div>
        <button className="btn-add" onClick={() => openNew(null)}>
          <span>+</span> Nová rezervace
        </button>
        <button className="btn-cancel" onClick={exportPng}>📷 Export</button>
        <button className="btn-cancel" onClick={() => setDarkMode(d => !d)}>
          {darkMode ? "☀️" : "🌙"}
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

          <div className="sidebar-section">
            <p className="sidebar-label">Svátek</p>
            <p className="sidebar-stat" style={{ fontSize: "16px" }}>
              {getSvatek(today) || "—"}
            </p>
          </div>

          <div className="sidebar-section">
            <p className="sidebar-label">Nejbližší rezervace</p>
            {reservations
              .filter(r => r.date >= today)
              .slice(0, 5)
              .map(r => {
                const room = ROOMS.find(x => x.id === r.room_id);
                return (
                  <div key={r.id} className="upcoming-item" onClick={() => openEdit(r)}>
                    <span className="upcoming-dot" style={{ background: room?.color }} />
                    <div className="upcoming-info">
                      <span className="upcoming-name">{r.name}</span>
                      <span className="upcoming-time">{r.date === today ? "Dnes" : r.date.slice(5).replace("-", ".")} · {r.start_time.slice(0,5)}</span>
                    </div>
                  </div>
                );
              })}
            {reservations.filter(r => r.date >= today).length === 0 && (
              <p className="upcoming-empty">Žádné nadcházející rezervace</p>
            )}
          </div>

          <div className="sidebar-section">
            <p className="sidebar-greeting">{getGreeting()}</p>
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
                const dow = (firstDow + d - 1) % 7;
                const isWeekend = dow === 5 || dow === 6;
                const allRoomsBooked = ROOMS.every(room =>
                  reservations.some(r => r.date === dateStr && r.room_id === room.id)
                );
                return (
                  <div key={d}
                    className={`cal-cell${isToday ? " today" : ""}${allRoomsBooked ? " full" : ""}${isWeekend ? " weekend" : ""}`}
                    onClick={() => openNew(dateStr)}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => { e.preventDefault(); const id = parseInt(e.dataTransfer.getData("id")); moveReservation(id, dateStr); }}>
                    <div className={`day-num${isToday ? " today-num" : ""}`}>{d}</div>
                    {dayRes.map(r => {
                      const room = ROOMS.find(x => x.id === r.room_id);
                      return (
                        <div key={r.id} className="event"
                          style={{ background: room?.color + "12", borderLeft: `2px solid ${room?.color}` }}
                          draggable
                          onDragStart={e => { e.stopPropagation(); e.dataTransfer.setData("id", r.id); }}
                          onClick={e => { e.stopPropagation(); openEdit(r); }}>
                          <span className="event-time">{r.start_time.slice(0,5)}–{r.end_time.slice(0,5)}</span>
                          <span className="event-name">{r.name}</span>
                          {r.people && <span className="event-people">👤 {r.people}</span>}
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
        <h3>{modal.mode === "new" ? "Nova rezervace" : modal.mode === "edit" ? "Upravit rezervaci" : form.name}</h3>
        <button className="modal-close" onClick={() => setModal(null)}>x</button>
      </div>

      {modal.mode === "view" ? (
        <div className="modal-body">
          {(() => {
            const room = ROOMS.find(r => r.id === form.room_id);
            return (
              <>
                <div className="view-row"><span className="view-label">Mistnost</span><span className="view-value"><span style={{ background: room?.color, display: "inline-block", width: 8, height: 8, borderRadius: "50%", marginRight: 6 }} />{room?.name}</span></div>
                <div className="view-row"><span className="view-label">Datum</span><span className="view-value">{form.date}</span></div>
                <div className="view-row"><span className="view-label">Cas</span><span className="view-value">{form.start_time?.slice(0,5)}-{form.end_time?.slice(0,5)}</span></div>
                {form.people && <div className="view-row"><span className="view-label">Pocet osob</span><span className="view-value">{form.people}</span></div>}
              </>
            );
          })()}
          <div className="modal-footer" style={{ marginTop: "8px" }}>
            <button className="btn-request" onClick={() => setCancelModal(true)}>Zažádat o zrušení</button>
            <div style={{ flex: 1 }} />
            <button className="btn-cancel" onClick={startDelete}>Smazat</button>
            <button className="btn-save" onClick={startEdit}>Upravit</button>
          </div>
        </div>
      ) : (
        <>
          <div className="modal-body">
            <div className="field">
              <label>Datum</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            </div>
            <div className="field">
              <label>Mistnost</label>
              <select value={form.room_id} onChange={e => setForm(f => ({ ...f, room_id: parseInt(e.target.value) }))}>
                {ROOMS.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            <div className="field field-row">
              <div>
                <label>Od</label>
                <input type="time" value={form.start_time} onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))} />
              </div>
              <div>
                <label>Do</label>
                <input type="time" value={form.end_time} onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))} />
              </div>
            </div>
            <div className="field">
              <label>Jmeno / nazev</label>
              <input type="text" placeholder="Kdo nebo co..." value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                onKeyDown={e => e.key === "Enter" && save()} autoFocus />
            </div>
            <div className="field">
              <label>Pocet osob</label>
              <input type="number" min="1" max="50" placeholder="Kolik lidi..." value={form.people}
                onChange={e => setForm(f => ({ ...f, people: e.target.value }))} />
            </div>
            {error && <p className="form-error">{error}</p>}
          </div>
          <div className="modal-footer">
            {modal.mode === "edit" && <button className="btn-delete" onClick={remove}>Smazat</button>}
            <div style={{ flex: 1 }} />
            <button className="btn-cancel" onClick={() => setModal(null)}>Zrusit</button>
            <button className="btn-save" onClick={save} disabled={saving}>{saving ? "Ukladam..." : "Ulozit"}</button>
          </div>
        </>
      )}
    </div>
  </div>
)}
      {passwordModal && (
  <div className="modal-overlay" onClick={() => setPasswordModal(null)}>
    <div className="modal" onClick={e => e.stopPropagation()}>
      <div className="modal-header">
        <h3>Zadej heslo</h3>
        <button className="modal-close" onClick={() => setPasswordModal(null)}>x</button>
      </div>
      <div className="modal-body">
        <div className="field">
          <label>Heslo pro {passwordModal.label}</label>
          <input type="password" placeholder="Heslo..." value={passwordInput}
            onChange={e => setPasswordInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && checkPassword()}
            autoFocus />
        </div>
        {passwordError && <p className="form-error">{passwordError}</p>}
      </div>
      <div className="modal-footer">
        <div style={{ flex: 1 }} />
        <button className="btn-cancel" onClick={() => setPasswordModal(null)}>Zrušit</button>
        <button className="btn-save" onClick={checkPassword}>Potvrdit</button>
      </div>
    </div>
  </div>
)}
      {cancelModal && (
  <div className="modal-overlay" onClick={() => setCancelModal(false)}>
    <div className="modal" onClick={e => e.stopPropagation()}>
      <div className="modal-header">
        <h3>Zažádat o zrušení</h3>
        <button className="modal-close" onClick={() => setCancelModal(false)}>x</button>
      </div>
      <div className="modal-body">
        <div className="field">
          <label>Vaše jméno</label>
          <input type="text" placeholder="Zadej své jméno..." value={cancelName}
            onChange={e => setCancelName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && requestCancel()}
            autoFocus />
        </div>
      </div>
      <div className="modal-footer">
        <div style={{ flex: 1 }} />
        <button className="btn-cancel" onClick={() => setCancelModal(false)}>Zrušit</button>
        <button className="btn-save" onClick={requestCancel}>Odeslat žádost</button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}
