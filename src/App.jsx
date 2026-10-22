import { useState, useRef, useEffect } from "react";
import { PORTRAITS } from "./data/portraits";
import { ELEMENT_ICONS } from "./data/elementIcons";
import { DPR_DATA } from "./data/dprData";
import {
  MAIN_DPS,
  SUB_DPS,
  ROSTER_ORDER,
  DOUBLE_USABLE,
  PHRO_NAMES,
  CHARACTERS_BASE,
} from "./data/roster";

const ELEMENT_COLORS = {
  Glacio: "#67e8f9",
  Fusion: "#fb923c",
  Electro: "#c084fc",
  Aero: "#86efac",
  Spectro: "#fde68a",
  Havoc: "#f87171",
};

const TEAM_COUNT = 20;

function roleOf(name) {
  if (MAIN_DPS.includes(name)) return "main_dps";
  if (SUB_DPS.includes(name)) return "sub_dps";
  return "support";
}

const CHARACTERS = CHARACTERS_BASE.map((c) => ({ ...c, role: roleOf(c.name) })).sort(
  (a, b) => {
    const ia = ROSTER_ORDER.indexOf(a.name);
    const ib = ROSTER_ORDER.indexOf(b.name);
    if (ia < 0 && ib < 0) return a.name.localeCompare(b.name);
    if (ia < 0) return 1;
    if (ib < 0) return -1;
    return ia - ib;
  }
);

function formatDPR(n) {
  if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return String(n);
}

function initials(name) {
  if (name.startsWith("Rover:")) return "R";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function dprForSlots(slots) {
  const filled = slots.filter(Boolean);
  if (filled.length !== 3) return null;
  const key = filled.map((c) => c.name).sort().join("|");
  return DPR_DATA[key] || null;
}

function emptyTeams() {
  return Array.from({ length: TEAM_COUNT }, (_, i) => ({
    id: i,
    name: `Team ${i + 1}`,
    slots: [null, null, null],
  }));
}

function serializeTeams(teams) {
  return teams.map((t) => ({
    id: t.id,
    name: t.name,
    slots: t.slots.map((s) => (s ? s.name : null)),
  }));
}

function deserializeTeams(saved) {
  return saved.map((t, i) => ({
    id: t.id ?? i,
    name: t.name ?? `Team ${i + 1}`,
    slots: t.slots.map((n) => (n && CHARACTERS.find((c) => c.name === n)) || null),
  }));
}

function Portrait({ char, size = 64, faded = false }) {
  const img = PORTRAITS[char.name];
  const elIcon = ELEMENT_ICONS[char.element];
  const color = ELEMENT_COLORS[char.element] || "#94a3b8";
  const badgeSize = size < 50 ? 12 : 16;
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 8,
        overflow: "hidden",
        position: "relative",
        flexShrink: 0,
        opacity: faded ? 0.3 : 1,
        background: img ? "transparent" : `linear-gradient(135deg,${color}33,#0d1a2e)`,
      }}
    >
      {img ? (
        <img
          src={img}
          alt={char.name}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "50% 15%",
            display: "block",
          }}
          draggable={false}
        />
      ) : (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: size * 0.3,
            fontWeight: 700,
            color,
            fontFamily: "'Cinzel',serif",
          }}
        >
          {initials(char.name)}
        </div>
      )}
      {elIcon && (
        <div
          style={{
            position: "absolute",
            bottom: 1,
            right: 1,
            width: badgeSize,
            height: badgeSize,
            borderRadius: 3,
            overflow: "hidden",
            background: "rgba(0,0,0,0.5)",
          }}
        >
          <img
            src={elIcon}
            alt={char.element}
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
            draggable={false}
          />
        </div>
      )}
      {char.stars === 5 && (
        <div
          style={{
            position: "absolute",
            top: 1,
            left: 2,
            fontSize: size < 50 ? 6 : 8,
            color: "#fbbf24",
            lineHeight: 1,
            textShadow: "0 0 4px rgba(0,0,0,0.8)",
          }}
        >
          ★
        </div>
      )}
    </div>
  );
}

