// =======================
// script.js - MyWeda Niger
// =======================

// Clé API WeatherAPI (NE PAS exposer en public en production)
const apiKey = "9d10caf92cee4bac8dd102629252508";

// Liste complète des communes du Niger
const nigerCommunes = [
    { nom: "Niamey", region: "Niamey" },
    { nom: "Maradi", region: "Maradi" },
    { nom: "Zinder", region: "Zinder" },
    { nom: "Tahoua", region: "Tahoua" },
    { nom: "Agadez", region: "Agadez" },
    { nom: "Dosso", region: "Dosso" },
    { nom: "Tillabéri", region: "Tillabéri" },
    { nom: "Diffa", region: "Diffa" },
    { nom: "Magaria", region: "Zinder" },
    { nom: "Mirriah", region: "Zinder" },
    { nom: "Tanout", region: "Zinder" },
    { nom: "Goure", region: "Zinder" },
    { nom: "Matameye", region: "Zinder" },
    { nom: "Tessaoua", region: "Maradi" },
    { nom: "Madarounfa", region: "Maradi" },
    { nom: "Dakoro", region: "Maradi" },
    { nom: "Guidan Roumdji", region: "Maradi" },
    { nom: "Mayahi", region: "Maradi" },
    { nom: "Abalak", region: "Tahoua" },
    { nom: "Bouza", region: "Tahoua" },
    { nom: "Illela", region: "Tahoua" },
    { nom: "Keita", region: "Tahoua" },
    { nom: "Madaoua", region: "Tahoua" },
    { nom: "Birni N'Konni", region: "Tahoua" },
    { nom: "Ayorou", region: "Tillabéri" },
    { nom: "Filingué", region: "Tillabéri" },
    { nom: "Ouallam", region: "Tillabéri" },
    { nom: "Say", region: "Tillabéri" },
    { nom: "Téra", region: "Tillabéri" },
    { nom: "Gaya", region: "Dosso" },
    { nom: "Loga", region: "Dosso" },
    { nom: "Dogondoutchi", region: "Dosso" },
    { nom: "Boboye", region: "Dosso" },
    { nom: "Birni Gaouré", region: "Dosso" },
    { nom: "Mainé-Soroa", region: "Diffa" },
    { nom: "N'Guigmi", region: "Diffa" },
    { nom: "Bosso", region: "Diffa" },
    { nom: "Bilma", region: "Agadez" },
    { nom: "Arlit", region: "Agadez" },
    { nom: "Tchirozérine", region: "Agadez" },
    { nom: "In Gall", region: "Agadez" },
    { nom: "Tabalak", region: "Tahoua" },
    { nom: "Tibiri", region: "Maradi" },
    { nom: "Gouré", region: "Zinder" },
    { nom: "Kollo", region: "Tillabéri" },
    { nom: "Torodi", region: "Tillabéri" },
    { nom: "Matameye", region: "Zinder" },
    { nom: "Damagaram Takaya", region: "Zinder" },
    { nom: "Goudoumaria", region: "Diffa" },
    { nom: "Diffa", region: "Diffa" },
    { nom: "Tillia", region: "Tahoua" },
    { nom: "Ingall", region: "Agadez" },
    { nom: "Sokorbé", region: "Dosso" },
    { nom: "Kantché", region: "Zinder" },
    { nom: "Bandé", region: "Zinder" },
    { nom: "Dunama", region: "Zinder" },
    { nom: "Korgom", region: "Tahoua" },
    { nom: "Tounounga", region: "Dosso" },
    { nom: "Gouchi", region: "Maradi" },
    { nom: "Sabon Machi", region: "Maradi" },
    { nom: "Dogo", region: "Dosso" },
    { nom: "Soudouré", region: "Niamey" },
    { nom: "Kouré", region: "Tillabéri" },
    { nom: "Sinder", region: "Tillabéri" }
    // ... Tu peux en ajouter d'autres selon les besoins
];

// ------------- Mode sombre automatique et manuel -------------
const darkModeToggle = document.getElementById('darkModeToggle');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

function setDarkMode(on) {
    if(on) document.body.classList.add('dark-mode');
    else document.body.classList.remove('dark-mode');
    localStorage.setItem('myweda_dark', on ? '1' : '0');
}
darkModeToggle.onclick = () => setDarkMode(!document.body.classList.contains('dark-mode'));
window.onload = () => {
    const userPref = localStorage.getItem('myweda_dark');
    setDarkMode(userPref ? userPref === '1' : prefersDark);
};

// ------------- Recherche/autocomplétion -------------
const searchInput = document.getElementById('searchInput');
const dropdown = document.getElementById('dropdown');
const cityList = document.getElementById('cityList');
const searchBtn = document.getElementById('searchBtn');

