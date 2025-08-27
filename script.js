// Clé API et configuration
const apiKey = "9d10caf92cee4bac8dd102629252508";
let currentCity = "Niamey";
let isDarkMode = false;

// Éléments DOM
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const weatherContainer = document.getElementById('weather-container');
const loader = document.getElementById('loader');
const errorMessage = document.getElementById('error-message');
const themeToggle = document.getElementById('theme-toggle');

// Chargement initial
document.addEventListener('DOMContentLoaded', () => {
    getWeatherData(currentCity);
    setupEventListeners();
    
    // Vérifier le mode sombre dans le localStorage
    if (localStorage.getItem('darkMode') === 'enabled') {
        enableDarkMode();
    }
    
    // Mise à jour automatique toutes les 30 minutes
    setInterval(() => {
        getWeatherData(currentCity);
    }, 30 * 60 * 1000);
});

// Configuration des écouteurs d'événements
function setupEventListeners() {
    searchBtn.addEventListener('click', handleSearch);
    cityInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
    themeToggle.addEventListener('click', toggleTheme);
}

// Gestion de la recherche
function handleSearch() {
    const city = cityInput.value.trim();
    if (city) {
        currentCity = city;
        getWeatherData(city);
    }
}

// Basculer entre le mode clair et sombre
function toggleTheme() {
    isDarkMode = !isDarkMode;
    
    if (isDarkMode) {
        enableDarkMode();
    } else {
        disableDarkMode();
    }
    
    // Sauvegarder le choix dans le localStorage
    localStorage.setItem('darkMode', isDarkMode ? 'enabled' : 'disabled');
}

function enableDarkMode() {
    document.body.classList.add('dark-mode');
    themeToggle.textContent = '☀️';
    isDarkMode = true;
}

function disableDarkMode() {
    document.body.classList.remove('dark-mode');
    themeToggle.textContent = '🌙';
    isDarkMode = false;
}

// Récupérer les données météo depuis l'API
function getWeatherData(city) {
    showLoader();
    hideError();
    
    const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&hours=5&lang=fr`;
    
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Ville non trouvée');
            }
            return response.json();
        })
        .then(data => {
            displayWeatherData(data);
            hideLoader();
        })
        .catch(error => {
            console.error('Erreur:', error);
            showError();
            hideLoader();
            // Réafficher les dernières données valides
            if (currentCity !== "Niamey") {
                getWeatherData("Niamey");
            }
        });
}

// Afficher les données météo dans l'interface
function displayWeatherData(data) {
    const { location, current, forecast } = data;
    
    weatherContainer.innerHTML = `
        <div class="current-weather">
            <h2 class="city-name">${location.name}</h2>
            <p class="country">${location.country}</p>
            <div class="weather-icon">
                <img src="${current.condition.icon}" alt="${current.condition.text}">
            </div>
            <div class="temp">${Math.round(current.temp_c)}°C</div>
            <p class="description">${current.condition.text}</p>
            <div class="details">
                <div class="detail-item">
                    <p>Humidité</p>
                    <p class="detail-value">${current.humidity}%</p>
                </div>
                <div class="detail-item">
                    <p>Vent</p>
                    <p class="detail-value">${current.wind_kph} km/h</p>
                </div>
            </div>
        </div>
        <div class="hourly-forecast">
            <h3 class="section-title">Prévisions des 5 prochaines heures</h3>
            <div class="hourly-container">
                ${forecast.forecastday[0].hour.map(hour => `
                    <div class="hour-item">
                        <p class="hour">${new Date(hour.time).getHours()}h</p>
                        <div class="hour-icon">
                            <img src="${hour.condition.icon}" alt="${hour.condition.text}">
                        </div>
                        <p class="hour-temp">${Math.round(hour.temp_c)}°C</p>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// Afficher le loader
function showLoader() {
    loader.style.display = 'block';
}

// Cacher le loader
function hideLoader() {
    loader.style.display = 'none';
}

// Afficher le message d'erreur
function showError() {
    errorMessage.style.display = 'block';
}

// Cacher le message d'erreur
function hideError() {
    errorMessage.style.display = 'none';
}

// Fonction pour détecter la localisation de l'utilisateur (fonctionnalité avancée)
function detectUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const { latitude, longitude } = position.coords;
                getWeatherData(`${latitude},${longitude}`);
            },
            error => {
                console.error("Erreur de géolocalisation:", error);
                // On garde Niamey par défaut en cas d'erreur
                getWeatherData("Niamey");
            }
        );
    } else {
        console.error("La géolocalisation n'est pas supportée par ce navigateur.");
        getWeatherData("Niamey");
    }
}
