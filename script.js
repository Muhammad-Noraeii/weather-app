/**
 * Weather App 
 * Copyright (c) 2020 - 2025 MojoX
 * Developer : Muhammad Noraeii
 * Email : Muhammad.Noraeii@gmail.com
 */
const CONFIG = {
    API_KEY: 'fcc8de7015bbb202209bbf0261babf4c',
    BASE_URL: 'https://api.openweathermap.org/data/2.5',
    UNITS: 'metric',
    CACHE_DURATION: 10 * 60 * 1000, 
    DEFAULT_CITY: 'London'
};

const DOM = (() => {
    const elements = {};
    
    const init = () => {
        elements.weatherContainer = document.getElementById('weather-container');
        elements.loading = document.getElementById('loading');
        elements.errorMessage = document.getElementById('error-message');
        elements.errorText = document.getElementById('error-text');
        
        elements.cityInput = document.getElementById('city-input');
        elements.searchButton = document.getElementById('search-button');
        elements.locationButton = document.getElementById('location-button');
        elements.celsiusBtn = document.getElementById('celsius-btn');
        elements.fahrenheitBtn = document.getElementById('fahrenheit-btn');
        
        elements.cityName = document.getElementById('city-name');
        elements.currentDate = document.getElementById('current-date');
        elements.weatherIcon = document.getElementById('weather-icon');
        elements.temperature = document.getElementById('temperature');
        elements.description = document.getElementById('description');
        elements.tempMax = document.getElementById('temp-max');
        elements.tempMin = document.getElementById('temp-min');
        
        elements.feelsLike = document.getElementById('feels-like');
        elements.humidity = document.getElementById('humidity');
        elements.windSpeed = document.getElementById('wind-speed');
        elements.pressure = document.getElementById('pressure');
        elements.airQuality = document.getElementById('air-quality');
        elements.visibility = document.getElementById('visibility');
        
        elements.forecastContainer = document.getElementById('forecast-container');
        elements.hourlyContainer = document.getElementById('hourly-container');
        
        elements.weatherAlert = document.getElementById('weather-alert');
        elements.alertText = document.getElementById('alert-text');
        
        elements.currentYear = document.getElementById('current-year');
        
        return elements;
    };
    
    return {
        init,
        get: () => elements
    };
})();

const DataCache = (() => {
    const cache = new Map();
    
    const set = (key, data) => {
        cache.set(key, {
            data,
            timestamp: Date.now()
        });
    };
    
    const get = (key) => {
        const item = cache.get(key);
        if (!item) return null;
        
        const isExpired = Date.now() - item.timestamp > CONFIG.CACHE_DURATION;
        if (isExpired) {
            cache.delete(key);
            return null;
        }
        
        return item.data;
    };
    
    const clear = () => cache.clear();
    
    return {
        set,
        get,
        clear
    };
})();

const WeatherIcons = {
    '01d': 'fa-sun',
    '01n': 'fa-moon',
    '02d': 'fa-cloud-sun',
    '02n': 'fa-cloud-moon',
    '03d': 'fa-cloud',
    '03n': 'fa-cloud',
    '04d': 'fa-cloud',
    '04n': 'fa-cloud',
    '09d': 'fa-cloud-showers-heavy',
    '09n': 'fa-cloud-showers-heavy',
    '10d': 'fa-cloud-rain',
    '10n': 'fa-cloud-rain',
    '11d': 'fa-bolt-lightning',
    '11n': 'fa-bolt-lightning',
    '13d': 'fa-snowflake',
    '13n': 'fa-snowflake',
    '50d': 'fa-smog',
    '50n': 'fa-smog',
    
    getIcon: (code) => WeatherIcons[code] || 'fa-cloud'
};

const DateUtils = (() => {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    const formatDate = (date) => {
        const day = daysOfWeek[date.getDay()];
        const month = months[date.getMonth()];
        return `${day}, ${month} ${date.getDate()}, ${date.getFullYear()}`;
    };
    
    const getDayName = (date) => daysOfWeek[date.getDay()];
    
    const updateCurrentYear = () => {
        const elements = DOM.get();
        if (elements.currentYear) {
            elements.currentYear.textContent = new Date().getFullYear();
        }
    };
    
    return {
        formatDate,
        getDayName,
        updateCurrentYear
    };
})();

const UI = (() => {
    const elements = DOM.get();
    
    const showLoading = () => {
        elements.loading.style.display = 'block';
    };
    
    const hideLoading = () => {
        elements.loading.style.display = 'none';
    };
    
    const showError = (message = 'City not found. Please check the spelling or try another location.') => {
        elements.errorText.textContent = message;
        elements.errorMessage.style.display = 'block';
    };
    
    const hideError = () => {
        elements.errorMessage.style.display = 'none';
    };
    
    const showWeather = () => {
        elements.weatherContainer.style.display = 'block';
    };
    
    const hideWeather = () => {
        elements.weatherContainer.style.display = 'none';
    };
    
    const showAlert = (message) => {
        elements.alertText.textContent = message;
        elements.weatherAlert.style.display = 'block';
    };
    
    const hideAlert = () => {
        elements.weatherAlert.style.display = 'none';
    };
    
    const resetState = () => {
        showLoading();
        hideError();
        hideWeather();
        hideAlert();
    };
    
    return {
        showLoading,
        hideLoading,
        showError,
        hideError,
        showWeather,
        hideWeather,
        showAlert,
        hideAlert,
        resetState
    };
})();

