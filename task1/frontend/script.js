/**
 * -------------------------------------------------------------
 * SKYFLOW CONTROLLER - Dynamic Weather Web Application
 * -------------------------------------------------------------
 * This script manages application state, fetches data from the 
 * Open-Meteo APIs, handles debounced autocomplete, controls units,
 * renders high-quality SVGs, and updates the responsive UI.
 */

// --- Constants & Configuration ---
const GEO_API_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const WEATHER_API_URL = 'https://api.open-meteo.com/v1/forecast';
const DEBOUNCE_DELAY = 350; // ms for search input autocomplete

// --- SVG Icons Asset Library ---
const ICONS = {
  clearDay: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="weather-svg sunny-anim">
      <circle cx="12" cy="12" r="4" fill="rgba(251, 191, 36, 0.2)"></circle>
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" stroke="#fbbf24" stroke-width="2.5"></path>
    </svg>`,
  clearNight: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="weather-svg night-anim">
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" fill="rgba(129, 140, 248, 0.2)" stroke="#818cf8"></path>
    </svg>`,
  partlyCloudyDay: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="weather-svg cloud-sun-anim">
      <path d="M12 2v2M4.93 4.93l1.41 1.41M2 12h2M19.07 4.93l-1.41 1.41" stroke="#fbbf24"></path>
      <circle cx="12" cy="12" r="4" fill="rgba(251, 191, 36, 0.2)" stroke="#fbbf24"></circle>
      <path d="M17.5 19a3.5 3.5 0 1 0-3.5-3.5h-1a4.5 4.5 0 1 0-4.5 4.5h9Z" fill="rgba(255, 255, 255, 0.1)" stroke="#e2e8f0"></path>
    </svg>`,
  partlyCloudyNight: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="weather-svg cloud-moon-anim">
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" stroke="#818cf8"></path>
      <path d="M17.5 19a3.5 3.5 0 1 0-3.5-3.5h-1a4.5 4.5 0 1 0-4.5 4.5h9Z" fill="rgba(255, 255, 255, 0.1)" stroke="#e2e8f0"></path>
    </svg>`,
  cloudy: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="weather-svg float-anim">
      <path d="M12 10a4 4 0 0 0-4 4h-1a3 3 0 0 0 0 6h11a4 4 0 0 0 0-8h-1a4 4 0 0 0-4-4Z" fill="rgba(148, 163, 184, 0.2)" stroke="#94a3b8"></path>
      <path d="M17.5 19a3.5 3.5 0 1 0-3.5-3.5h-1a4.5 4.5 0 1 0-4.5 4.5h9Z" fill="rgba(255, 255, 255, 0.15)" stroke="#cbd5e1"></path>
    </svg>`,
  fog: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="weather-svg fog-anim">
      <path d="M17.5 16a3.5 3.5 0 1 0-3.5-3.5h-1a4.5 4.5 0 1 0-4.5 4.5h9Z" fill="rgba(148, 163, 184, 0.1)" stroke="#94a3b8"></path>
      <path d="M5 18h14M7 21h10M4 15h16" stroke="#cbd5e1" stroke-width="2"></path>
    </svg>`,
  drizzle: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="weather-svg rain-anim">
      <path d="M17.5 15a3.5 3.5 0 1 0-3.5-3.5h-1a4.5 4.5 0 1 0-4.5 4.5h9Z" fill="rgba(148, 163, 184, 0.1)" stroke="#94a3b8"></path>
      <path d="M8 18v1M12 18v1M16 18v1M10 21v1M14 21v1" stroke="#38bdf8" stroke-width="2.5"></path>
    </svg>`,
  rain: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="weather-svg rain-anim">
      <path d="M17.5 14a3.5 3.5 0 1 0-3.5-3.5h-1a4.5 4.5 0 1 0-4.5 4.5h9Z" fill="rgba(71, 85, 105, 0.2)" stroke="#cbd5e1"></path>
      <path d="M8 17l-1 3M12 17l-1 3M16 17l-1 3M10 20l-1 3M14 20l-1 3" stroke="#38bdf8" stroke-width="2.5"></path>
    </svg>`,
  snow: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="weather-svg snow-anim">
      <path d="M17.5 15a3.5 3.5 0 1 0-3.5-3.5h-1a4.5 4.5 0 1 0-4.5 4.5h9Z" fill="rgba(186, 230, 253, 0.2)" stroke="#e2e8f0"></path>
      <path d="M8 18h.01M12 18h.01M16 18h.01M10 21h.01M14 21h.01" stroke="#e2e8f0" stroke-width="3" stroke-linecap="round"></path>
    </svg>`,
  thunderstorm: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="weather-svg lightning-anim">
      <path d="M17.5 14a3.5 3.5 0 1 0-3.5-3.5h-1a4.5 4.5 0 1 0-4.5 4.5h9Z" fill="rgba(15, 23, 42, 0.3)" stroke="#475569"></path>
      <path d="M13 16l-3 4h4l-2 3" stroke="#fbbf24" stroke-width="2" stroke-linejoin="miter"></path>
      <path d="M8 17l-.5 2M16 17l-.5 2" stroke="#38bdf8" stroke-width="2"></path>
    </svg>`
};

