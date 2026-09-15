import { useEffect, useState } from "react";
import logo from "../assets/logo.jpg";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const DAY_SHORT = { Monday: "Mon", Tuesday: "Tue", Wednesday: "Wed", Thursday: "Thu", Friday: "Fri" };

const ink = "#223A2E";
const cream = "#F6F2E7";
const moss = "#5C7A56";
const gold = "#C98A2C";
const line = "#DAD2BC";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";

const styles = `
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes popIn {
  0% { transform: scale(0.85); opacity: 0; }
  70% { transform: scale(1.03); opacity: 1; }
  100% { transform: scale(1); }
}
@keyframes toastSlide {
  from { opacity: 0; transform: translate(-50%, 10px); }
  to { opacity: 1; transform: translate(-50%, 0); }
}
.sd-menu-in { animation: fadeInUp 0.55s ease both; }
.sd-dish-in { animation: fadeInUp 0.45s ease both; }
.sd-dish-in:nth-of-type(1) { animation-delay: 0.05s; }
.sd-dish-in:nth-of-type(3) { animation-delay: 0.18s; }
.sd-day-tab { transition: color 0.2s ease; position: relative; }
.sd-day-tab .underline {
  position: absolute; left: 0; right: 0; bottom: -1px; height: 2px;
  background: ${gold}; transform: scaleX(0); transform-origin: left;
  transition: transform 0.25s ease;
}
.sd-day-tab.active .underline { transform: scaleX(1); }
.sd-day-tab:hover { color: ${ink}; }
.sd-add-btn { transition: transform 0.15s ease, box-shadow 0.15s ease; }
.sd-add-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 10px rgba(34,58,46,0.25); }
.sd-add-btn:active { transform: translateY(0) scale(0.96); }
.sd-portion-btn { transition: background-color 0.15s ease, color 0.15s ease; }
.sd-toast { animation: popIn 0.3s ease, toastSlide 0.3s ease; }
`;

function scaleValue(val, factor) {
  if (val === undefined || val === null) return val;
  if (typeof val === "number") return Math.round(val * factor);
  const match = String(val).match(/^([\d.]+)(.*)$/);
  if (!match) return val;
  return `${Math.round(parseFloat(match[1]) * factor)}${match[2]}`;
}

function FactRow({ item, servings }) {
  const entries =
    item.type !== "Soup"
      ? [
          ["Cal", scaleValue(item.calories, servings)],
          ["Protein", scaleValue(item.protein, servings)],
          ["Fat", scaleValue(item.fat, servings)],
          ["Fiber", scaleValue(item.fiber, servings)],
          ["Carbs", scaleValue(item.carbs, servings)],
        ]
      : [
          ["Cal", scaleValue(item.calories, servings)],
          // Glycemic Index is a property of the food itself, not the amount — it does not scale.
          ["Glycemic Index", item.glycemicIndex],
        ];
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-1 mt-4 pt-4" style={{ borderTop: `1px solid ${line}` }}>
      {entries.map(([label, val]) => (
        <div key={label} className="text-xs" style={{ color: moss }}>
          <span className="font-medium" style={{ color: ink }}>{val}</span> {label}
        </div>
      ))}
    </div>
  );
}