const WeatherAPI = (() => {
    const fetchWeatherByCity = async (city) => {
        const cacheKey = `weather:${city.toLowerCase()}`;
        const cachedData = DataCache.get(cacheKey);
        
        if (cachedData) {
            console.log('Using cached weather data for', city);
            return cachedData;
        }
        
        try {
            const url = `${CONFIG.BASE_URL}/weather?q=${encodeURIComponent(city)}&appid=${CONFIG.API_KEY}&units=${CONFIG.UNITS}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`City not found: ${city}`);
            }
            
            const data = await response.json();
            DataCache.set(cacheKey, data);
            return data;
        } catch (error) {
            console.error('Error fetching weather:', error);
            throw error;
        }
    };
    
    const fetchWeatherByCoords = async (lat, lon) => {
        const cacheKey = `weather:${lat},${lon}`;
        const cachedData = DataCache.get(cacheKey);
        
        if (cachedData) {
            console.log('Using cached weather data for coordinates');
            return cachedData;
        }
        
        try {
            const url = `${CONFIG.BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${CONFIG.API_KEY}&units=${CONFIG.UNITS}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error('Unable to fetch weather for this location');
            }
            
            const data = await response.json();
            DataCache.set(cacheKey, data);
            return data;
        } catch (error) {
            console.error('Error fetching weather by coordinates:', error);
            throw error;
        }
    };
    
    const fetchForecast = async (lat, lon) => {
        const cacheKey = `forecast:${lat},${lon}`;
        const cachedData = DataCache.get(cacheKey);
        
        if (cachedData) {
            console.log('Using cached forecast data');
            return cachedData;
        }
        
        try {
            const url = `${CONFIG.BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${CONFIG.API_KEY}&units=${CONFIG.UNITS}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error('Forecast data not available');
            }
            
            const data = await response.json();
            DataCache.set(cacheKey, data);
            return data;
        } catch (error) {
            console.error('Error fetching forecast:', error);
            throw error;
        }
    };
    
    return {
        fetchWeatherByCity,
        fetchWeatherByCoords,
        fetchForecast
    };
})();

const WeatherDisplay = (() => {
    const elements = DOM.get();
    
    const displayWeather = (data) => {
        const currentDate = new Date();
        
        elements.currentDate.textContent = DateUtils.formatDate(currentDate);
        elements.cityName.innerHTML = `<i class="fas fa-map-marker-alt location-icon"></i>${data.name}, ${data.sys.country}`;
        
        const iconCode = data.weather[0].icon;
        const iconClass = WeatherIcons.getIcon(iconCode);
        elements.weatherIcon.innerHTML = `<i class="fas ${iconClass}"></i>`;
        
        elements.temperature.innerHTML = `${Math.round(data.main.temp)}<span class="temp-unit">°C</span>`;
        elements.description.textContent = data.weather[0].description;
        
        elements.feelsLike.textContent = `${Math.round(data.main.feels_like)}°C`;
        elements.humidity.textContent = `${data.main.humidity}%`;
        elements.windSpeed.textContent = `${Math.round(data.wind.speed * 3.6)} km/h`;
        elements.pressure.textContent = `${data.main.pressure} hPa`;
        
        if (data.visibility) {
            elements.visibility.textContent = `${(data.visibility / 1000).toFixed(1)} km`;
        }
        
        elements.tempMax.textContent = `${Math.round(data.main.temp_max)}°C`;
        elements.tempMin.textContent = `${Math.round(data.main.temp_min)}°C`;
        
        if (data.alerts && data.alerts.length > 0) {
            UI.showAlert(data.alerts[0].description);
        } else {
            UI.hideAlert();
        }
        
        UI.hideLoading();
        UI.showWeather();
    };
    
    const displayForecast = (data) => {
        if (!data || !data.list || !data.list.length) return;
        
        const fragment = document.createDocumentFragment();
        
        const dailyData = [];
        const processedDates = new Set();
        const today = new Date().setHours(0, 0, 0, 0);
        
        for (const item of data.list) {
            const date = new Date(item.dt * 1000);
            const dateStr = date.toDateString();
            const itemDay = date.setHours(0, 0, 0, 0);
            
            if (itemDay === today || processedDates.has(dateStr)) continue;
            
            processedDates.add(dateStr);
            dailyData.push(item);
            
            if (dailyData.length >= 5) break;
        }
        
        dailyData.forEach(day => {
            const date = new Date(day.dt * 1000);
            const dayName = DateUtils.getDayName(date);
            const iconCode = day.weather[0].icon;
            const iconClass = WeatherIcons.getIcon(iconCode);
            const temp = Math.round(day.main.temp);
            const description = day.weather[0].description;
            
            const forecastCard = document.createElement('div');
            forecastCard.className = 'forecast-card';
            forecastCard.innerHTML = `
                <div class="forecast-day">${dayName}</div>
                <div class="forecast-icon">
                    <i class="fas ${iconClass}"></i>
                </div>
                <div class="forecast-temp">${temp}°C</div>
                <div class="forecast-desc">${description}</div>
            `;
            
            fragment.appendChild(forecastCard);
        });
        
        elements.forecastContainer.innerHTML = '';
        elements.forecastContainer.appendChild(fragment);
    };
    
    return {
        displayWeather,
        displayForecast
    };
})();

const InputHandler = (() => {
    const validateCity = (city) => {
        return city.length >= 2 && /^[a-zA-Z\s,-]+$/.test(city);
    };
    
    const debounce = (func, delay) => {
        let timeoutId;
        return function(...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                func.apply(this, args);
            }, delay);
        };
    };
    
    return {
        validateCity,
        debounce
    };
})();

const GeoLocation = (() => {
    const getCurrentPosition = () => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported by your browser'));
                return;
            }
            
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            });
        });
    };
    
    return {
        getCurrentPosition
    };
})();

const WeatherApp = (() => {
    const elements = DOM.get();
    
    const loadWeatherByCity = async (city) => {
        if (!city || !InputHandler.validateCity(city)) {
            UI.showError('Please enter a valid city name (minimum 2 characters, letters only)');
            UI.hideLoading();
            return;
        }
        
        UI.resetState();
        
        try {
            const weatherData = await WeatherAPI.fetchWeatherByCity(city);
            WeatherDisplay.displayWeather(weatherData);
            
            const forecastData = await WeatherAPI.fetchForecast(weatherData.coord.lat, weatherData.coord.lon);
            WeatherDisplay.displayForecast(forecastData);
            
            elements.cityInput.value = '';
        } catch (error) {
            UI.showError(error.message || 'City not found. Please check the spelling or try another location.');
            UI.hideLoading();
        }
    };
    
    const loadWeatherByCoords = async () => {
        UI.resetState();
        
        try {
            const position = await GeoLocation.getCurrentPosition();
            const { latitude, longitude } = position.coords;
            
            const weatherData = await WeatherAPI.fetchWeatherByCoords(latitude, longitude);
            WeatherDisplay.displayWeather(weatherData);
            
            const forecastData = await WeatherAPI.fetchForecast(latitude, longitude);
            WeatherDisplay.displayForecast(forecastData);
        } catch (error) {
            let errorMessage = 'Unable to get your location. Please try searching for a city instead.';
            
            if (error.code === 1) {
                errorMessage = 'Location access denied. Please try searching for a city instead.';
            } else if (error.code === 2) {
                errorMessage = 'Location unavailable. Please try searching for a city instead.';
            } else if (error.code === 3) {
                errorMessage = 'Location request timed out. Please try searching for a city instead.';
            }
            
            UI.showError(errorMessage);
            UI.hideLoading();
        }
    };
    
    const init = () => {
        DOM.init();
        const elements = DOM.get();
        
        DateUtils.updateCurrentYear();
        
        const handleSearch = InputHandler.debounce(() => {
            const city = elements.cityInput.value.trim();
            if (city) {
                loadWeatherByCity(city);
            }
        }, 300);
        
        elements.searchButton.addEventListener('click', handleSearch);
        
        elements.cityInput.addEventListener('keyup', (event) => {
            if (event.key === 'Enter') {
                handleSearch();
            }
        });
        
        elements.locationButton.addEventListener('click', loadWeatherByCoords);
        
        elements.celsiusBtn.addEventListener('click', () => {
            elements.celsiusBtn.classList.add('active');
            elements.fahrenheitBtn.classList.remove('active');
            elements.celsiusBtn.setAttribute('aria-pressed', 'true');
            elements.fahrenheitBtn.setAttribute('aria-pressed', 'false');
        });
        
        elements.fahrenheitBtn.addEventListener('click', () => {
            elements.fahrenheitBtn.classList.add('active');
            elements.celsiusBtn.classList.remove('active');
            elements.fahrenheitBtn.setAttribute('aria-pressed', 'true');
            elements.celsiusBtn.setAttribute('aria-pressed', 'false');
        });
        
        window.addEventListener('online', () => {
            UI.showError('Back online! Please try your search again.');
            setTimeout(UI.hideError, 2000);
        });
        
        window.addEventListener('offline', () => {
            UI.showError('No internet connection. Please check your network.');
            UI.hideWeather();
            UI.hideLoading();
        });
        
        loadWeatherByCity(CONFIG.DEFAULT_CITY);
    };
    
    return {
        init
    };
})();

document.addEventListener('DOMContentLoaded', WeatherApp.init);
