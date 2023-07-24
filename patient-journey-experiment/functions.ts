import functions from './functions.json' assert { type: 'json' };

// Implementations of functions defined in functions.json
// ******************************************************

const sort = (field: string, type: 'asc' | 'desc') => {
  return `Data in the table is now sorted by ${field} in ${type}ending order.`;
};

const filter = (field: string, value: string) => {
  return `Data in the table is now filtered by ${field} with value ${value}.`;
};

// ******************************************************

export const capabilities = {
  functions,
  implementations: {
    sort,
    filter,
  },
};
