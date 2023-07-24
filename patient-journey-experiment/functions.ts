import functions from './functions.json' assert { type: 'json' };

// Implementations of functions defined in functions.json
// ******************************************************

const get_current_weather = (location: string, unit = 'fahrenheit') => {
  // Hard coded to return the same weather
  const weatherInfo = {
    location,
    temperature: '72',
    unit,
    forecast: ['sunny', 'windy'],
  };

  return JSON.stringify(weatherInfo);
};

// ******************************************************

export const capabilities = {
  functions,
  implementations: {
    get_current_weather,
  },
};