function Dish({ item, onAdd }) {
  const [servings, setServings] = useState(1);
  if (!item) return <div className="flex-1" />;

  const price = servings === 1 ? item.pricePerPortion : item.pricePerTwoPortions;

  return (
    <div className="flex-1 min-w-0 sd-dish-in">
      <h3 className="text-2xl leading-snug" style={{ fontFamily: "Georgia, 'Times New Roman', serif", color: ink }}>
        {item.name}
      </h3>
      {item.dressing && (
        <p className="text-sm mt-1 italic" style={{ color: moss }}>{item.dressing}</p>
      )}
      <p className="text-sm leading-relaxed mt-3" style={{ color: "#4A4438" }}>{item.description}</p>
      <FactRow item={item} servings={servings} />

      <div className="flex items-center gap-4 mt-4">
        <div>
          <div className="text-xs mb-1" style={{ color: moss }}>Serving size</div>
          <div className="flex" style={{ border: `1px solid ${line}`, borderRadius: 4, overflow: "hidden" }}>
            {[1, 2].map((s) => (
              <button
                key={s}
                onClick={() => setServings(s)}
                className="px-3 py-1.5 text-sm sd-portion-btn"
                style={{
                  backgroundColor: servings === s ? ink : "transparent",
                  color: servings === s ? cream : ink,
                }}
              >
                {s === 1 ? "1 serving" : "2 servings"}
              </button>
            ))}
          </div>
        </div>
        <span className="text-lg font-semibold" style={{ color: gold }}>₹{price}</span>
        <button
          onClick={() => onAdd(item, servings, price)}
          className="text-sm px-4 py-1.5 ml-auto sd-add-btn"
          style={{ backgroundColor: ink, color: cream, borderRadius: 4 }}
        >
          Add
        </button>
      </div>
    </div>
  );
}

export default function WeeklyMenu({ onAdd }) {
  const [menu, setMenu] = useState([]);
  const [active, setActive] = useState(0);
  const [status, setStatus] = useState("loading");
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/menu`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load menu");
        return res.json();
      })
      .then((data) => {
        setMenu(data);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 1800);
    return () => clearTimeout(t);
  }, [toast]);

  function handleAdd(item, portions, price) {
    onAdd(item, portions, price);
    setToast(`${item.name} added — ${portions === 1 ? "1 serving" : "2 servings"}`);
  }

  const day = DAYS[active];
  const salad = menu.find((m) => m.day === day && (m.type === "Salad" || m.type === "Bowl"));
  const soup = menu.find((m) => m.day === day && m.type === "Soup");

  return (
    <div id="menu-section" className="w-full min-h-full relative" style={{ backgroundColor: cream, overflowX: "hidden" }}>
      <style>{styles}</style>
      <div className="max-w-3xl mx-auto px-6 py-14 sd-menu-in">
        <div className="mb-10">
          <img
            src={logo}
            alt="Bol Proteinis"
            className="sd-menu-in"
            style={{ width: "100%", maxWidth: 320, height: "auto", display: "block" }}
          />
          <p className="text-sm mt-3 max-w-md leading-relaxed" style={{ color: moss }}>
            Protein bowls, salads, smoothies and sandwiches, hand delivered to your door. This week's menu.
          </p>
        </div>

        <div className="flex justify-between sm:justify-start gap-0 sm:gap-6 mb-2" style={{ borderBottom: `1px solid ${line}` }}>
          {DAYS.map((d, i) => (
            <button
              key={d}
              onClick={() => setActive(i)}
              className={`sd-day-tab pb-3 text-xs sm:text-sm flex-1 sm:flex-initial ${active === i ? "active" : ""}`}
              style={{ color: active === i ? ink : moss, fontWeight: active === i ? 600 : 400 }}
            >
              <span className="hidden sm:inline">{d}</span>
              <span className="sm:hidden">{DAY_SHORT[d]}</span>
              <span className="underline" />
            </button>
          ))}
        </div>

        {status === "loading" && (
          <p className="text-sm mt-10" style={{ color: moss }}>Loading this week's menu…</p>
        )}
        {status === "error" && (
          <p className="text-sm mt-10" style={{ color: "#B3441E" }}>
            Couldn't reach the menu right now. Is the backend running on {API_BASE}?
          </p>
        )}
        {status === "ready" && (
          <div key={active} className="flex flex-col sm:flex-row gap-10 mt-10">
            <Dish item={salad} onAdd={handleAdd} />
            <div className="hidden sm:block w-px" style={{ backgroundColor: line }} />
            <Dish item={soup} onAdd={handleAdd} />
          </div>
        )}
      </div>

      {toast && (
        <div
          className="sd-toast fixed bottom-6 left-1/2 text-sm px-4 py-2"
          style={{ backgroundColor: ink, color: cream, borderRadius: 6, zIndex: 50 }}
        >
          {toast} ✓
        </div>
      )}
    </div>
  );
}
