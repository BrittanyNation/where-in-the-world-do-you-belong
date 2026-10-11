/* Where in the World Do You Belong — app logic */
"use strict";

const TIMEZONES = [
  ["Pacific/Midway","Hawaii / Midway (UTC-11)"],["Pacific/Honolulu","Honolulu (UTC-10)"],
  ["America/Anchorage","Anchorage (UTC-9)"],["America/Los_Angeles","Los Angeles / West Coast (UTC-8)"],
  ["America/Denver","Denver / Mountain (UTC-7)"],["America/Chicago","Chicago / Central (UTC-6)"],
  ["America/New_York","New York / Eastern (UTC-5)"],["America/Halifax","Halifax (UTC-4)"],
  ["America/Sao_Paulo","Sao Paulo (UTC-3)"],["America/Noronha","Noronha (UTC-2)"],
  ["Atlantic/Azores","Azores (UTC-1)"],["Europe/London","London (UTC+0)"],
  ["Europe/Paris","Paris / Berlin / Madrid (UTC+1)"],["Europe/Helsinki","Helsinki / Cairo (UTC+2)"],
  ["Europe/Moscow","Moscow / Istanbul (UTC+3)"],["Asia/Dubai","Dubai (UTC+4)"],
  ["Asia/Karachi","Karachi (UTC+5)"],["Asia/Dhaka","Dhaka (UTC+6)"],
  ["Asia/Bangkok","Bangkok / Jakarta (UTC+7)"],["Asia/Singapore","Singapore / Hong Kong (UTC+8)"],
  ["Asia/Seoul","Seoul / Tokyo (UTC+9)"],["Australia/Darwin","Darwin (UTC+9:30)"],
  ["Australia/Sydney","Sydney (UTC+10) / UTC+11 DST"],["Pacific/Auckland","Auckland (UTC+12)"],
  ["Asia/Kathmandu","Kathmandu (UTC+5:45)"],["Asia/Kolkata","Kolkata / Mumbai (UTC+5:30)"],
  ["Asia/Tehran","Tehran (UTC+3:30)"],["America/St_Johns","Newfoundland (UTC-3:30)"],
];