// --- WMO Weather Interpretation Codes ---
// Mapped to description, background styling handles, and specific SVG asset key.
const WEATHER_CODES = {
  0: { text: "Clear Sky", bg: "clear-sky", icon: "clear" },
  1: { text: "Mainly Clear", bg: "clear-sky", icon: "clear" },
  2: { text: "Partly Cloudy", bg: "cloudy", icon: "partlyCloudy" },
  3: { text: "Overcast", bg: "cloudy", icon: "cloudy" },
  45: { text: "Fog", bg: "cloudy", icon: "fog" },
  48: { text: "Depositing Rime Fog", bg: "cloudy", icon: "fog" },
  51: { text: "Light Drizzle", bg: "rainy", icon: "drizzle" },
  53: { text: "Moderate Drizzle", bg: "rainy", icon: "drizzle" },
  55: { text: "Dense Drizzle", bg: "rainy", icon: "drizzle" },
  56: { text: "Light Freezing Drizzle", bg: "rainy", icon: "drizzle" },
  57: { text: "Dense Freezing Drizzle", bg: "rainy", icon: "drizzle" },
  61: { text: "Slight Rain", bg: "rainy", icon: "rain" },
  63: { text: "Moderate Rain", bg: "rainy", icon: "rain" },
  65: { text: "Heavy Rain", bg: "rainy", icon: "rain" },
  66: { text: "Light Freezing Rain", bg: "rainy", icon: "rain" },
  67: { text: "Heavy Freezing Rain", bg: "rainy", icon: "rain" },
  71: { text: "Slight Snowfall", bg: "snowy", icon: "snow" },
  73: { text: "Moderate Snowfall", bg: "snowy", icon: "snow" },
  75: { text: "Heavy Snowfall", bg: "snowy", icon: "snow" },
  77: { text: "Snow Grains", bg: "snowy", icon: "snow" },
  80: { text: "Slight Rain Showers", bg: "rainy", icon: "rain" },
  81: { text: "Moderate Rain Showers", bg: "rainy", icon: "rain" },
  82: { text: "Violent Rain Showers", bg: "rainy", icon: "rain" },
  85: { text: "Slight Snow Showers", bg: "snowy", icon: "snow" },
  86: { text: "Heavy Snow Showers", bg: "snowy", icon: "snow" },
  95: { text: "Thunderstorm", bg: "stormy", icon: "thunderstorm" },
  96: { text: "Thunderstorm with Slight Hail", bg: "stormy", icon: "thunderstorm" },
  99: { text: "Thunderstorm with Heavy Hail", bg: "stormy", icon: "thunderstorm" }
};

// --- Application State Manager ---
const STATE = {
  cityName: 'London',
  countryName: 'United Kingdom',
  latitude: 51.50853,
  longitude: -0.12574,
  currentWeather: null, // Holds weather response data
  dailyForecast: null, // Holds forecast array
  timezone: 'Europe/London',
  unit: 'metric', // 'metric' (°C, km/h) or 'imperial' (°F, mph)
  theme: 'dark' // 'dark' or 'light'
};

