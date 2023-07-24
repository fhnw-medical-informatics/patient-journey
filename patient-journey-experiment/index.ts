// deno run --unstable --allow-net --allow-read --allow-write --allow-env index.ts <experiment-name>

// @ts-ignore
import { OpenAI } from 'https://deno.land/x/openai/mod.ts';
// @ts-ignore
import { load } from 'https://deno.land/std/dotenv/mod.ts';

// @ts-ignore
import { capabilities } from './capabilities.ts';
// @ts-ignore
import { messages as initialMessages } from './context.ts';

// @ts-ignore
const experimentName = Deno.args[0] ?? 'default';

const { OPENAI_API_KEY, OPENAI_ORG } = await load();

// const configuration = new Configuration({
//   organization: OPENAI_ORG,
//   apiKey: OPENAI_API_KEY,
// });

const openai = new OpenAI(OPENAI_API_KEY);
const model = 'gpt-4-0613';

const { functions, implementations } = capabilities;

const messages = [...initialMessages];

const startChatCompletion = async () => {
  try {
    // Step 1: send the conversation and available functions to GPT
    const initialResponse = await openai.createChatCompletion({
      model,
      messages,
      functions,
      function_call: 'auto',
    });

    const responseMessage = initialResponse.choices[0].message;

    console.log('First response', responseMessage);

    // Step 2: check if GPT wanted to call a function
    if (responseMessage && responseMessage.function_call) {
      // Step 3: call the function
      const functionName = responseMessage.function_call.name;
      const functionArgs = JSON.parse(responseMessage.function_call.arguments);
      const functionResponse = await implementations[functionName](
        ...Object.values(functionArgs)
      );

      // Step 4: send the info on the function call and function response to GPT
      messages.push(responseMessage);
      messages.push({
        role: 'function',
        // @ts-ignore
        name: functionName,
        content: functionResponse,
      });

      const secondResponse = await openai.createChatCompletion({
        model,
        messages,
        functions,
        function_call: 'auto',
      });

      messages.push(secondResponse.choices[0].message);

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

const saveAsJson = async (filename: string, content: any) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(JSON.stringify(content));
  // @ts-ignore
  await Deno.writeFile(`${filename}.json`, data);
};

// Go!
console.log(`Starting experiment ${experimentName}`);
await startChatCompletion();

// Save the context to a file
await saveAsJson(`./experiments/${experimentName}-context`, initialMessages);
// Save the messages to a file
await saveAsJson(`./experiments/${experimentName}-messages`, messages);
// Save the functions to a file
await saveAsJson(`./experiments/${experimentName}-functions`, functions);