// UTC offset (minutes to ADD to local wall time to get UTC) for a tz at a local datetime.
// Uses the Intl API so daylight saving is handled automatically.
function tzOffsetToUTC(y, mo, d, hh, mm, tz) {
  const target = Date.UTC(y, mo - 1, d, hh, mm); // wall time read as UTC
  const dtf = new Intl.DateTimeFormat("en-US", { timeZone: tz, hour12: false,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit" });
  let guess = target;
  for (let i = 0; i < 4; i++) {
    const parts = {};
    for (const p of dtf.formatToParts(new Date(guess))) parts[p.type] = p.value;
    const wallAsUTC = Date.UTC(+parts.year, +parts.month - 1, +parts.day,
      (+parts.hour) % 24, +parts.minute, +parts.second);
    const diff = wallAsUTC - target;
    if (diff === 0) break;
    guess = guess - diff;
  }
  return Math.round((guess - target) / 60000);
}

const PLANET_COLORS = { Sun:"#E8A020", Moon:"#5B9BD5", Mercury:"#E67E22", Venus:"#E8739B",
                        Mars:"#D64545", Jupiter:"#7D5BA6", Saturn:"#8B7355" };
const LINE_STYLE = { MC:"solid", IC:"dashed", ASC:"dotted", DSC:"dashdot" };
const BENEFIC = ["Sun","Jupiter","Venus"], HARD = ["Saturn","Mars","Pluto"];
const KIND_LABEL = { MC:"MC", IC:"IC", ASC:"ASC", DSC:"DSC" };

let landPolys = null, mapReady = false;

async function loadLand() {
  try {
    const topo = await (await fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/land-110m.json")).json();
    const tc = await import("https://cdn.jsdelivr.net/npm/topojson-client@3/+esm");
    const geo = tc.feature(topo, topo.objects.land);
    landPolys = [];
    const geoms = geo.geometry.type === "MultiPolygon" ? geo.geometry.coordinates : [geo.geometry.coordinates];
    for (const poly of geoms) landPolys.push(poly[0].map(([x, y]) => [x, y]));
  } catch (e) { landPolys = []; }
  mapReady = true;
}

function drawMap(canvas, chart, highlightCities) {
  const ctx = canvas.getContext("2d");
  const W = canvas.width = canvas.clientWidth * 2, H = canvas.height = canvas.clientWidth;
  const X = lon => (lon + 180) / 360 * W, Y = lat => (90 - lat) / 180 * H;
  ctx.fillStyle = "#FFF9F5"; ctx.fillRect(0, 0, W, H);
  // graticule
  ctx.strokeStyle = "#F0E4DC"; ctx.lineWidth = 1;
  for (let lon = -180; lon <= 180; lon += 30) { ctx.beginPath(); ctx.moveTo(X(lon), 0); ctx.lineTo(X(lon), H); ctx.stroke(); }
  for (let lat = -60; lat <= 80; lat += 20) { ctx.beginPath(); ctx.moveTo(0, Y(lat)); ctx.lineTo(W, Y(lat)); ctx.stroke(); }
  // land
  if (landPolys && landPolys.length) {
    ctx.fillStyle = "#F3E7DE"; ctx.strokeStyle = "#E2CFC2";
    for (const ring of landPolys) {
      ctx.beginPath();
      ring.forEach(([x, y], i) => i ? ctx.lineTo(X(x), Y(y)) : ctx.moveTo(X(x), Y(y)));
      ctx.closePath(); ctx.fill(); ctx.stroke();
    }
  }
  // lines
  const dash = { solid: [], dashed: [10, 7], dotted: [2, 5], dashdot: [10, 5, 2, 5] };
  for (const p of Object.keys(chart.planets)) {
    ctx.strokeStyle = PLANET_COLORS[p]; ctx.lineWidth = 2;
    for (const kind of ["MC","IC","ASC","DSC"]) {
      ctx.setLineDash(dash[LINE_STYLE[kind]]);
      ctx.beginPath();
      if (kind === "MC" || kind === "IC") {
        let e = lineLon(chart.planets[p], kind, 0, chart.gmstDeg);
        let lon = e <= 180 ? e : e - 360;
        ctx.moveTo(X(lon), Y(-60)); ctx.lineTo(X(lon), Y(80));
      } else {
        let prev = null;
        for (let la = -58; la <= 78; la += 2) {
          let e = lineLon(chart.planets[p], kind, la, chart.gmstDeg);
          if (e === null) { prev = null; continue; }
          let lon = e <= 180 ? e : e - 360;
          if (prev !== null && Math.abs(lon - prev) > 180) { ctx.stroke(); ctx.beginPath(); }
          else if (prev === null) ctx.moveTo(X(lon), Y(la));
          else ctx.lineTo(X(lon), Y(la));
          prev = lon;
        }
      }
      ctx.stroke();
    }
  }
  ctx.setLineDash([]);
  // cities
  for (const c of highlightCities) {
    const top = c.rank <= 3;
    ctx.beginPath();
    ctx.fillStyle = top ? "#C62828" : "#2E7D32";
    const r = top ? 9 : 6;
    ctx.arc(X(c.lon), Y(c.lat), r, 0, 7); ctx.fill();
    ctx.fillStyle = "#fff"; ctx.font = `bold ${top ? 13 : 10}px sans-serif`;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(String(c.rank), X(c.lon), Y(c.lat));
  }
}

function angDiff(a, b) { const d = Math.abs(((a - b + 540) % 360) - 180); return d; }

function scoreCities(chart) {
  const res = [];
  for (const c of CITIES) {
    const elon = ((c.lon % 360) + 360) % 360;
    const hits = [], hard = [];
    for (const p of BENEFIC)
      for (const k of ["MC","IC","ASC","DSC"]) {
        const ll = lineLon(chart.planets[p], k, c.lat, chart.gmstDeg);
        if (ll === null) continue;
        const dg = angDiff(ll, elon);
        if (dg <= 4) hits.push({ planet: p, kind: k, deg: dg });
      }
    for (const p of ["Saturn","Mars"])
      for (const k of ["MC","IC","ASC","DSC"]) {
        const ll = lineLon(chart.planets[p], k, c.lat, chart.gmstDeg);
        if (ll === null) continue;
        const dg = angDiff(ll, elon);
        if (dg <= 4) hard.push({ planet: p, kind: k, deg: dg });
      }
    if (hits.length) res.push({ ...c, hits: hits.sort((a,b)=>a.deg-b.deg),
                                hard: hard.sort((a,b)=>a.deg-b.deg) });
  }
  res.sort((a, b) => b.hits.length - a.hits.length || a.hard.length - b.hard.length);
  return res;
}

function cityBlurb(c) {
  const best = c.hits[0];
  const m = LINE_MEANINGS[best.planet][best.kind];
  return m.text;
}

function renderResults(name, birthCity, chart, scored) {
  const top = scored.slice(0, 8);
  top.forEach((c, i) => c.rank = i + 1);
  drawMap(document.getElementById("worldmap"), chart, top);

  const el = document.getElementById("citylist");
  el.innerHTML = "";
  const h2 = document.createElement("h2");
  const who = name || "You";
  h2.textContent = birthCity ? `${who}, born in ${birthCity} — where you belong:` : `${who}, where you belong:`;
  el.appendChild(h2);
  top.forEach((c, i) => {
    const card = document.createElement("div");
    card.className = "city-card" + (i === 0 ? " winner" : "");
    const lines = c.hits.map(h =>
      `<span class="line-chip" style="--pc:${PLANET_COLORS[h.planet]}">${h.planet} ${KIND_LABEL[h.kind]} · ${h.deg.toFixed(1)}°</span>`).join("");
    const hard = c.hard.length ? `<p class="hard-note">Heads up: ${c.hard.map(h => `${h.planet} ${KIND_LABEL[h.kind]} (${h.deg.toFixed(1)}°)`).join(", ")} nearby — intensity, not danger.</p>` : "";
    card.innerHTML = `
      <div class="city-head"><span class="rank">${i + 1}</span>
      <div><h3>${c.n}, ${c.c}</h3><div class="chips">${lines}</div></div></div>
      <p>${cityBlurb(c)}</p>${hard}`;
    el.appendChild(card);
  });

  const leg = document.getElementById("legend");
  leg.innerHTML = "<h3>Your lines</h3>" + Object.keys(chart.planets).map(p =>
    `<div class="legend-row"><span class="swatch" style="background:${PLANET_COLORS[p]}"></span>${p}
     <span class="angles">${["MC","IC","ASC","DSC"].map(k => {
        const ll = lineLon(chart.planets[p], k, 20, chart.gmstDeg);
        return ll === null ? "" : `<span>${k}</span>`;
     }).join(" ")}</span></div>`).join("") +
    `<p class="legend-note">Solid = MC (career) · dashed = IC (home) · dotted = ASC (rising) · dash-dot = DSC (relationships).<br>
    Tap a line's planet above to see what each one means where it touches the Earth.</p>`;
  document.getElementById("results").hidden = false;
  document.getElementById("results").scrollIntoView({ behavior: "smooth" });
}

document.addEventListener("DOMContentLoaded", () => {
  const tzSel = document.getElementById("tz");
  const groups = {};
  for (const [v, label] of TIMEZONES) {
    const region = v.split("/")[0];
    (groups[region] = groups[region] || []).push([v, label]);
  }
  for (const [region, opts] of Object.entries(groups)) {
    const og = document.createElement("optgroup"); og.label = region;
    for (const [v, label] of opts) {
      const o = document.createElement("option"); o.value = v; o.textContent = label;
      if (v === "America/Chicago") o.selected = true;
      og.appendChild(o);
    }
    tzSel.appendChild(og);
  }
  loadLand();
  document.getElementById("calc").addEventListener("submit", e => {
    e.preventDefault();
    const name = document.getElementById("name").value.trim();
    const [y, mo, d] = document.getElementById("date").value.split("-").map(Number);
    const [hh, mm] = document.getElementById("time").value.split(":").map(Number);
    const tz = tzSel.value;
    if (!y || hh === undefined || isNaN(mm)) { alert("Please enter your birth date and time."); return; }
    const offMin = tzOffsetToUTC(y, mo, d, hh, mm, tz); // minutes to add to local -> UTC
    const utcMs = Date.UTC(y, mo - 1, d, hh, mm) + offMin * 60000;
    const ud = new Date(utcMs);
    const chart = computeChart(ud.getUTCFullYear(), ud.getUTCMonth() + 1, ud.getUTCDate(),
                               ud.getUTCHours() + ud.getUTCMinutes() / 60);
    renderResults(name, document.getElementById("birthcity").dataset.display || "", chart, scoreCities(chart));
  });

  // Birth city autocomplete -> auto timezone
  const cityInput = document.getElementById("birthcity");
  const suggest = document.getElementById("citysuggest");
  const tzNote = document.getElementById("tznote");
  function ensureTzOption(tz) {
    let opt = [...tzSel.options].find(o => o.value === tz);
    if (!opt) {
      opt = document.createElement("option");
      opt.value = tz;
      opt.textContent = tz.replace(/_/g, " ");
      tzSel.appendChild(opt);
    }
    return opt;
  }
  cityInput.addEventListener("input", () => {
    const q = cityInput.value.trim().toLowerCase();
    cityInput.dataset.display = "";
    suggest.innerHTML = "";
    if (q.length < 2) { suggest.hidden = true; return; }
    const matches = BIRTH_CITIES.filter(([n, c]) =>
      n.toLowerCase().includes(q) || c.toLowerCase().includes(q)).slice(0, 8);
    if (!matches.length) { suggest.hidden = true; return; }
    for (const [n, c, tz] of matches) {
      const div = document.createElement("div");
      div.className = "suggest-item";
      div.textContent = `${n}, ${c}`;
      div.addEventListener("mousedown", e => {
        e.preventDefault();
        cityInput.value = `${n}, ${c}`;
        cityInput.dataset.display = `${n}, ${c}`;
        ensureTzOption(tz).selected = true;
        tzNote.textContent = `Time zone set from ${n} — change it if that's not right.`;
        suggest.hidden = true;
      });
      suggest.appendChild(div);
    }
    suggest.hidden = false;
  });
  cityInput.addEventListener("blur", () => setTimeout(() => suggest.hidden = true, 150));
});