// --- DOM Elements Cache ---
const el = {
  appContainer: document.querySelector('.app-container'),
  searchForm: document.getElementById('search-form'),
  searchInput: document.getElementById('search-input'),
  suggestionsDropdown: document.getElementById('suggestions-dropdown'),
  geoBtn: document.getElementById('geo-btn'),
  unitToggle: document.getElementById('unit-toggle'),
  themeToggle: document.getElementById('theme-toggle'),
  sunIcon: document.querySelector('#theme-toggle .sun-icon'),
  moonIcon: document.querySelector('#theme-toggle .moon-icon'),
  dashboardContent: document.getElementById('dashboard-content'),
  errorCard: document.getElementById('error-card'),
  errorTitle: document.getElementById('error-title'),
  errorMessage: document.getElementById('error-message'),
  errorCloseBtn: document.getElementById('error-close-btn'),
  
  // Weather Info Targets
  cityName: document.getElementById('city-name'),
  countryName: document.getElementById('country-name'),
  currentDate: document.getElementById('current-date'),
  weatherIconContainer: document.getElementById('weather-icon-container'),
  mainTemp: document.getElementById('main-temp'),
  mainUnit: document.getElementById('main-unit'),
  weatherDesc: document.getElementById('weather-description'),
  feelsLikeTemp: document.getElementById('feels-like-temp'),
  feelsLikeSubUnit: document.querySelector('.feels-like-container .sub-unit'),
  
  // Details
  humidityVal: document.getElementById('humidity-val'),
  windVal: document.getElementById('wind-val'),
  uvVal: document.getElementById('uv-val'),
  pressureVal: document.getElementById('pressure-val'),
  sunriseVal: document.getElementById('sunrise-val'),
  sunsetVal: document.getElementById('sunset-val'),
  
  // Forecast List
  forecastList: document.getElementById('forecast-list'),
  
  // Skeleton Loaders
  mainSkeleton: document.querySelector('.main-skeleton'),
  mainContent: document.querySelector('.main-weather-content'),
  detailsSkeleton: document.querySelector('.details-skeleton'),
  detailsGrid: document.querySelector('.details-grid'),
  forecastSkeleton: document.querySelector('.forecast-skeleton')
};

// --- Initialization / App Entrypoint ---
window.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize theme from localStorage
  initTheme();
  
  // 2. Hook up all action listeners
  setupEventListeners();
  
  // 3. Fetch initial weather for default city (London)
  fetchWeatherData();
});

// --- Event Listeners Setup ---
function setupEventListeners() {
  // Search Form Submit Handling
  el.searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = el.searchInput.value.trim();
    if (query) {
      performSearch(query);
    }
  });

  // Autocomplete Suggestions - Debounced Keyup
  let debounceTimer;
  el.searchInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    const query = el.searchInput.value.trim();
    
    if (query.length < 2) {
      hideSuggestions();
      return;
    }
    
    debounceTimer = setTimeout(() => {
      fetchSuggestions(query);
    }, DEBOUNCE_DELAY);
  });

  // Close Autocomplete Suggestions when clicking outside
  document.addEventListener('click', (e) => {
    if (!el.searchInput.contains(e.target) && !el.suggestionsDropdown.contains(e.target)) {
      hideSuggestions();
    }
  });

  // Geolocation Button Handler
  el.geoBtn.addEventListener('click', requestUserLocation);

  // Celsius / Fahrenheit Switch Handler
  el.unitToggle.addEventListener('click', toggleTemperatureUnit);

  // Dark / Light Theme Toggle Handler
  el.themeToggle.addEventListener('click', toggleTheme);

  // Close Error Alert Handler
  el.errorCloseBtn.addEventListener('click', () => {
    el.errorCard.classList.add('hidden');
    el.dashboardContent.classList.remove('hidden');
    el.searchInput.focus();
  });
}

// --- Theme State Controller ---
function initTheme() {
  const savedTheme = localStorage.getItem('skyflow-theme') || 'dark';
  STATE.theme = savedTheme;
  
  if (savedTheme === 'light') {
    el.appContainer.classList.add('light-theme');
    el.sunIcon.classList.add('hidden');
    el.moonIcon.classList.remove('hidden');
  } else {
    el.appContainer.classList.remove('light-theme');
    el.sunIcon.classList.remove('hidden');
    el.moonIcon.classList.add('hidden');
  }
}

function toggleTheme() {
  const isLight = el.appContainer.classList.contains('light-theme');
  
  if (isLight) {
    el.appContainer.classList.remove('light-theme');
    STATE.theme = 'dark';
    localStorage.setItem('skyflow-theme', 'dark');
    el.sunIcon.classList.remove('hidden');
    el.moonIcon.classList.add('hidden');
  } else {
    el.appContainer.classList.add('light-theme');
    STATE.theme = 'light';
    localStorage.setItem('skyflow-theme', 'light');
    el.sunIcon.classList.add('hidden');
    el.moonIcon.classList.remove('hidden');
  }
}

