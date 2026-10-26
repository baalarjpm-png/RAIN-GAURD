# 🌧️ RainGuard – Smart Rainfall & Flood Alert System

**Hack2Impact 2026 · Track 1: Heavy Rain & Flood Resilience in Guayaquil**

🔗 **Live demo:** https://YOURNAME.github.io/rainguard
🎥 **Demo video:** [add link]

---

## 1. Problem statement

Guayaquil is a low-lying coastal city on the Guayas river estuary. During heavy rain, especially in El Niño years, streets can flood within hours. People often get no clear, local warning, and ambulances and buses lose time because flooded roads are only discovered on arrival.

> How can we develop smart solutions that help Guayaquil anticipate and respond better to heavy rains?

## 2. Our solution

RainGuard is a simple web tool that turns rainfall data into **flood-risk levels, alerts and safe routes**.

| Feature | What it does |
|---|---|
| Live rainfall | Reads current rainfall (mm/h) from the Open-Meteo API, plus demo storm scenarios |
| Flood risk map | Colors 10 sample neighborhoods green, yellow or red |
| Smart rain alerts | Rule-based warnings, e.g. "Heavy rainfall expected: avoid low-lying roads" |
| Safe route and advice | Finds the safest route to the hospital that avoids flooded zones, plus safe locations and roads to avoid |

## 3. System architecture

![RainGuard architecture](docs/architecture.png)

Everything runs **client-side in the browser** (no server needed).

1. **Data:** Open-Meteo rainfall (mm/h) and local sample zone/road data.
2. **Scenario manager:** uses live rain, or a moderate / heavy / extreme demo storm.
3. **Risk engine (JavaScript):** `risk score = rainfall (mm/h) × zone vulnerability`
   - below 12 → 🟢 Low
   - 12 to 27 → 🟡 Medium
   - 28 or more → 🔴 High
4. **Route finder (Dijkstra):** red zones are blocked, yellow zones cost 3× more.
5. **Alert rules:** thresholds at **5, 15 and 30 mm/h**.
6. **Display:** Leaflet map, risk layer, alert banner and safest-route view.

## 4. Tech stack

| Layer | Technology |
|---|---|
| Rain data | [Open-Meteo API](https://open-meteo.com/) |
| Logic | JavaScript (risk scoring, Dijkstra, alert rules) |
| Map | [Leaflet](https://leafletjs.com/) + [OpenStreetMap](https://www.openstreetmap.org/) tiles |
| Interface | HTML, CSS |
| Hosting and tools | GitHub Pages, Git |

## 5. Project structure

```
rainguard/
├── index.html      # page layout
├── style.css       # styling
├── app.js          # risk engine, Dijkstra route finder, alerts, map
├── docs/
│   └── architecture.png
├── README.md
└── LICENSE         # MIT
```

## 6. How to run (reproduction steps)

**Option A: online**
Open the live demo link above.

**Option B: on your computer**
1. Download or clone this repository:
   ```bash
   git clone https://github.com/YOURNAME/rainguard.git
   cd rainguard
   ```
2. Start a simple local server (Python is optional, any static server works):
   ```bash
   python -m http.server 8000
   ```
3. Open `http://localhost:8000` in your browser.

**No dependencies to install.** Leaflet is loaded from a CDN, so an internet connection is needed.

## 7. How to use the demo

1. Choose **Live rain**, or a **Moderate / Heavy / Extreme** demo scenario.
2. Watch the zones change color and the alert banner update.
3. Tap a neighborhood to see precautions, a safe location and roads to avoid.
4. The blue line shows the safest route to the hospital that avoids red zones.

## 8. Limitations (honest notes)

- **Zone, road and hospital data are sample data** with approximate coordinates, used for the demo. They are not official.
- The prototype **needs internet** for live rain, map tiles and the Leaflet library. During real floods, connections can fail.
- Risk scores use a simple rule (rain × vulnerability), not a trained flood model.

## 9. Scalability and roadmap

- **Offline mode:** cache the map, zones and advice on the phone (PWA / service worker) so warnings open without internet.
- **SMS alerts:** send warnings through an SMS gateway to people without data or smartphones.
- **Backend:** move the logic to FastAPI with a database for many users and stored history.
- **Real data:** official GIS layers, elevation and flood history.
- **Sensors:** low-cost river-level sensors (ESP32, LoRa, MQTT) for real-time local readings and sirens.
- **AI:** short-term flash-flood prediction (1 to 3 hours ahead).
- **Other cities:** the same engine works anywhere by swapping the zone and road data.

## 10. Credits and libraries

- Rainfall data: [Open-Meteo](https://open-meteo.com/) (free, open API)
- Map library: [Leaflet](https://leafletjs.com/)
- Map tiles: © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors

## 11. Team

- [Name 1]
- [Name 2]
- [Name 3]

## 12. License

Released under the [MIT License](LICENSE).
