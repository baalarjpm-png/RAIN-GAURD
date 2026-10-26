// RainGuard demo. All zone data below is SAMPLE data for the hackathon.
const COLORS = { g: "#2e9e5b", y: "#e8b21a", r: "#d9392f" };
const NAMES = { g: "Low", y: "Medium", r: "High" };

// vuln = how easily the zone floods (higher = worse)
const zones = [
  { id: "pascuales", name: "Pascuales", lat: -2.08, lng: -79.95, vuln: 1.0, safe: "Colegio Fiscal Pascuales", avoid: "Av. Perimetral low sections" },
  { id: "samanes", name: "Samanes", lat: -2.12, lng: -79.90, vuln: 0.8, safe: "Unidad Educativa Samanes", avoid: "Orellana underpass" },
  { id: "alborada", name: "Alborada", lat: -2.14, lng: -79.90, vuln: 0.7, safe: "Alborada Community Center", avoid: "Rodolfo Baquerizo low section" },
  { id: "mapasingue", name: "Mapasingue", lat: -2.14, lng: -79.94, vuln: 0.9, safe: "Mapasingue Sports Hall", avoid: "Stream crossings" },
  { id: "urdesa", name: "Urdesa", lat: -2.17, lng: -79.90, vuln: 0.6, safe: "Parque Urdesa Central", avoid: "Victor Emilio Estrada dips" },
  { id: "ceibos", name: "Ceibos", lat: -2.17, lng: -79.95, vuln: 0.3, safe: "Ceibos Hilltop Park", avoid: "None critical" },
  { id: "centro", name: "Centro", lat: -2.19, lng: -79.88, vuln: 0.9, safe: "Municipal Civic Shelter", avoid: "9 de Octubre near the river" },
  { id: "febres", name: "Febres Cordero", lat: -2.22, lng: -79.92, vuln: 1.2, safe: "Colegio Febres Cordero", avoid: "25 de Julio low zones" },
  { id: "guasmo", name: "Guasmo Sur", lat: -2.26, lng: -79.89, vuln: 1.3, safe: "Guasmo Evacuation Point", avoid: "Ernesto Alban Mosquera" },
  { id: "trinitaria", name: "Isla Trinitaria", lat: -2.27, lng: -79.92, vuln: 1.3, safe: "Trinitaria Community Shelter", avoid: "Entry roads to the island" }
];
// Sample hospital (approximate location)
const hospital = { id: "hospital", name: "Hospital (sample)", lat: -2.203, lng: -79.882 };

// Which places connect to each other (simple road network)
const links = [
  ["pascuales", "samanes"], ["pascuales", "mapasingue"], ["samanes", "alborada"],
  ["alborada", "urdesa"], ["alborada", "centro"], ["mapasingue", "urdesa"],
  ["mapasingue", "ceibos"], ["ceibos", "urdesa"], ["urdesa", "centro"],
  ["centro", "hospital"], ["centro", "febres"], ["febres", "hospital"],
  ["febres", "guasmo"], ["febres", "trinitaria"], ["guasmo", "trinitaria"], ["guasmo", "hospital"]
];

let rain = 0;          // mm/h currently used
let mode = "live";
let selected = null;
const map = L.map("map").setView([-2.17, -79.91], 11);
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "&copy; OpenStreetMap contributors" }).addTo(map);
const layer = L.layerGroup().addTo(map);

function level(z) {
  const s = rain * z.vuln;
  return s >= 28 ? "r" : s >= 12 ? "y" : "g";
}

function dist(a, b) {
  const dy = (a.lat - b.lat) * 111, dx = (a.lng - b.lng) * 111;
  return Math.sqrt(dx * dx + dy * dy);
}

