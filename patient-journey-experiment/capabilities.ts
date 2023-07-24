const functions = [
  {
    name: 'get_current_weather',
    description: 'Get the current weather in a given location',
    parameters: {
      type: 'object',
      properties: {
        location: {
          type: 'string',
          description: 'The city and state, e.g. San Francisco, CA',
        },
        unit: { type: 'string', enum: ['celsius', 'fahrenheit'] },
      },
      required: ['location'],
    },
  },
];

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

export const capabilities = {
  functions,
  implementations: {
    get_current_weather,
  },
};
