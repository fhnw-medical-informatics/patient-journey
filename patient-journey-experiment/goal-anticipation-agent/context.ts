// openai library is only used for typing
// @ts-ignore
import { ChatCompletionRequestMessage } from 'openai';

import context from './context.json' assert { type: 'json' };

export const messages = context as unknown as ChatCompletionRequestMessage[];