function PhroButton({ slots }) {
  const [copied, setCopied] = useState(false);
  const filled = slots.filter(Boolean);

  function go() {
    const lines = filled.map((c, i) => {
      const slug = PHRO_NAMES[c.name] || c.name.toLowerCase().replace(/[^a-z0-9()]/g, "");
      return `${i + 1}P: ${slug}`;
    });
    navigator.clipboard.writeText(lines.join("  ")).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
    window.open("https://phro.love/team-simulator?lang=en", "_blank");
  }

  return (
    <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid rgba(13,185,215,0.08)" }}>
      <button
        onClick={go}
        style={{
          width: "100%",
          padding: "6px 0",
          borderRadius: 6,
          cursor: "pointer",
          background: copied ? "rgba(74,222,128,0.08)" : "rgba(13,185,215,0.05)",
          border: `1px solid ${copied ? "rgba(74,222,128,0.4)" : "rgba(13,185,215,0.15)"}`,
          color: copied ? "#4ade80" : "rgba(13,185,215,0.7)",
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: "0.1em",
          fontFamily: "'Rajdhani',sans-serif",
          transition: "all 0.2s",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
        }}
      >
        <span>
          {copied ? "✓ COPIED — PASTE IN SIMULATOR" : "Sheet has no data for this team — Simulate on phro.love"}
        </span>
      </button>
      {copied && (
        <div style={{ marginTop: 4, display: "flex", gap: 4 }}>
          {filled.map((c, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                textAlign: "center",
                background: "rgba(6,11,20,0.8)",
                borderRadius: 5,
                padding: "3px 4px",
                border: "1px solid rgba(13,185,215,0.1)",
              }}
            >
              <div style={{ fontSize: 6.5, color: "rgba(13,185,215,0.4)", fontFamily: "'Rajdhani',sans-serif" }}>
                {i + 1}P
              </div>
              <div
                style={{
                  fontSize: 8,
                  fontWeight: 700,
                  color: "#0DB9D7",
                  fontFamily: "'Rajdhani',sans-serif",
                  wordBreak: "break-all",
                }}
              >
                {PHRO_NAMES[c.name] || c.name.toLowerCase()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DPRRow({ slots }) {
  const filled = slots.filter(Boolean);
  const dpr = dprForSlots(slots);
  if (filled.length === 3 && !dpr) return <PhroButton slots={slots} />;
  if (!dpr) return null;
  return (
    <div
      style={{
        marginTop: 8,
        paddingTop: 8,
        borderTop: "1px solid rgba(13,185,215,0.1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span
          style={{
            fontSize: 7,
            color: "rgba(201,168,76,0.5)",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            fontFamily: "'Rajdhani',sans-serif",
          }}
        >
          DPR
        </span>
        <span style={{ fontSize: 18, fontWeight: 700, color: "#C9A84C", fontFamily: "'Rajdhani',sans-serif" }}>
          {formatDPR(dpr)}
        </span>
      </div>
      <span
        style={{
          fontSize: 7,
          color: "rgba(13,185,215,0.3)",
          fontFamily: "'Rajdhani',sans-serif",
          letterSpacing: "0.06em",
        }}
      >
        from sheet
      </span>
    </div>
  );
}

// Desktop drag-and-drop slot
function DesktopSlot({ char, id, onDrop, onRemove, onDragStart, onTouchStartSlot, label }) {
  const [over, setOver] = useState(false);
  const color = char ? ELEMENT_COLORS[char.element] || "#94a3b8" : null;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
      <div
        style={{
          fontSize: 8,
          color: "rgba(13,185,215,0.4)",
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          fontWeight: 700,
          fontFamily: "'Rajdhani',sans-serif",
        }}
      >
        {label}
      </div>
      <div
        data-slot-id={id}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          onDrop(id);
        }}
        style={{
          width: 92,
          height: 100,
          borderRadius: 10,
          position: "relative",
          border: over ? "2px dashed #38bdf8" : char ? `2px solid ${color}50` : "2px dashed rgba(30,58,95,0.5)",
          background: over
            ? "rgba(56,189,248,0.08)"
            : char
            ? `linear-gradient(145deg,${color}15,#060B14)`
            : "rgba(6,11,20,0.8)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.12s",
          boxShadow: char && !over ? `0 0 14px ${color}18` : "none",
        }}
      >
        {char ? (
          <div
            draggable
            onDragStart={() => onDragStart(char, id)}
            onTouchStart={onTouchStartSlot ? (e) => onTouchStartSlot(char, id, e) : undefined}
            style={{
              cursor: "grab",
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Portrait char={char} size={86} />
            <button
              onClick={() => onRemove(id)}
              onContextMenu={(e) => e.preventDefault()}
              style={{
                position: "absolute",
                top: 2,
                left: 2,
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: "rgba(239,68,68,0.2)",
                border: "1px solid rgba(239,68,68,0.6)",
                color: "#ef4444",
                fontSize: 12,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 0,
                fontWeight: 700,
                zIndex: 10,
              }}
            >
              ×
            </button>
          </div>
        ) : (
          <div style={{ color: "rgba(30,58,95,0.6)", fontSize: 22 }}>＋</div>
        )}
      </div>
      {char && (
        <div
          style={{
            fontSize: 10,
            textAlign: "center",
            maxWidth: 92,
            color: ELEMENT_COLORS[char.element],
            lineHeight: 1.2,
            fontWeight: 700,
            fontFamily: "'Rajdhani',sans-serif",
          }}
        >
          {char.name}
        </div>
      )}
    </div>
  );
}

// Mobile tap-to-assign slot
function MobileSlot({ char, label, selected, onSelect, onRemove, slotId, handleTouchStart }) {
  const color = char ? ELEMENT_COLORS[char.element] || "#94a3b8" : "#1e3a5f";
  return (
    <div
      onClick={onSelect}
      data-slot-id={slotId}
      style={{
        flex: 1,
        height: 80,
        borderRadius: 10,
        position: "relative",
        border: selected ? "2px solid #38bdf8" : char ? `2px solid ${color}60` : "2px dashed #1e3a5f",
        background: selected
          ? "rgba(56,189,248,0.08)"
          : char
          ? `linear-gradient(145deg,${color}15,#080d14)`
          : "#080d14",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        transition: "all 0.15s",
        overflow: "hidden",
        boxShadow: selected ? "0 0 0 2px rgba(56,189,248,0.2)" : "none",
      }}
    >
      {char ? (
        <>
          <div
            draggable
            onDragStart={() => {}}
            onTouchStart={handleTouchStart ? (e) => handleTouchStart(char, slotId, e) : undefined}
            onContextMenu={(e) => e.preventDefault()}
            style={{ position: "absolute", inset: 0, WebkitTouchCallout: "none" }}
          >
            <Portrait char={char} size={80} />
          </div>
          {DOUBLE_USABLE.includes(char.name) && (
            <div
              style={{
                position: "absolute",
                top: 2,
                right: 2,
                background: "#0ea5e9",
                borderRadius: 3,
                fontSize: 7,
                fontWeight: 800,
                color: "#fff",
                padding: "1px 3px",
                zIndex: 5,
              }}
            >
              2×
            </div>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            onContextMenu={(e) => e.preventDefault()}
            style={{
              position: "absolute",
              top: 2,
              left: 2,
              width: 18,
              height: 18,
              borderRadius: "50%",
              background: "rgba(239,68,68,0.4)",
              border: "1px solid #ef4444",
              color: "#fff",
              fontSize: 11,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
              fontWeight: 700,
              zIndex: 10,
            }}
          >
            ×
          </button>
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              background: "linear-gradient(to top,rgba(0,0,0,0.85),transparent)",
              padding: "3px 4px",
              fontSize: 10,
              color: "#e2e8f0",
              textAlign: "center",
              lineHeight: 1.2,
              fontWeight: 700,
              fontFamily: "'Rajdhani',sans-serif",
            }}
          >
            {char.name}
          </div>
        </>
      ) : (
        <>
          <div
            style={{
              fontSize: 8,
              color: "#334155",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              fontWeight: 600,
              fontFamily: "'Rajdhani',sans-serif",
            }}
          >
            {label}
          </div>
          <div style={{ fontSize: 20, color: selected ? "#38bdf8" : "#1e3a5f" }}>＋</div>
        </>
      )}
    </div>
  );
}

function MobileTeamCard({ team, teamIdx, selectedSlot, onSelectSlot, onRemoveFromSlot, onClear, handleTouchStart }) {
  const isActiveTeam = selectedSlot !== null && selectedSlot[0] === teamIdx;
  const dpr = dprForSlots(team.slots);
  const filled = team.slots.filter(Boolean);
  return (
    <div
      style={{
        background: isActiveTeam
          ? "linear-gradient(135deg,rgba(13,185,215,0.06),rgba(6,11,20,0.98))"
          : "linear-gradient(135deg,rgba(13,24,40,0.9),rgba(6,11,20,0.95))",
        border: `1px solid ${isActiveTeam ? "rgba(13,185,215,0.3)" : "rgba(13,185,215,0.08)"}`,
        borderRadius: 10,
        padding: "9px 11px",
        marginBottom: 6,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 7 }}>
        <div
          style={{
            background: "linear-gradient(135deg,rgba(201,168,76,0.15),rgba(201,168,76,0.05))",
            border: "1px solid rgba(201,168,76,0.3)",
            borderRadius: 4,
            padding: "2px 7px",
            fontSize: 9,
            fontWeight: 700,
            color: "#C9A84C",
            fontFamily: "'Cinzel',serif",
            letterSpacing: "0.06em",
          }}
        >
          T{teamIdx + 1}
        </div>
        <div style={{ flex: 1, color: "rgba(148,163,184,0.5)", fontSize: 10, fontFamily: "'Rajdhani',sans-serif" }}>
          Team {teamIdx + 1}
        </div>
        {dpr && (
          <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
            <span style={{ fontSize: 7, color: "rgba(201,168,76,0.5)", fontFamily: "'Rajdhani',sans-serif" }}>
              DPR
            </span>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#C9A84C", fontFamily: "'Rajdhani',sans-serif" }}>
              {formatDPR(dpr)}
            </span>
          </div>
        )}
        {filled.length > 0 && (
          <button
            onClick={onClear}
            style={{
              background: "transparent",
              border: "1px solid rgba(239,68,68,0.2)",
              borderRadius: 4,
              color: "rgba(239,68,68,0.5)",
              fontSize: 9,
              padding: "1px 5px",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        )}
      </div>
      <div style={{ display: "flex", gap: 5 }}>
        {["DPS", "Sub", "Supp"].map((lab, i) => (
          <MobileSlot
            key={i}
            char={team.slots[i]}
            label={lab}
            slotId={`${teamIdx}-${i}`}
            selected={isActiveTeam && selectedSlot[1] === i}
            onSelect={() => onSelectSlot(teamIdx, i)}
            onRemove={() => onRemoveFromSlot(`${teamIdx}-${i}`)}
            handleTouchStart={handleTouchStart}
          />
        ))}
      </div>
      <DPRRow slots={team.slots} />
    </div>
  );
}

const ROLE_TAB_COLORS = { main_dps: "#f87171", sub_dps: "#fb923c", support: "#34d399" };
const ROLE_TABS = [
  { k: null, l: "ALL" },
  { k: "main_dps", l: "MAIN" },
  { k: "sub_dps", l: "SUB" },
  { k: "support", l: "SUPP" },
];
const ZOOM_LEVELS = [0.7, 0.8, 0.9, 1, 1.1, 1.2, 1.3];

export default function App() {
  const [teams, setTeams] = useState(emptyTeams);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [width, setWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);

  const dragData = useRef(null);
  const ghostEl = useRef(null);
  const touchStartData = useRef(null);
  const longPressTimer = useRef(null);
  const isDragging = useRef(false);
  const loaded = useRef(false);
  const saveTimer = useRef(null);

  const isMobile = width < 768;

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  if (!loaded.current) {
    loaded.current = true;
    try {
      const saved = localStorage.getItem("wuwa-teams-v2");
      if (saved) setTeams(deserializeTeams(JSON.parse(saved)));
    } catch {}
  }

  function persist(next) {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      try {
        localStorage.setItem("wuwa-teams-v2", JSON.stringify(serializeTeams(next)));
      } catch {}
    }, 500);
  }

  function updateTeams(fn) {
    setTeams((prev) => {
      const next = fn(prev);
      persist(next);
      return next;
    });
  }

  // usage counting for double-usable supports
  const usageCounts = {};
  teams.forEach((t) =>
    t.slots.forEach((s) => {
      if (s) usageCounts[s.name] = (usageCounts[s.name] || 0) + 1;
    })
  );
  const isMaxedOut = (name) => (usageCounts[name] || 0) >= (DOUBLE_USABLE.includes(name) ? 2 : 1);

  function handleDragStart(char, fromId) {
    dragData.current = { char, fromId };
  }

  function handleDrop(toId) {
    if (!dragData.current) return;
    const { char, fromId } = dragData.current;
    const [toTeam, toSlot] = toId.split("-").map(Number);
    const next = teams.map((t) => ({ ...t, slots: [...t.slots] }));

    if (fromId) {
      const [fromTeam, fromSlot] = fromId.split("-").map(Number);
      const displaced = next[toTeam].slots[toSlot];
      next[toTeam].slots[toSlot] = char;
      next[fromTeam].slots[fromSlot] = displaced;
    } else {
      const currentCount = teams.reduce(
        (sum, t, ti) =>
          sum +
          t.slots.filter((s, si) => s?.name === char.name && !(ti === toTeam && si === toSlot)).length,
        0
      );
      if (currentCount >= (DOUBLE_USABLE.includes(char.name) ? 2 : 1)) {
        dragData.current = null;
        return;
      }
      next[toTeam].slots[toSlot] = char;
    }
    updateTeams(() => next);
    dragData.current = null;
  }

  function handleDropOnRoster() {
    if (dragData.current?.fromId) {
      const [t, s] = dragData.current.fromId.split("-").map(Number);
      updateTeams((prev) => prev.map((team, ti) => (ti === t ? { ...team, slots: team.slots.map((c, si) => (si === s ? null : c)) } : team)));
    }
    dragData.current = null;
  }

  function removeFromSlot(id) {
    const [t, s] = id.split("-").map(Number);
    updateTeams((prev) => prev.map((team, ti) => (ti === t ? { ...team, slots: team.slots.map((c, si) => (si === s ? null : c)) } : team)));
  }

  function clearTeam(idx) {
    updateTeams((prev) => prev.map((t, i) => (i === idx ? { ...t, slots: [null, null, null] } : t)));
  }

  function clearAll() {
    updateTeams(() => emptyTeams());
  }

  function selectSlot(teamIdx, slotIdx) {
    if (selectedSlot && selectedSlot[0] === teamIdx && selectedSlot[1] === slotIdx) {
      setSelectedSlot(null);
      return;
    }
    setSelectedSlot([teamIdx, slotIdx]);
  }

  function assignToSelectedSlot(char) {
    if (!selectedSlot) return;
    const [t, s] = selectedSlot;
    const currentCount = teams.reduce(
      (sum, team, ti) =>
        sum + team.slots.filter((c, si) => c?.name === char.name && !(ti === t && si === s)).length,
      0
    );
    if (currentCount >= (DOUBLE_USABLE.includes(char.name) ? 2 : 1)) return;

    const next = teams.map((team, ti) =>
      ti === t ? { ...team, slots: team.slots.map((c, si) => (si === s ? char : c)) } : team
    );
    updateTeams(() => next);

    let nextSlot = null;
    for (let i = s + 1; i < 3; i++) {
      if (!next[t].slots[i]) {
        nextSlot = [t, i];
        break;
      }
    }
    if (!nextSlot) {
      outer: for (let ti = t + 1; ti < TEAM_COUNT; ti++) {
        for (let si = 0; si < 3; si++) {
          if (!next[ti].slots[si]) {
            nextSlot = [ti, si];
            break outer;
          }
        }
      }
    }
    setSelectedSlot(nextSlot);
  }

  function makeGhost(char, x, y) {
    const el = document.createElement("div");
    el.style.cssText =
      "position:fixed;pointer-events:none;z-index:9999;opacity:0.9;transform:translate(-50%,-50%);border-radius:8px;overflow:hidden;width:64px;height:64px;border:2px solid #38bdf8;box-shadow:0 0 16px rgba(56,189,248,0.5);";
    const img = PORTRAITS[char.name];
    if (img) {
      el.style.backgroundImage = `url(${img})`;
      el.style.backgroundSize = "cover";
      el.style.backgroundPosition = "center top";
    } else {
      el.style.background = "#0d1a2e";
      el.style.display = "flex";
      el.style.alignItems = "center";
      el.style.justifyContent = "center";
      el.style.color = "#e2e8f0";
      el.style.fontWeight = "700";
      el.textContent = char.name[0];
    }
    document.body.appendChild(el);
    el.style.left = x + "px";
    el.style.top = y + "px";
    ghostEl.current = el;
    if (navigator.vibrate) navigator.vibrate(25);
  }

  function endTouchDrag() {
    clearTimeout(longPressTimer.current);
    if (ghostEl.current) {
      document.body.removeChild(ghostEl.current);
      ghostEl.current = null;
    }
    document.removeEventListener("touchmove", onTouchMoveDrag);
    document.removeEventListener("touchend", onTouchEndDrag);
    dragData.current = null;
    touchStartData.current = null;
    isDragging.current = false;
  }

  function onTouchMoveDrag(e) {
    if (!isDragging.current) return;
    e.preventDefault();
    const t = e.touches[0];
    if (ghostEl.current) {
      ghostEl.current.style.left = t.clientX + "px";
      ghostEl.current.style.top = t.clientY + "px";
    }
  }

  function onTouchEndDrag(e) {
    if (!isDragging.current) {
      endTouchDrag();
      return;
    }
    const t = e.changedTouches[0];
    const target = document.elementFromPoint(t.clientX, t.clientY);
    if (target) {
      if (target.closest("[data-roster]") && dragData.current?.fromId) {
        removeFromSlot(dragData.current.fromId);
      } else {
        const slotEl = target.closest("[data-slot-id]");
        if (slotEl && dragData.current) handleDrop(slotEl.getAttribute("data-slot-id"));
      }
    }
    endTouchDrag();
  }

  function handleTouchStart(char, fromId, e) {
    clearTimeout(longPressTimer.current);
    const touch = e.touches[0];
    touchStartData.current = { char, fromId, x: touch.clientX, y: touch.clientY };
    isDragging.current = false;

    const onMove = (ev) => {
      const mt = ev.touches[0];
      if (
        Math.abs(mt.clientX - touchStartData.current.x) > 8 ||
        Math.abs(mt.clientY - touchStartData.current.y) > 8
      ) {
        clearTimeout(longPressTimer.current);
        touchStartData.current = null;
        document.removeEventListener("touchmove", onMove);
        document.removeEventListener("touchend", onEnd);
      }
    };
    const onEnd = () => {
      clearTimeout(longPressTimer.current);
      touchStartData.current = null;
      document.removeEventListener("touchmove", onMove);
    };
    document.addEventListener("touchmove", onMove, { passive: true });
    document.addEventListener("touchend", onEnd, { once: true });

    longPressTimer.current = setTimeout(() => {
      document.removeEventListener("touchmove", onMove);
      document.removeEventListener("touchend", onEnd);
      if (!touchStartData.current) return;
      const { char: c, fromId: f, x, y } = touchStartData.current;
      dragData.current = { char: c, fromId: f };
      isDragging.current = true;
      makeGhost(c, x, y);
      document.addEventListener("touchmove", onTouchMoveDrag, { passive: false });
      document.addEventListener("touchend", onTouchEndDrag, { once: true });
    }, 500);
  }

  const visibleChars = CHARACTERS.filter(
    (c) =>
      !(search && !c.name.toLowerCase().includes(search.toLowerCase())) &&
      !(roleFilter && c.role !== roleFilter)
  );

  if (isMobile) {
    return (
      <div
        style={{
          height: "100dvh",
          display: "flex",
          flexDirection: "column",
          background: "#060B14",
          color: "#E8EEF4",
          fontFamily: "'Rajdhani',system-ui,sans-serif",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            background: "linear-gradient(180deg,#0A1220,#060B14)",
            borderBottom: "1px solid rgba(13,185,215,0.1)",
            padding: "0 14px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            height: 48,
            flexShrink: 0,
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 1,
              background:
                "linear-gradient(90deg,transparent,rgba(13,185,215,0.35),rgba(201,168,76,0.25),transparent)",
            }}
          />
          <div
            style={{
              fontFamily: "'Cinzel',serif",
              fontSize: 12,
              fontWeight: 700,
              flex: 1,
              background: "linear-gradient(90deg,#E8EEF4,#C9A84C,#E8EEF4)",
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              letterSpacing: "0.06em",
            }}
          >
            ENDSTATE MATRIX
          </div>
          <button
            onClick={clearAll}
            style={{
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.25)",
              borderRadius: 5,
              color: "rgba(239,68,68,0.8)",
              fontSize: 9,
              fontWeight: 700,
              padding: "4px 9px",
              cursor: "pointer",
              fontFamily: "'Rajdhani',sans-serif",
              letterSpacing: "0.1em",
            }}
          >
            CLEAR
          </button>
        </div>

        <div
          style={{ flex: 1, overflowY: "auto", padding: "8px 8px 0", WebkitOverflowScrolling: "touch" }}
          onClick={() => selectedSlot && setSelectedSlot(null)}
        >
          {teams.map((t, i) => (
            <MobileTeamCard
              key={t.id}
              team={t}
              teamIdx={i}
              selectedSlot={selectedSlot}
              onSelectSlot={selectSlot}
              onRemoveFromSlot={removeFromSlot}
              onClear={() => clearTeam(i)}
              handleTouchStart={handleTouchStart}
            />
          ))}
          <div style={{ height: 8 }} />
        </div>

        <div
          data-roster="true"
          style={{
            background: "linear-gradient(180deg,#0A1220,#060B14)",
            borderTop: "1px solid rgba(13,185,215,0.1)",
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            maxHeight: "44vh",
          }}
        >
          <div style={{ display: "flex", borderBottom: "1px solid rgba(13,185,215,0.08)" }}>
            {ROLE_TABS.map(({ k, l }) => (
              <button
                key={l}
                onClick={() => setRoleFilter(k)}
                style={{
                  flex: 1,
                  padding: "8px 0",
                  fontSize: 10,
                  fontWeight: 700,
                  cursor: "pointer",
                  background: roleFilter === k ? `${k ? ROLE_TAB_COLORS[k] : "#0DB9D7"}12` : "transparent",
                  border: "none",
                  borderBottom: `2px solid ${roleFilter === k ? (k ? ROLE_TAB_COLORS[k] : "#0DB9D7") : "transparent"}`,
                  color: roleFilter === k ? (k ? ROLE_TAB_COLORS[k] : "#0DB9D7") : "rgba(255,255,255,0.25)",
                  fontFamily: "'Rajdhani',sans-serif",
                  letterSpacing: "0.1em",
                  transition: "all 0.15s",
                }}
              >
                {l}
              </button>
            ))}
          </div>
          <div style={{ padding: "6px 8px" }}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search resonators..."
              style={{
                width: "100%",
                boxSizing: "border-box",
                background: "rgba(13,185,215,0.05)",
                border: "1px solid rgba(13,185,215,0.12)",
                borderRadius: 6,
                padding: "5px 10px",
                color: "#E8EEF4",
                fontSize: 11,
                outline: "none",
                fontFamily: "'Rajdhani',sans-serif",
              }}
            />
          </div>
          <div style={{ overflowY: "auto", padding: "0 8px 8px", WebkitOverflowScrolling: "touch" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 5 }}>
              {visibleChars.map((c) => {
                const maxed = isMaxedOut(c.name);
                return (
                  <div
                    key={c.name}
                    onClick={() => !maxed && (selectedSlot ? assignToSelectedSlot(c) : null)}
                    onTouchStart={maxed ? undefined : (e) => handleTouchStart(c, null, e)}
                    onContextMenu={(e) => e.preventDefault()}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 2,
                      userSelect: "none",
                      paddingBottom: 3,
                      cursor: maxed ? "default" : "pointer",
                      opacity: maxed ? 0.3 : 1,
                      WebkitTouchCallout: "none",
                      WebkitUserSelect: "none",
                    }}
                  >
                    <Portrait char={c} size={52} />
                    <div
                      style={{
                        fontSize: 7.5,
                        textAlign: "center",
                        color: "rgba(148,163,184,0.8)",
                        maxWidth: 58,
                        lineHeight: 1.1,
                        wordBreak: "break-word",
                      }}
                    >
                      {c.name}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          {selectedSlot ? (
            <div
              style={{
                textAlign: "center",
                fontSize: 9,
                color: "#0DB9D7",
                letterSpacing: "0.06em",
                padding: "5px",
                background: "rgba(13,185,215,0.06)",
                borderTop: "1px solid rgba(13,185,215,0.15)",
                fontFamily: "'Rajdhani',sans-serif",
                fontWeight: 600,
              }}
            >
              TAP A RESONATOR TO ASSIGN · TAP SLOT TO CANCEL
            </div>
          ) : (
            <div
              style={{
                textAlign: "center",
                fontSize: 9,
                color: "rgba(255,255,255,0.15)",
                padding: "5px",
                fontFamily: "'Rajdhani',sans-serif",
                letterSpacing: "0.06em",
              }}
            >
              TAP A SLOT TO ASSIGN A RESONATOR
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#060B14",
        color: "#E8EEF4",
        fontFamily: "'Rajdhani',system-ui,sans-serif",
        display: "flex",
        flexDirection: "column",
        zoom,
      }}
    >
      <div
        style={{
          background: "linear-gradient(180deg,#0A1220,#060B14)",
          borderBottom: "1px solid rgba(13,185,215,0.12)",
          padding: "0 18px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
          minHeight: 56,
          flexShrink: 0,
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 1,
            background: "linear-gradient(90deg,transparent,rgba(13,185,215,0.4),rgba(201,168,76,0.3),transparent)",
          }}
        />
        <div>
          <div
            style={{
              fontFamily: "'Cinzel',serif",
              fontSize: 15,
              fontWeight: 700,
              background: "linear-gradient(90deg,#E8EEF4,#C9A84C,#E8EEF4)",
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              letterSpacing: "0.08em",
            }}
          >
            WUTHERING WAVES — ENDSTATE MATRIX
          </div>
          <div style={{ fontSize: 9, color: "rgba(13,185,215,0.6)", letterSpacing: "0.1em" }}>
            {DOUBLE_USABLE.map((n) => n.toUpperCase()).join(" · ")} USABLE 2×
          </div>
        </div>
        <button
          onClick={clearAll}
          style={{
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.25)",
            borderRadius: 5,
            color: "rgba(239,68,68,0.8)",
            fontSize: 9,
            fontWeight: 700,
            padding: "4px 10px",
            cursor: "pointer",
            fontFamily: "'Rajdhani',sans-serif",
            letterSpacing: "0.1em",
          }}
        >
          CLEAR ALL
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
          <span style={{ fontSize: 8, color: "rgba(255,255,255,0.25)", fontFamily: "'Rajdhani',sans-serif", letterSpacing: "0.08em" }}>
            ZOOM
          </span>
          {ZOOM_LEVELS.map((z) => (
            <button
              key={z}
              onClick={() => setZoom(z)}
              style={{
                minWidth: 28,
                height: 20,
                borderRadius: 3,
                fontSize: 9,
                cursor: "pointer",
                fontWeight: 700,
                background: zoom === z ? "rgba(13,185,215,0.2)" : "transparent",
                border: `1px solid ${zoom === z ? "rgba(13,185,215,0.5)" : "rgba(255,255,255,0.08)"}`,
                color: zoom === z ? "#0DB9D7" : "rgba(255,255,255,0.3)",
                fontFamily: "'Rajdhani',sans-serif",
              }}
            >
              {Math.round(z * 100)}%
            </button>
          ))}
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 5 }}>
          {DOUBLE_USABLE.map((name) => {
            const char = CHARACTERS.find((c) => c.name === name);
            const used = usageCounts[name] || 0;
            return (
              <div
                key={name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  background: "rgba(13,185,215,0.06)",
                  border: "1px solid rgba(13,185,215,0.15)",
                  borderRadius: 6,
                  padding: "3px 7px",
                }}
              >
                {char && <Portrait char={char} size={22} />}
                <div>
                  <div style={{ fontSize: 9, color: "rgba(13,185,215,0.9)", fontWeight: 600, fontFamily: "'Rajdhani',sans-serif", letterSpacing: "0.04em" }}>
                    {name}
                  </div>
                  <div style={{ display: "flex", gap: 3, marginTop: 2 }}>
                    {[0, 1].map((i) => (
                      <div
                        key={i}
                        style={{
                          width: 12,
                          height: 4,
                          borderRadius: 2,
                          background: i < used ? "#0DB9D7" : "rgba(13,185,215,0.12)",
                          transition: "background 0.3s",
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <div
          data-roster="true"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleDropOnRoster();
          }}
          style={{
            width: 300,
            flexShrink: 0,
            background: "linear-gradient(180deg,#0A1220,#060B14)",
            borderRight: "1px solid rgba(13,185,215,0.08)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <div style={{ padding: "10px 10px 8px", borderBottom: "1px solid rgba(13,185,215,0.08)" }}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search resonators..."
              style={{
                width: "100%",
                boxSizing: "border-box",
                background: "rgba(13,185,215,0.05)",
                border: "1px solid rgba(13,185,215,0.15)",
                borderRadius: 6,
                padding: "7px 12px",
                color: "#E8EEF4",
                fontSize: 11,
                outline: "none",
                fontFamily: "'Rajdhani',sans-serif",
                letterSpacing: "0.04em",
              }}
            />
            <div style={{ display: "flex", gap: 3, marginTop: 8 }}>
              {ROLE_TABS.map(({ k, l }) => (
                <button
                  key={l}
                  onClick={() => setRoleFilter(roleFilter === k ? null : k)}
                  style={{
                    flex: 1,
                    padding: "5px 0",
                    borderRadius: 4,
                    fontSize: 9,
                    cursor: "pointer",
                    fontFamily: "'Rajdhani',sans-serif",
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    transition: "all 0.15s",
                    background: roleFilter === k ? (k ? `${ROLE_TAB_COLORS[k]}25` : "rgba(13,185,215,0.15)") : "transparent",
                    border: roleFilter === k ? `1px solid ${k ? ROLE_TAB_COLORS[k] : "#0DB9D7"}` : "1px solid rgba(255,255,255,0.06)",
                    color: roleFilter === k ? (k ? ROLE_TAB_COLORS[k] : "#0DB9D7") : "rgba(255,255,255,0.28)",
                  }}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "8px 6px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6 }}>
              {visibleChars.map((c) => {
                const maxed = isMaxedOut(c.name);
                return (
                  <div
                    key={c.name}
                    draggable={!maxed}
                    onDragStart={() => !maxed && (dragData.current = { char: c, fromId: null })}
                    onTouchStart={maxed ? undefined : (e) => handleTouchStart(c, null, e)}
                    onContextMenu={(e) => e.preventDefault()}
                    title={c.name}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 2,
                      cursor: maxed ? "not-allowed" : "grab",
                      userSelect: "none",
                      paddingBottom: 4,
                      WebkitTouchCallout: "none",
                      WebkitUserSelect: "none",
                    }}
                  >
                    <Portrait char={c} size={68} faded={maxed} />
                    <div
                      style={{
                        fontSize: 8.5,
                        textAlign: "center",
                        color: maxed ? "#334155" : "rgba(148,163,184,0.75)",
                        maxWidth: 72,
                        lineHeight: 1.2,
                        wordBreak: "break-word",
                        fontFamily: "'Rajdhani',sans-serif",
                        fontWeight: 600,
                      }}
                    >
                      {c.name}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "12px 10px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10 }}>
            {teams.map((t, i) => {
              const dpr = dprForSlots(t.slots);
              return (
                <div
                  key={t.id}
                  style={{
                    background: "linear-gradient(135deg,rgba(13,24,40,0.9),rgba(6,11,20,0.95))",
                    border: "1px solid rgba(13,185,215,0.08)",
                    borderRadius: 12,
                    padding: "12px 14px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <div
                      style={{
                        background: "linear-gradient(135deg,rgba(201,168,76,0.15),rgba(201,168,76,0.05))",
                        border: "1px solid rgba(201,168,76,0.3)",
                        borderRadius: 4,
                        padding: "2px 8px",
                        fontSize: 10,
                        fontWeight: 700,
                        color: "#C9A84C",
                        fontFamily: "'Cinzel',serif",
                        letterSpacing: "0.06em",
                      }}
                    >
                      T{i + 1}
                    </div>
                    <div style={{ flex: 1, color: "rgba(148,163,184,0.45)", fontSize: 11, fontFamily: "'Rajdhani',sans-serif", fontWeight: 600 }}>
                      Team {i + 1}
                    </div>
                    {dpr && (
                      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <span style={{ fontSize: 7, color: "rgba(201,168,76,0.5)", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'Rajdhani',sans-serif" }}>
                          DPR
                        </span>
                        <span style={{ fontSize: 14, fontWeight: 700, color: "#C9A84C", fontFamily: "'Rajdhani',sans-serif" }}>
                          {formatDPR(dpr)}
                        </span>
                      </div>
                    )}
                    {t.slots.some(Boolean) && (
                      <button
                        onClick={() => clearTeam(i)}
                        style={{
                          background: "transparent",
                          border: "1px solid rgba(239,68,68,0.2)",
                          borderRadius: 4,
                          color: "rgba(239,68,68,0.5)",
                          fontSize: 9,
                          padding: "2px 6px",
                          cursor: "pointer",
                          fontFamily: "'Rajdhani',sans-serif",
                        }}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                    {["DPS", "Sub", "Supp"].map((lab, si) => (
                      <DesktopSlot
                        key={si}
                        char={t.slots[si]}
                        id={`${i}-${si}`}
                        label={lab}
                        onDrop={handleDrop}
                        onRemove={removeFromSlot}
                        onDragStart={handleDragStart}
                        onTouchStartSlot={handleTouchStart}
                      />
                    ))}
                  </div>
                  <DPRRow slots={t.slots} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