function showDropdown(matches) {
    cityList.innerHTML = '';
    matches.forEach(city => {
        const li = document.createElement('li');
        li.textContent = city.nom;
        const region = document.createElement('span');
        region.className = 'city-region';
        region.textContent = city.region;
        li.appendChild(region);
        li.onclick = () => {
            searchInput.value = city.nom;
            dropdown.style.display = 'none';
            fetchWeather(city.nom);
        };
        cityList.appendChild(li);
    });
    dropdown.style.display = matches.length ? 'block' : 'none';
}

searchInput.oninput = () => {
    const val = searchInput.value.trim().toLowerCase();
    if(val.length === 0){ dropdown.style.display = 'none'; return; }
    const matches = nigerCommunes.filter(c => c.nom.toLowerCase().includes(val));
    showDropdown(matches.slice(0, 8));
};
searchInput.onfocus = () => searchInput.oninput();
searchInput.onblur = () => setTimeout(() => dropdown.style.display = 'none', 150);

searchBtn.onclick = () => {
    const val = searchInput.value.trim();
    if(val.length === 0) return;
    fetchWeather(val);
};

// ------------- Affichage météo -------------
const loading = document.getElementById('loading');
const errorMessage = document.getElementById('errorMessage');
const weatherSection = document.getElementById('weather');
const chartSection = document.getElementById('chartSection');
const chartControls = document.getElementById('chartControls');
let chartInstance = null;
let latestData = null;

function showLoading(show){ loading.style.display = show ? 'flex' : 'none'; }
function showError(msg){ errorMessage.textContent = msg; errorMessage.style.display = 'block'; }
function hideError(){ errorMessage.style.display = 'none'; }

async function fetchWeather(cityName) {
    showLoading(true);
    hideError();
    weatherSection.innerHTML = '';
    chartSection.style.display = 'none';
    chartControls.style.display = 'none';

    try {
        const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${encodeURIComponent(cityName + ', Niger')}&days=5&aqi=no&alerts=no&lang=fr`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Ville non trouvée ou problème réseau.");
        const data = await res.json();
        latestData = data;
        renderWeather(data);
        renderChart(data, 'temp');
    } catch (e) {
        showError(e.message || "Erreur météo.");
    } finally {
        showLoading(false);
    }
}

// ------------- Affichage météo HTML -------------
function renderWeather(data) {
    const c = data.current;
    const l = data.location;
    const w = data.forecast.forecastday[0];
    weatherSection.innerHTML = `
    <div class="weather-card">
        <div class="weather-header">
            <h2>${l.name}, ${l.region ? l.region : 'Niger'}</h2>
            <div style="font-size:0.98em;color:#7c8492;">${l.localtime}</div>
        </div>
        <div class="current-weather">
            <img class="weather-icon-large" src="${c.condition.icon}" alt="Icone météo">
            <div class="temperature-info">
                <div class="temperature">${c.temp_c}°C</div>
                <div class="condition">${c.condition.text}</div>
                <div style="font-size:0.97em;">Ressentie : ${c.feelslike_c}°C</div>
            </div>
            <div class="weather-details">
                <div class="detail-item">💧 Humidité : ${c.humidity}%</div>
                <div class="detail-item">💨 Vent : ${c.wind_kph} km/h</div>
                <div class="detail-item">🌅 Lever : ${w.astro.sunrise}</div>
                <div class="detail-item">🌇 Coucher : ${w.astro.sunset}</div>
            </div>
        </div>
    </div>
    `;
}

// ------------- Graphique prévisions -------------
function renderChart(data, type) {
    chartSection.style.display = 'block';
    chartControls.style.display = 'block';

    const labels = data.forecast.forecastday.map(f => f.date.substr(5,5));
    const temps = data.forecast.forecastday.map(f => f.day.avgtemp_c);
    const precips = data.forecast.forecastday.map(f => f.day.totalprecip_mm);

    const ctx = document.getElementById('forecastChart').getContext('2d');
    if (chartInstance) chartInstance.destroy();

    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: type === 'temp' ? 'Température moyenne (°C)' : 'Précipitations (mm)',
                data: type === 'temp' ? temps : precips,
                backgroundColor: type === 'temp' ? '#2563eb33' : '#10b98144',
                borderColor: type === 'temp' ? '#2563eb' : '#10b981',
                tension: 0.36,
                fill: true,
                pointRadius: 4,
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false },
                tooltip: { enabled: true }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: type === 'temp' ? '°C' : 'mm' }
                }
            }
        }
    });

    // Boutons de contrôle graphique
    document.getElementById('tempBtn').classList.toggle('active', type === 'temp');
    document.getElementById('precipBtn').classList.toggle('active', type === 'precip');
}

// ------------- Contrôles du graphique -------------
document.getElementById('tempBtn').onclick = () => {
    if(latestData) renderChart(latestData, 'temp');
};
document.getElementById('precipBtn').onclick = () => {
    if(latestData) renderChart(latestData, 'precip');
};

// ------------- Recherche par entrée directe (Entrée) -------------
searchInput.addEventListener('keydown', function(e){
    if(e.key === 'Enter') searchBtn.click();
});

// ------------- (Optionnel) Chargement initial avec Niamey -------------
fetchWeather('Niamey');
