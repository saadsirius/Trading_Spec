import { setupServer } from 'msw/node';
import { alpacaHandlers } from './handlers/alpaca';
import { openaiHandlers } from './handlers/openai';

export const server = setupServer(...alpacaHandlers, ...openaiHandlers);
