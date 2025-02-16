document.addEventListener('DOMContentLoaded', () => {
    const searchBtn = document.getElementById('searchBtn');
    searchBtn.addEventListener('click', fetchWeather);


document.getElementById('favoritesToggle').addEventListener('click', function() {
    const box = this.parentElement;
    box.classList.toggle('expanded');
});

    const darkModeToggle = document.getElementById('darkModeToggle');
    darkModeToggle.addEventListener('click', toggleDarkMode);


    updateFavoritesList();


    document.getElementById('favoritesList').addEventListener('click', (e) => {
        if (e.target.tagName === 'SPAN') {
            document.getElementById('cityInput').value = e.target.textContent;
            fetchWeather();
        }
    });
});


function addToFavorites(city) {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    if (!favorites.includes(city)) {
        favorites.push(city);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        updateFavoritesList();
    }
}

function updateFavoritesList() {
    const list = document.getElementById('favoritesList');
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    list.innerHTML = favorites.map(city => `
        <li class="favorite-item">
            <span>${city}</span>
            <button class="btn btn-sm btn-danger" onclick="removeFavorite('${city}')">
                <i class="fas fa-times"></i>
            </button>
        </li>
    `).join('');
}

function removeFavorite(city) {
    let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    favorites = favorites.filter(f => f !== city);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    updateFavoritesList();
}


function renderWeatherData(data) {
    const container = document.getElementById('weatherContainer');
    

    const favButton = document.createElement('button');
    favButton.id = 'fixedFavoriteBtn';
    favButton.className = 'fixed-favorite-btn';
    favButton.innerHTML = '<i class="fas fa-star"></i> Add to Favorites';
    favButton.onclick = () => addToFavorites(data.location.name);
    

    document.body.appendChild(favButton);

    container.innerHTML = `
        <div class="location-header">
            <h1 class="location-title">${data.location.name}, ${data.location.country}</h1>
            <p class="text-muted">${data.location.region}</p>
        </div>
        ${createSection('Current Weather', createCurrentWeather(data))}
        ${createSection('3-Day Forecast', createForecast(data.forecast.forecastday))}
        ${createSection('Hourly Forecast', createHourly(data.forecast.forecastday[0].hour))}
    `;
}

async function fetchWeather() {
    const city = document.getElementById('cityInput').value;
    if (!city) return showError('Please enter a city name');


    const loader = document.createElement('div');
    loader.className = 'overlay';
    loader.innerHTML = '<div class="loading-spinner"></div>';
    document.body.appendChild(loader);

    try {
        const response = await fetch(
            `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${city}&days=3&aqi=no&alerts=no`
        );
        if (!response.ok) throw new Error('City not found');
        const data = await response.json();
        renderWeatherData(data);
    } catch (error) {
        showError(error.message);
    } finally {
        document.body.removeChild(loader);
    }
}

function createSection(title, content) {
    return `<div class="weather-section"><h2 class="mb-4">${title}</h2>${content}</div>`;
}

function createCurrentWeather(data) {
    const current = data.current;
    return `
        <div class="data-grid">
            ${createDataItem('Last Updated', new Date(current.last_updated_epoch * 1000).toLocaleString(), 'clock')}
            ${createDataItem('Temperature', `${current.temp_c}°C / ${current.temp_f}°F`, 'thermometer-half')}
            ${createDataItem('Feels Like', `${current.feelslike_c}°C / ${current.feelslike_f}°F`, 'temperature-high')}
            ${createDataItem('Condition', `${current.condition.text} <img src="${current.condition.icon}">`, 'cloud')}
            ${createDataItem('Wind', `${current.wind_kph} km/h (${current.wind_dir})`, 'wind')}
            ${createDataItem('Gusts', `${current.gust_kph} km/h`, 'wind')}
            ${createDataItem('Pressure', `${current.pressure_mb} mb / ${current.pressure_in} in`, 'tachometer-alt')}
            ${createDataItem('Precipitation', `${current.precip_mm} mm / ${current.precip_in} in`, 'cloud-rain')}
            ${createDataItem('Humidity', `${current.humidity}%`, 'tint')}
            ${createDataItem('Cloud Cover', `${current.cloud}%`, 'cloud')}
            ${createDataItem('Visibility', `${current.vis_km} km / ${current.vis_miles} mi`, 'eye')}
            ${createDataItem('UV Index', current.uv, 'sun')}
            ${createDataItem('Wind Chill', `${current.windchill_c}°C / ${current.windchill_f}°F`, 'snowflake')}
            ${createDataItem('Heat Index', `${current.heatindex_c}°C / ${current.heatindex_f}°F`, 'fire')}
            ${createDataItem('Dew Point', `${current.dewpoint_c}°C / ${current.dewpoint_f}°F`, 'droplet')}
            ${createDataItem('Day/Night', current.is_day ? 'Day' : 'Night', current.is_day ? 'sun' : 'moon')}
        </div>
    `;
}

