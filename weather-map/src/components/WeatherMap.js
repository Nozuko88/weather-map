import React,{useState} from "react";
import {MapContainer, TileLayer, Marker, useMapEvents} from "react-leaflet"; // Import necessary components from React Leaflet
import "leaflet/dist/leaflet.css"; // Import Leaflet CSS for map styling


const WEATHER_API_KEY = "2389972d3345e6c3fb82b511b262dd70"; //API Key to apen map

const WeatherMap = () => {
    // State variables for storing position, weather data, city search input, and dark mode toggle
    const [position, setPosition] = useState([0, 0]); // Defauly map center is at [0, 0]
    const [weather, setWeather] = useState(null); // Holds the weather data fetched from the API
    const [city, setCity] = useState(""); // Holds city name input by the user
    const [darkMode, setDarkMode] = useState(false); // Boolean to toggle between dark and light mode


    // Function to fetch weather data based on latitude and longitude
    const fetchWeather = async (lat, lon) => {
        try {
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`
            );
            const data = await response.json(); // Parse the JSON response
            setWeather(data); // Update the weather state with the fetched data
        } catch (error){
            console.error("Error fetching weather data", error); // Log error if fetching fails
        }
    };


    //Function to handle city search input 
    const handleSearch = async () => {
        if (city) { // Only proceed if the city input is not empty 
            try {
                const response = await fetch(
                    `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${WEATHER_API_KEY}&units=metric`
                );
                const data = await response.json();
                if (data.cod === 200) { // If the city is found 
                    const { lat, lon} = data.coord; // Extract latitude and longitude from thye response
                    setPosition([lat, lon]); // Update the map center with the citys coordinates
                    fetchWeather(lat, lon); // Fetch weather data for the selected city
                } else {
                    alert("City not found!"); // Show an alert if the is not found
                }
            } catch(error) {
                console.error("Error searching for city", error); // Log error if fetching fails
            }
        }
    };


    // Custom hook to handle map click events 
    const MapClickHandler = () => {
        useMapEvents({
            click: (e) => {
                const { lat, lng } = e.latlng; // Get the latitude and longitude of the clicked location
                setPosition([lat, lng]); // Update the position state with the clicked location
                fetchWeather(lat, lng); // Fetch weather data for the clicked location
            },
        });
        return null; // No UI rendered for this handler
    };


    // Function to toggle between dark mode and light mmode 
    const toggleDarkMode = () => {
        setDarkMode(!darkMode); // Toggle the dark mode state
    };


    return (
        <div style={{ backgroundColor: darkMode ? "#121212" : "#fff", color: darkMode ? "#fff" : "#000"}}>
            <h1>Weather Map</h1>
            <div style={{ marginBottom: "10px"}}>
                <input
                type="text"
                placeholder="Search for a city"
                value={city}
                onChange={(e) => setCity(e.target.value)} // Update the city state as user types
                />
                <button onClick={handleSearch}>Search</button>
                <button onClick={toggleDarkMode}>
                    {darkMode ? "Light Mode" : "Dark Mode"}
                </button>
            </div>

            {/*Map container displaying the map */}
            <MapContainer center={position} zoom={2} style={{height: "500px", width: "100%"}}>
                <TileLayer url={darkMode ? "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"}
                />
                <MapClickHandler />
                {position && <Marker position={position} />}
             
            </MapContainer>


             {/* Display weather data if available */}
            {weather && weather.main ?(
                <div>
                    <h2>Weather Details</h2>
                    <p>Location: {weather.name}</p>
                    <p>Temperature: {weather.main.temp}°C</p>
                    <p>Weather: {weather.weather[0].description}</p>
                    <img src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}.png`}
                    alt={weather.weather[0].description}
                    />
                    <p>Humidity: {weather.main.humidity}%</p> {/* Humidity*/}
                    <p>Wind Speed: {weather.wind.speed} m/s</p> {/* Wind Speed*/}
                </div>
            ): (
                <p>No weather data available</p>
            )}
        </div>
    );
};

export default WeatherMap;