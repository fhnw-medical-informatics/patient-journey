// openai library is only used for typing
// @ts-ignore
import { ChatCompletionRequestMessage } from 'openai';

export const messages: ChatCompletionRequestMessage[] = [
  {
    role: 'system',
    content: 'You can answer questions about the wheather in a given location.',
  },
  {
    role: 'user',
    content: 'What is the weather in San Francisco?',
  },
];