// --- Autocomplete Geocoding Fetcher ---
async function fetchSuggestions(query) {
  try {
    const response = await fetch(`${GEO_API_URL}?name=${encodeURIComponent(query)}&count=5&language=en&format=json`);
    if (!response.ok) throw new Error('Geocoding search failed');
    
    const data = await response.json();
    if (data.results && data.results.length > 0) {
      renderSuggestions(data.results);
    } else {
      hideSuggestions();
    }
  } catch (error) {
    console.error('Geocoding Autocomplete Error:', error);
    hideSuggestions();
  }
}

// --- Render Autocomplete Items ---
function renderSuggestions(results) {
  el.suggestionsDropdown.innerHTML = '';
  
  results.forEach(city => {
    const item = document.createElement('div');
    item.className = 'suggestion-item';
    
    const cityName = city.name;
    const countryName = city.country || '';
    const adminDiv = city.admin1 ? `${city.admin1}, ` : '';
    const stateString = `${adminDiv}${countryName}`;
    
    item.innerHTML = `
      <span class="suggestion-city">${cityName}</span>
      <span class="suggestion-country">${stateString}</span>
    `;
    
    // Suggestion select listener
    item.addEventListener('click', () => {
      STATE.cityName = cityName;
      STATE.countryName = countryName;
      STATE.latitude = city.latitude;
      STATE.longitude = city.longitude;
      
      el.searchInput.value = `${cityName}, ${countryName}`;
      hideSuggestions();
      fetchWeatherData();
    });
    
    el.suggestionsDropdown.appendChild(item);
  });
  
  el.suggestionsDropdown.classList.remove('hidden');
}

function hideSuggestions() {
  el.suggestionsDropdown.classList.add('hidden');
}

// --- Geolocation Browser Support ---
function requestUserLocation() {
  if (!navigator.geolocation) {
    showError("Geolocation Error", "Your browser does not support Geolocation features.");
    return;
  }
  
  el.geoBtn.classList.add('pulse');
  
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      
      STATE.latitude = lat;
      STATE.longitude = lon;
      STATE.cityName = 'Current Location';
      STATE.countryName = '';
      
      el.searchInput.value = '';
      el.geoBtn.classList.remove('pulse');
      
      // Attempt to resolve coordinates to a real city name using Geocoding Reverse API
      await attemptReverseGeocoding(lat, lon);
      fetchWeatherData();
    },
    (error) => {
      el.geoBtn.classList.remove('pulse');
      let msg = "Could not fetch your location.";
      if (error.code === error.PERMISSION_DENIED) {
        msg = "Location permission denied. Please allow site location in browser settings.";
      }
      showError("Location Access Denied", msg);
    },
    { enableHighAccuracy: true, timeout: 8000 }
  );
}

// --- Reverse Geocoding Attempt ---
// Simple open reverse geocoding to resolve coordinates to city name
async function attemptReverseGeocoding(lat, lon) {
  try {
    // Open-Meteo geocoding doesn't support coordinate lookup natively,
    // so we call standard open source Nominatim OSM API for simple reverse lookup
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=en`);
    if (response.ok) {
      const data = await response.json();
      const address = data.address;
      if (address) {
        STATE.cityName = address.city || address.town || address.village || address.suburb || 'Current Location';
        STATE.countryName = address.country || '';
      }
    }
  } catch (e) {
    // Graceful fallback to Coordinates
    STATE.cityName = `Location (${lat.toFixed(2)}, ${lon.toFixed(2)})`;
    STATE.countryName = '';
  }
}

// --- Search Form Explicit Submit Trigger ---
async function performSearch(query) {
  try {
    showLoading(true);
    const response = await fetch(`${GEO_API_URL}?name=${encodeURIComponent(query)}&count=1&language=en&format=json`);
    if (!response.ok) throw new Error('Network error during lookup');
    
    const data = await response.json();
    if (data.results && data.results.length > 0) {
      const topResult = data.results[0];
      STATE.cityName = topResult.name;
      STATE.countryName = topResult.country || '';
      STATE.latitude = topResult.latitude;
      STATE.longitude = topResult.longitude;
      
      fetchWeatherData();
    } else {
      showError("City Not Found", `We couldn't find "${query}" in our database. Please make sure spelling is correct.`);
    }
  } catch (error) {
    showError("Connection Error", "A network error occurred while finding the city. Please check your internet connection.");
    console.error(error);
  } finally {
    hideSuggestions();
  }
}