// Dijkstra: finds the cheapest path. Red zones are blocked, yellow zones cost 3x.
function safestRoute(startId) {
  const all = [...zones, hospital];
  const get = id => all.find(p => p.id === id);
  const cost = {}, prev = {}, todo = new Set(all.map(p => p.id));
  all.forEach(p => cost[p.id] = Infinity);
  cost[startId] = 0;
  while (todo.size) {
    let cur = null;
    todo.forEach(id => { if (cur === null || cost[id] < cost[cur]) cur = id; });
    if (cost[cur] === Infinity) break;
    todo.delete(cur);
    links.filter(l => l.includes(cur)).forEach(l => {
      const nb = l[0] === cur ? l[1] : l[0];
      const p = get(nb);
      const lv = p.id === "hospital" ? "g" : level(p);
      if (lv === "r") return;                         // blocked
      const c = cost[cur] + dist(get(cur), p) * (lv === "y" ? 3 : 1);
      if (c < cost[nb]) { cost[nb] = c; prev[nb] = cur; }
    });
  }
  if (cost.hospital === Infinity) return null;
  const path = []; let n = "hospital";
  while (n) { path.unshift(get(n)); n = prev[n]; }
  return path;
}

function draw() {
  layer.clearLayers();
  zones.forEach(z => {
    const lv = level(z);
    L.circle([z.lat, z.lng], { radius: 2200, color: COLORS[lv], fillColor: COLORS[lv], fillOpacity: 0.45, weight: z.id === selected ? 4 : 1 })
      .addTo(layer).on("click", () => { selected = z.id; draw(); showInfo(z); })
      .bindTooltip(z.name + " - " + NAMES[lv]);
  });
  L.marker([hospital.lat, hospital.lng]).addTo(layer).bindTooltip(hospital.name);
  if (selected) {
    const route = safestRoute(selected);
    if (route) L.polyline(route.map(p => [p.lat, p.lng]), { color: "#1d6fd6", weight: 5 }).addTo(layer);
  }
  updateAlert();
}

function updateAlert() {
  const box = document.getElementById("alert");
  let color = "g", text;
  if (rain < 5) text = "Light or no rain. No flood risk expected.";
  else if (rain < 15) { color = "y"; text = "Rain advisory - drive carefully and watch low streets."; }
  else if (rain < 30) { color = "y"; text = "Heavy rainfall expected - avoid low-lying roads and underpasses."; }
  else { color = "r"; text = "SEVERE flood alert - avoid travel in southern and central zones. Move to higher ground."; }
  box.style.borderColor = COLORS[color];
  box.innerHTML = "<b>Rain now: " + rain.toFixed(1) + " mm/h</b><br>" + text;
}

function showInfo(z) {
  const lv = level(z);
  const tips = { g: "Normal activity. Stay informed.", y: "Avoid underpasses and low streets. Move vehicles off low ground.", r: "Do not drive through flooded streets. Go to the safe location now." }[lv];
  const route = safestRoute(z.id);
  const routeText = route ? "Safest route to hospital: " + route.map(p => p.name).join(" > ") : "No safe route to the hospital right now - call emergency services (ECU 911).";
  document.getElementById("info").innerHTML =
    "<b>" + z.name + "</b> - " + NAMES[lv] + " risk<br>" + tips +
    "<br><b>Safe location:</b> " + z.safe + "<br><b>Avoid:</b> " + z.avoid + "<br><b>" + routeText + "</b>";
}

async function loadLiveRain() {
  try {
    const url = "https://api.open-meteo.com/v1/forecast?latitude=-2.17&longitude=-79.92&current=precipitation&timezone=America%2FGuayaquil";
    const data = await (await fetch(url)).json();
    rain = data.current.precipitation * 1;
  } catch (e) { rain = 0; }
  draw();
}

document.querySelectorAll("#controls button").forEach(b => b.onclick = () => {
  document.querySelectorAll("#controls button").forEach(x => x.classList.remove("on"));
  b.classList.add("on");
  mode = b.dataset.mode;
  if (mode === "live") loadLiveRain(); else { rain = Number(mode); draw(); }
  if (selected) showInfo(zones.find(z => z.id === selected));
});

loadLiveRain();
