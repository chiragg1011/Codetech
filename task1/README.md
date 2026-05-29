# SkyFlow - Modern Responsive Weather Web App

A premium, responsive, and feature-rich weather dashboard that brings you real-time weather analytics. Built with HTML5, CSS3, and Vanilla JavaScript, SkyFlow features a stunning glassmorphic UI with dynamic background themes that automatically adapt to local weather conditions.

---

## 🌟 Key Features

- **Live City Search & Autocomplete:** Start typing any city name to get instant geocoding suggestions.
- **Dynamic Backgrounds:** Glassmorphic UI with colorful ambient gradients that shift depending on weather conditions (sunny, overcast, rainy, snowy, stormy, and nighttime).
- **Comprehensive Weather Indicators:**
  - Real-time Temperature (Celsius / Fahrenheit)
  - Interactive "Feels Like" Apparent Temperature
  - Dynamic weather description text & custom SVG animated-feel icons
  - Relative Humidity (%)
  - Wind Speed (km/h or mph) & Direction
  - Atmospheric Pressure (hPa)
  - Daily Max/Min UV Index
  - Daily Sunrise & Sunset times
- **5-Day Weather Forecast:** Get structured daily high/low temperatures and weather conditions.
- **Unit Conversions:** Instantly toggle between Metric (°C, km/h) and Imperial (°F, mph) formats.
- **Light/Dark Mode Toggle:** Premium responsive theme switcher with custom slate styling, optimized transparency, and auto-contrast icons.
- **Robust Error Handling:** Gorgeous, user-friendly error cards showing failure states (e.g., "City not found" or network issues) gracefully.
- **Sleek Skeleton Loading:** Animated skeleton screens show while data is loading.
- **Fully Responsive Layout:** Optimized for mobile screens, tablets, and wide desktop displays.

---

## 🛠️ Technologies Used

- **HTML5:** Semantic architecture (`<header>`, `<main>`, `<section>`, `<footer>`, `<aside>`).
- **CSS3:** Custom CSS Custom Properties (variables), CSS Grid & Flexbox, Backdrop-filters (Glassmorphism), dynamic gradients, hover micro-animations, skeleton screen keyframes.
- **Vanilla JavaScript (ES6+):** Pure JS logic, Geolocation API Integration, fetch client using modern `async/await`, custom debouncing, DOM manipulation, WMO weather code dictionary, SVG asset renderer.

---

## 🔌 API Integration

This application relies on the highly stable and free **Open-Meteo API** suite.
- **Geocoding API:** `https://geocoding-api.open-meteo.com/v1/search` used to search for city names, resolve their coordinates, and provide search suggestions.
- **Weather Forecast API:** `https://api.open-meteo.com/v1/forecast` used to fetch current conditions and 5-day daily forecasts via latitude/longitude coordinate query parameters.

**Note:** No API keys are required to run this project! It works out-of-the-box instantly.

---

## 🚀 How to Run the Project Locally

No build tools or installers are necessary since this is a pure vanilla frontend app.

### Method 1: Double-Click File
1. Download or clone this folder.
2. Double-click the `index.html` file in your explorer to open it instantly in any browser.

### Method 2: Local Server (Recommended for Geolocation features)
If you have a terminal open, run a quick local server to enable premium browser performance:

**Using Python:**
```bash
python -m http.server 8000
```
Then visit `http://localhost:8000` in your web browser.

**Using Node.js:**
```bash
npx http-server
```
Then visit `http://localhost:8080` in your web browser.


