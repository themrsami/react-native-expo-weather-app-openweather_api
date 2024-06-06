import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, Image, FlatList } from 'react-native';
import * as Location from 'expo-location';
import axios from 'axios';

const Weather = () => {
  const [errorMsg, setErrorMsg] = useState(null);
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [date, setDate] = useState(new Date());

  const API_KEY = '4add09540acc238efe0993fd3c2b2494';

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied');
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`;
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`;

        const [weatherResponse, forecastResponse] = await Promise.all([
          axios.get(weatherUrl),
          axios.get(forecastUrl)
        ]);

        console.log('Weather:', weatherResponse.data);
        console.log('Forecast:', forecastResponse.data);

        setWeather(weatherResponse.data);
        setForecast(forecastResponse.data.list.slice(0, 8)); // Get the forecast for the next 5 periods (3 hours each)
      } catch (error) {
        console.error('Error fetching weather data:', error);
        setErrorMsg('Error fetching weather data. Please check your network connection and API key.');
      }
    })();

    const timerID = setInterval(() => {
      setDate(new Date());
    }, 1000);

    return () => {
      clearInterval(timerID);
    };
  }, []);

  if (errorMsg) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{errorMsg}</Text>
      </View>
    );
  }

  if (!weather || !forecast) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  const getGreeting = () => {
    const hour = date.getHours();
    if (hour < 12) {
      return 'Morning, Usama';
    } else if (hour < 18) {
      return 'Afternoon, Usama';
    } else {
      return 'Evening, Usama';
    }
  };

  return (
      <View style={styles.container}>
        <Text style={styles.greeting}>{getGreeting()}</Text>
        <Text style={styles.date}>{date.toLocaleString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true })}</Text>
        <Image source={{ uri: `https://cdn2.iconfinder.com/data/icons/weather-flat-14/64/weather02-512.png` }} style={{ width: 120, height: 120 }} />
        <Text style={styles.location}>{weather.name}, {weather.sys.country}</Text>
        <Text style={styles.temperature}>{weather.main.temp}°C</Text>
        <Text style={styles.weather}>{weather.weather[0].description}</Text>
        <View style={styles.additionalInfo}>
          <Text style={styles.infoText}>Feels like: {weather.main.feels_like}°C</Text>
          <Text style={styles.infoText}>Humidity: {weather.main.humidity}%</Text>
          <Text style={styles.infoText}>Wind Speed: {weather.wind.speed} m/s</Text>
        </View>
        <FlatList
          horizontal
          data={forecast}
          keyExtractor={(item) => item.dt.toString()}
          renderItem={({ item }) => (
            <View style={styles.forecastItem}>
              <Text style={styles.forecastDate}>{new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'long', hour: 'numeric', minute: 'numeric', hour12: true })}</Text>
              <Text style={styles.forecastTemp}>{item.main.temp}°C</Text>
              <Text style={styles.infoText}>{item.weather[0].description}</Text>
              <Text style={styles.infoText}>Humidity: {item.main.humidity}%</Text>
            </View>
          )}
        />
      </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: '20%',
    alignItems: 'center',
    backgroundColor: 'darkslateblue',
    width: '100%',
  },
  date: {
    fontSize: 24,
    color: '#ffffff',
    marginBottom: 10,
    textAlign: 'center',
  },
  location: {
    fontSize: 36,
    color: '#ffffff',
    marginBottom: 10,
    textAlign: 'center',
  },
  temperature: {
    fontSize: 48,
    color: '#ffffff',
    marginBottom: 10,
    textAlign: 'center',
  },
  weather: {
    fontSize: 24,
    color: '#ffffff',
    marginBottom: 20,
    textAlign: 'center',
  },
  additionalInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 10,
    padding: 20,
    margin: 10,
  },
  infoText: {
    fontSize: 18,
    color: '#ffffff',
    marginBottom: 10,
  },
  errorText: {
    fontSize: 24,
    color: '#ffffff',
    textAlign: 'center',
  },
  forecastItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 10,
    padding: 10,
    margin: 4,
    alignItems: 'center',
    width: 200,
    height: 160,
  },
  forecastDate: {
    fontSize: 20,
    color: '#ffffff',
    marginBottom: 10,
  },
  forecastTemp: {
    fontSize: 28,
    color: '#ffffff',
    marginTop: 10,
    backgroundColor: 'darkslateblue',
    borderRadius: 10,
    paddingHorizontal: 30,
    paddingVertical: 5,
  },
  greeting: {
    fontSize: 36,
    color: '#ffffff',
    marginBottom: 10,
    textAlign: 'center',
  },
});

export default Weather;
