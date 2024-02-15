import functions from './functions.json' assert { type: 'json' };

// Implementations of functions defined in functions.json
// ******************************************************

const showSuggestions = (
  suggestion1: string,
  suggestion2: string,
  suggestion3: string
) => {
  return `Displayed the following suggestions to the user: ${suggestion1}, ${suggestion2}, ${suggestion3}.`;
};

// ******************************************************

type FunctionImplementations = {
  [key: string]: (...args: any[]) => any;
};

export const capabilities = {
  functions,
  implementations: {
    showSuggestions,
  } as FunctionImplementations,
};
