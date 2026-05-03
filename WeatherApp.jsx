import { useState } from "react";
import dayBg from "./DayTime.png";
import nightBg from "./Nighttime.png";
import "./WeatherApp.css";

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [unit, setUnit] = useState("C");
  const [isDaytime, setIsDaytime] = useState(true);

  const getWeather = async () => {
    try {
      const locationResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${city}`
      );
      const locationData = await locationResponse.json();

      if (!locationData.results) {
        alert("City not found");
        return;
      }

      const { latitude, longitude } = locationData.results[0];

      
      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=temperature_2m,weathercode,windspeed_10m,winddirection_10m,precipitation_probability,relativehumidity_2m&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`      );
      const weatherData = await weatherResponse.json();

      setWeather(weatherData);
      setIsDaytime(weatherData.current_weather?.is_day === 1);
    } catch (error) {
      console.error(error);
      alert("Error fetching weather");
    }
  };

const parseLocalDate = (dateString) => {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const getTodayForTimezone = (timezone) =>
  new Date().toLocaleDateString("en-CA", { timeZone: timezone });

const today = weather && weather.timezone
  ? getTodayForTimezone(weather.timezone)
  : new Date().toLocaleDateString("en-CA");

const todayHours = weather
  ? weather.hourly.time
      .map((time, index) => ({
        time,
        temp: weather.hourly.temperature_2m[index],
        code: weather.hourly.weathercode[index],
        wind: weather.hourly.windspeed_10m[index],
        dir: weather.hourly.winddirection_10m[index],
        prob: weather.hourly.precipitation_probability[index],
        humidity: weather.hourly.relativehumidity_2m[index],
      }))
      .filter((hour) => hour.time.startsWith(today))
  : [];
  const convertTemp = (temp) => {
    const value = unit === "F" ? (temp * 9) / 5 + 32 : temp;
    return value.toFixed(1);
  };
  const convertWind = (wind) => {
    const value = unit === "F" ? wind * 0.621371 : wind;
    return value.toFixed(1);
  };
  const formatHour = (time) => {
    const h = new Date(time).getHours();
    return (h % 12 || 12) + (h >= 12 ? "PM" : "AM");
  };

  const getWeatherIcon = (code, timeString = null) => {
   
    const isNight = timeString ? (() => {
      const hour = new Date(timeString).getHours();
      return hour >= 18 || hour < 6;
    })() : false;
    
    if (code === 0) return isNight ? "🌙" : "☀️"; 
    if (code <= 2) return isNight ? "☁️" : "🌤️"; 
    if (code === 3) return "☁️"; 
    if (code >= 45 && code <= 48) return "🌫️"; 
    if ((code >= 80 && code <= 82) || (code >= 51 && code <= 67)) return "🌧️"; 
    if ((code >= 85 && code <= 86) || (code >= 71)) return "❄️"; 
    if (code >= 95) return "⛈️"; 
    return "❓";
  };
  const getWindDir = (deg) => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(deg / 22.5) % 16;
    return directions[index];
  };
  const appBackground = {
    backgroundImage: `url(${isDaytime ? dayBg : nightBg})`,
  };

  const weeklyDays = weather ? weather.daily.time.map((time, index) => ({
    time,
    max: weather.daily.temperature_2m_max[index],
    min: weather.daily.temperature_2m_min[index],
    code: weather.daily.weathercode[index],
  })) : [];
  
  return (
  <div className="app" style={appBackground}>
    <div className="card">
      <h1 className="title">Weather App</h1>

      <div className="search">
        <input
          type="text"
          placeholder="Enter city..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />

        <button onClick={getWeather}>Search</button>

        <button onClick={() => setUnit(unit === "C" ? "F" : "C")}>
          °C / °F
        </button>
      </div>

      {weather && (
        <div className="hourly">
          {todayHours.map((hour, i) => (
            <div key={i} className="hour">
              <p>{formatHour(hour.time)}</p>
              <p>{convertTemp(hour.temp)}°{unit}</p>
              <span>{getWeatherIcon(hour.code, hour.time)}</span>
              <p>{convertWind(hour.wind)} {unit === 'C' ? 'km/h' : 'mph'} {getWindDir(hour.dir)}</p>
              <p>Humidity: {hour.humidity}%</p>
              <p>Rain: {hour.prob}%</p>
            </div>
          ))}
        </div>
      )}

      {weather && (
        <div className="weekly">
          <h2>7-Day Forecast</h2>
          {weeklyDays.map((day, i) => (
            <div key={i} className="day">
              <span className="day-name">{i === 0 ? 'Today' : parseLocalDate(day.time).toLocaleDateString('en-US', { weekday: 'short' })}</span>
              <span className="day-icon">{getWeatherIcon(day.code)}</span>
              <span className="day-temps">{convertTemp(day.min)}° - {convertTemp(day.max)}°</span>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);
}

export default App;