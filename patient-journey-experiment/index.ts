// deno run --unstable --allow-net --allow-read --allow-write --allow-env index.ts

// openai library is only used for typing
// @ts-ignore
import { ChatCompletionRequestMessage } from 'openai';
// @ts-ignore
import { OpenAI } from 'https://deno.land/x/openai/mod.ts';

// @ts-ignore
import { load } from 'https://deno.land/std/dotenv/mod.ts';

const { OPENAI_API_KEY, OPENAI_ORG } = await load();

// const configuration = new Configuration({
//   organization: OPENAI_ORG,
//   apiKey: OPENAI_API_KEY,
// });

const openai = new OpenAI(OPENAI_API_KEY);

const systemInstruction =
  'You can answer questions about the wheather in a given location.';

const messages: ChatCompletionRequestMessage[] = [
  {
    role: 'system',
    content: systemInstruction,
  },
  {
    role: 'user',
    content: 'What is the weather in San Francisco?',
  },
];

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

const startChatCompletion = async () => {
  console.log('Starting chat completion');

  try {
    // Step 1: send the conversation and available functions to GPT
    const initialResponse = await openai.createChatCompletion({
      model: 'gpt-4-0613',
      messages,
      functions: functions,
      function_call: 'auto',
    });

    const responseMessage = initialResponse.choices[0].message;

    console.log('First response', responseMessage);

    // Step 2: check if GPT wanted to call a function
    if (responseMessage && responseMessage.function_call) {
      // Step 3: call the function
      const functionArgs = JSON.parse(
        responseMessage.function_call.arguments ?? ''
      );
      const functionResponse = get_current_weather(
        functionArgs.location,
        functionArgs.unit
      );

      // Step 4: send the info on the function call and function response to GPT
      messages.push(responseMessage);
      messages.push({
        role: 'function',
        // @ts-ignore
        name: responseMessage.function_call.name,
        content: functionResponse,
      });

      const secondResponse = await openai.createChatCompletion({
        model: 'gpt-4-0613',
        messages: messages,
        functions: functions,
        function_call: 'auto',
      });

      console.log(
        'Second response',
        secondResponse.choices[0].message?.content
      );
    } else {
      console.log('No function call');
      console.log(responseMessage?.content);
    }
  } catch (error) {
    console.error(error);
  }
};

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

// Go!
startChatCompletion();
