// ======================
// CONFIGURATION
// ======================
const API_KEY = "9d10caf92cee4bac8dd102629252508";
const DEFAULT_CITY = "Niamey";
const HOURLY_LIMIT = 5;

// ======================
// ÉLÉMENTS DU DOM
// ======================
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const themeToggle = document.getElementById("themeToggle");
const themeLabel = document.getElementById("themeLabel");

// Current weather elements
const locationName = document.getElementById("locationName");
const localTime = document.getElementById("localTime");
const tempC = document.getElementById("tempC");
const conditionText = document.getElementById("conditionText");
const weatherIcon = document.getElementById("weatherIcon");
const feelsLike = document.getElementById("feelsLike");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");

// Forecast elements
const hourlyList = document.getElementById("hourlyList");
const dailyList = document.getElementById("dailyList");

// ======================
// INITIALISATION
// ======================
document.addEventListener("DOMContentLoaded", () => {
    fetchWeather(DEFAULT_CITY);
});

// ======================
// ÉVÉNEMENTS
// ======================
searchBtn.addEventListener("click", () => {
    const city = cityInput.value.trim();
    if (city) fetchWeather(city);
});

// Toggle mode clair / sombre
themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    themeLabel.textContent = document.body.classList.contains("dark") ? "Sombre" : "Clair";
});

// ======================
// FONCTIONS PRINCIPALES
// ======================
async function fetchWeather(city) {
    try {
        const url = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${encodeURIComponent(city)}&days=7&aqi=no&alerts=no`;
        const response = await fetch(url);
        if (!response.ok) throw new Error("Ville introuvable");
        const data = await response.json();
        renderCurrent(data);
        renderHourly(data);
        renderDaily(data);
    } catch (error) {
        alert(error.message);
    }
}

// Affichage météo actuelle
function renderCurrent(data) {
    locationName.textContent = `${data.location.name}, ${data.location.country}`;
    localTime.textContent = data.location.localtime.split(" ")[1];
    tempC.textContent = `${data.current.temp_c}°C`;
    conditionText.textContent = data.current.condition.text;
    weatherIcon.textContent = iconEmoji(data.current.condition.text);
    feelsLike.textContent = `Ressenti: ${data.current.feelslike_c}°C`;
    humidity.textContent = `Humidité: ${data.current.humidity}%`;
    wind.textContent = `Vent: ${data.current.wind_kph} km/h`;
}

// Affichage des 5 prochaines heures
function renderHourly(data) {
    hourlyList.innerHTML = "";
    const hours = data.forecast.forecastday[0].hour;
    const currentHour = new Date().getHours();

    const nextHours = hours.filter(h => parseInt(h.time.split(" ")[1].split(":")[0]) >= currentHour).slice(0, HOURLY_LIMIT);

    nextHours.forEach(h => {
        const time = h.time.split(" ")[1];
        const icon = iconEmoji(h.condition.text);
        const div = document.createElement("div");
        div.className = "hour";
        div.innerHTML = `
            <div>${time}</div>
            <div style="font-size:24px">${icon}</div>
            <div>${h.temp_c}°C</div>
        `;
        hourlyList.appendChild(div);
    });
}

// Affichage des prévisions 7 jours
function renderDaily(data) {
    dailyList.innerHTML = "";
    data.forecast.forecastday.forEach(day => {
        const date = new Date(day.date);
        const dayName = date.toLocaleDateString("fr-FR", { weekday: "short" });
        const icon = iconEmoji(day.day.condition.text);
        const div = document.createElement("div");
        div.className = "day";
        div.innerHTML = `
            <span>${dayName}</span>
            <span style="font-size:18px">${icon}</span>
            <span>${day.day.maxtemp_c}° / ${day.day.mintemp_c}°</span>
        `;
        dailyList.appendChild(div);
    });
}

// Icônes météo simples en emoji (rapide et esthétique)
function iconEmoji(condition) {
    condition = condition.toLowerCase();
    if (condition.includes("sun") || condition.includes("soleil")) return "☀️";
    if (condition.includes("cloud") || condition.includes("nuage")) return "☁️";
    if (condition.includes("rain") || condition.includes("pluie")) return "🌧️";
    if (condition.includes("snow") || condition.includes("neige")) return "❄️";
    if (condition.includes("storm") || condition.includes("orage")) return "⛈️";
    return "🌤️";
}