function createForecast(forecastDays) {
    return forecastDays.map(day => `
        <div class="weather-section mt-3">
            <h4>${new Date(day.date_epoch * 1000).toLocaleDateString()}</h4>
            <div class="data-grid">
                ${createDataItem('Max Temp', `${day.day.maxtemp_c}°C / ${day.day.maxtemp_f}°F`, 'temperature-high')}
                ${createDataItem('Min Temp', `${day.day.mintemp_c}°C / ${day.day.mintemp_f}°F`, 'temperature-low')}
                ${createDataItem('Avg Temp', `${day.day.avgtemp_c}°C / ${day.day.avgtemp_f}°F`, 'thermometer')}
                ${createDataItem('Condition', `${day.day.condition.text} <img src="${day.day.condition.icon}">`, 'cloud')}
                ${createDataItem('Max Wind', `${day.day.maxwind_kph} km/h`, 'wind')}
                ${createDataItem('Total Precip', `${day.day.totalprecip_mm} mm / ${day.day.totalprecip_in} in`, 'umbrella')}
                ${createDataItem('Avg Visibility', `${day.day.avgvis_km} km / ${day.day.avgvis_miles} mi`, 'eye')}
                ${createDataItem('Avg Humidity', `${day.day.avghumidity}%`, 'tint')}
                ${createDataItem('UV Index', day.day.uv, 'sun')}
                ${createDataItem('Chance of Rain', `${day.day.daily_chance_of_rain}%`, 'cloud-rain')}
                ${createDataItem('Chance of Snow', `${day.day.daily_chance_of_snow}%`, 'snowflake')}
                ${createDataItem('Total Snow', `${day.day.totalsnow_cm} cm`, 'snowman')}
            </div>
        </div>
    `).join('');
}

function createAstro(astro) {
    return `
        <div class="data-grid">
            ${createDataItem('Sunrise', astro.sunrise, 'sun')}
            ${createDataItem('Sunset', astro.sunset, 'moon')}
            ${createDataItem('Moonrise', astro.moonrise, 'moon')}
            ${createDataItem('Moonset', astro.moonset, 'moon')}
            ${createDataItem('Moon Phase', astro.moon_phase, 'moon')}
            ${createDataItem('Moon Illumination', `${astro.moon_illumination}%`, 'moon')}
            ${createDataItem('Sun Status', astro.is_sun_up ? 'Up' : 'Down', 'sun')}
            ${createDataItem('Moon Status', astro.is_moon_up ? 'Up' : 'Down', 'moon')}
        </div>
    `;
}

function createHourly(hours) {
    return `
        <div class="scrollable">
            ${hours.map(hour => `
                <div class="hourly-item">
                    <h5>${new Date(hour.time_epoch * 1000).toLocaleTimeString()}</h5>
                    <div class="data-grid">
                        ${createDataItem('Temp', `${hour.temp_c}°C / ${hour.temp_f}°F`, 'thermometer')}
                        ${createDataItem('Feels Like', `${hour.feelslike_c}°C / ${hour.feelslike_f}°F`, 'temperature-high')}
                        ${createDataItem('Condition', `<img src="${hour.condition.icon}"> ${hour.condition.text}`, 'cloud')}
                        ${createDataItem('Wind', `${hour.wind_kph} km/h ${hour.wind_dir}`, 'wind')}
                        ${createDataItem('Gust', `${hour.gust_kph} km/h`, 'wind')}
                        ${createDataItem('Rain Chance', `${hour.chance_of_rain}%`, 'cloud-rain')}
                        ${createDataItem('Snow Chance', `${hour.chance_of_snow}%`, 'snowflake')}
                        ${createDataItem('Humidity', `${hour.humidity}%`, 'tint')}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function createDataItem(label, value, icon) {
    return `
        <div class="data-item">
            <i class="fas fa-${icon} icon"></i>
            <strong>${label}:</strong> 
            <span class="text-muted">${value}</span>
        </div>
    `;
}

function showError(message) {
    const container = document.getElementById('weatherContainer');
    container.innerHTML = `
        <div class="weather-section">
            <div class="alert alert-danger">${message}</div>
        </div>
    `;
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
}

