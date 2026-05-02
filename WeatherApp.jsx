import { useState } from "react";
import "./WeatherApp.css";

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [unit, setUnit] = useState("C");

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
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,weathercode,windspeed_10m,winddirection_10m&timezone=auto`      );
      const weatherData = await weatherResponse.json();

      setWeather(weatherData.hourly);
    } catch (error) {
      console.error(error);
      alert("Error fetching weather");
    }
  };

const today = new Date().toISOString().split("T")[0];

const todayHours = weather
  ? weather.time
      .map((time, index) => ({
        time,
        temp: weather.temperature_2m[index],
        code: weather.weathercode[index],
        wind: weather.windspeed_10m[index],
        dir: weather.winddirection_10m[index],
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

  const getWeatherIcon = (code) => {
  if (code === 0) return "☀️"; 
  if (code <= 2) return "🌤️"; 
  if (code === 3) return "☁️"; 
  if (code >= 45 && code <= 48) return "🌫️"; 
  if (code >= 51 && code <= 67) return "🌧️"; 
  if (code >= 71 && code <= 77) return "❄️"; 
  if (code >= 95) return "⛈️";
  return "❓";
};
  const getWindDir = (deg) => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(deg / 22.5) % 16;
    return directions[index];
  };
  
  return (
  <div className="app">
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
              <span>{getWeatherIcon(hour.code)}</span>
              <p>{convertWind(hour.wind)} {unit === 'C' ? 'km/h' : 'mph'} {getWindDir(hour.dir)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);
}

export default App;