// --- Fetch Weather Metrics using coordinates ---
async function fetchWeatherData() {
  showLoading(true);
  el.errorCard.classList.add('hidden');
  el.dashboardContent.classList.remove('hidden');
  
  const queryParams = new URLSearchParams({
    latitude: STATE.latitude,
    longitude: STATE.longitude,
    current: [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'is_day',
      'weather_code',
      'wind_speed_10m',
      'wind_direction_10m',
      'pressure_msl'
    ].join(','),
    daily: [
      'weather_code',
      'temperature_2m_max',
      'temperature_2m_min',
      'sunrise',
      'sunset',
      'uv_index_max'
    ].join(','),
    timezone: 'auto'
  });

  try {
    const response = await fetch(`${WEATHER_API_URL}?${queryParams.toString()}`);
    if (!response.ok) throw new Error("Failed to load weather data");
    
    const data = await response.json();
    STATE.currentWeather = data.current;
    STATE.dailyForecast = data.daily;
    STATE.timezone = data.timezone;
    
    // Render layout using fetched metrics
    renderWeatherDOM();
  } catch (error) {
    showError("Data Error", "Unable to pull live weather metrics from our service. Please try again in a few moments.");
    console.error(error);
  } finally {
    showLoading(false);
  }
}

// --- Celsius / Fahrenheit State Toggle ---
function toggleTemperatureUnit() {
  const isFahrenheit = el.appContainer.classList.contains('fahrenheit-active');
  
  if (isFahrenheit) {
    el.appContainer.classList.remove('fahrenheit-active');
    STATE.unit = 'metric';
  } else {
    el.appContainer.classList.add('fahrenheit-active');
    STATE.unit = 'imperial';
  }
  
  // Re-render UI using new unit state. (NO fetch call needed, instantaneous conversions!)
  if (STATE.currentWeather && STATE.dailyForecast) {
    renderWeatherDOM();
  }
}

// --- Rendering Controller ---
function renderWeatherDOM() {
  const current = STATE.currentWeather;
  const daily = STATE.dailyForecast;
  
  if (!current || !daily) return;
  
  const wCode = current.weather_code;
  const isDay = current.is_day;
  
  // 1. Establish Background Weather State Class
  updateAmbientBackground(wCode, isDay);
  
  // 2. Main Location Information
  el.cityName.textContent = STATE.cityName;
  el.countryName.textContent = STATE.countryName;
  
  // Date rendering formatted correctly
  const localDate = new Date();
  const formatOptions = { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' };
  el.currentDate.textContent = localDate.toLocaleDateString('en-US', formatOptions);
  
  // 3. Primary Temperatures & Descriptions
  const weatherMap = WEATHER_CODES[wCode] || { text: "Unknown Conditions", icon: "cloudy" };
  el.weatherDesc.textContent = weatherMap.text;
  
  // Weather SVG Injection
  const iconKey = weatherMap.icon;
  el.weatherIconContainer.innerHTML = getIconSVG(iconKey, isDay);
  
  // Temperature formatting based on selection
  const rawTemp = current.temperature_2m;
  const rawApparent = current.apparent_temperature;
  
  el.mainTemp.textContent = Math.round(convertTemp(rawTemp));
  el.feelsLikeTemp.textContent = Math.round(convertTemp(rawApparent));
  
  const unitSymbol = STATE.unit === 'metric' ? '°C' : '°F';
  el.mainUnit.textContent = unitSymbol;
  el.feelsLikeSubUnit.textContent = unitSymbol;
  
  // 4. Weather Detail Indicators Grid
  el.humidityVal.textContent = `${current.relative_humidity_2m}%`;
  
  // Wind Speed Conversion
  const rawWind = current.wind_speed_10m; // in km/h
  if (STATE.unit === 'metric') {
    el.windVal.textContent = `${Math.round(rawWind)} km/h`;
  } else {
    const mphWind = rawWind * 0.621371;
    el.windVal.textContent = `${Math.round(mphWind)} mph`;
  }
  
  // UV Index formatting
  const rawUV = daily.uv_index_max[0];
  let uvLabel = "Low";
  if (rawUV >= 3 && rawUV < 6) uvLabel = "Mod";
  else if (rawUV >= 6 && rawUV < 8) uvLabel = "High";
  else if (rawUV >= 8 && rawUV < 11) uvLabel = "Very High";
  else if (rawUV >= 11) uvLabel = "Extreme";
  el.uvVal.textContent = `${Math.round(rawUV)} (${uvLabel})`;
  
  // Pressure
  el.pressureVal.textContent = `${Math.round(current.pressure_msl)} hPa`;
  
  // Sunrise/Sunset Hours Formatting
  el.sunriseVal.textContent = formatIsoTimeString(daily.sunrise[0]);
  el.sunsetVal.textContent = formatIsoTimeString(daily.sunset[0]);
  
  // 5. 5-Day Forecast List Render
  renderForecastList(daily);
}

// --- Render 5-Day Forecast Lists ---
function renderForecastList(daily) {
  el.forecastList.innerHTML = '';
  
  // We slice starting from index 1 to skip the current day and show the next 5 days
  for (let i = 1; i <= 5; i++) {
    const dateStr = daily.time[i];
    const maxTemp = daily.temperature_2m_max[i];
    const minTemp = daily.temperature_2m_min[i];
    const wCode = daily.weather_code[i];
    
    // Day formatting
    const forecastDate = new Date(dateStr + 'T00:00:00');
    const dayName = forecastDate.toLocaleDateString('en-US', { weekday: 'short' });
    
    const weatherMap = WEATHER_CODES[wCode] || { text: "Overcast", icon: "cloudy" };
    const svgIcon = getIconSVG(weatherMap.icon, 1); // Assume day icons for forecast list
    
    const displayMax = Math.round(convertTemp(maxTemp));
    const displayMin = Math.round(convertTemp(minTemp));
    
    const forecastItem = document.createElement('div');
    forecastItem.className = 'forecast-item';
    forecastItem.innerHTML = `
      <span class="forecast-day">${dayName}</span>
      <div class="forecast-icon-container" title="${weatherMap.text}">
        ${svgIcon}
      </div>
      <span class="forecast-desc">${weatherMap.text}</span>
      <div class="forecast-temps">
        <span class="temp-max">${displayMax}°</span>
        <span class="temp-min">${displayMin}°</span>
      </div>
    `;
    
    el.forecastList.appendChild(forecastItem);
  }
}

// --- Ambient Backdrop Gradient Transitions ---
function updateAmbientBackground(code, isDay) {
  // Clear previous ambient classes but preserve light theme state
  const isLightTheme = el.appContainer.classList.contains('light-theme');
  el.appContainer.className = 'app-container';
  if (isLightTheme) {
    el.appContainer.classList.add('light-theme');
  }
  
  const weatherMap = WEATHER_CODES[code] || { bg: "cloudy" };
  const bgClass = weatherMap.bg;
  
  // Apply night modifiers if is_day === 0
  const isNight = isDay === 0;
  const suffix = isNight ? '-night' : '';
  const finalClass = `${bgClass}${suffix}`;
  
  el.appContainer.classList.add(finalClass);
  
  // Add unit state helper
  if (STATE.unit === 'imperial') {
    el.appContainer.classList.add('fahrenheit-active');
  }
}

// --- Value Conversions Helpers ---
function convertTemp(celsius) {
  if (STATE.unit === 'metric') {
    return celsius;
  } else {
    return (celsius * 9) / 5 + 32; // Celsius to Fahrenheit
  }
}

function formatIsoTimeString(isoString) {
  if (!isoString) return "--:--";
  const dateObj = new Date(isoString);
  return dateObj.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

function getIconSVG(key, isDay) {
  const isNight = isDay === 0;
  
  if (key === 'clear') {
    return isNight ? ICONS.clearNight : ICONS.clearDay;
  }
  if (key === 'partlyCloudy') {
    return isNight ? ICONS.partlyCloudyNight : ICONS.partlyCloudyDay;
  }
  
  return ICONS[key] || ICONS.cloudy;
}

// --- Loader System Toggle ---
function showLoading(isLoading) {
  if (isLoading) {
    // Show skeletons, hide contents
    el.mainSkeleton.classList.remove('hidden');
    el.mainContent.classList.add('hidden');
    
    el.detailsSkeleton.classList.remove('hidden');
    el.detailsGrid.classList.add('hidden');
    
    el.forecastSkeleton.classList.remove('hidden');
    el.forecastList.classList.add('hidden');
  } else {
    // Hide skeletons, show contents
    el.mainSkeleton.classList.add('hidden');
    el.mainContent.classList.remove('hidden');
    
    el.detailsSkeleton.classList.add('hidden');
    el.detailsGrid.classList.remove('hidden');
    
    el.forecastSkeleton.classList.add('hidden');
    el.forecastList.classList.remove('hidden');
  }
}

// --- Friendly Error Presenter ---
function showError(title, message) {
  el.errorTitle.textContent = title;
  el.errorMessage.textContent = message;
  
  el.dashboardContent.classList.add('hidden');
  el.errorCard.classList.remove('hidden');
}
