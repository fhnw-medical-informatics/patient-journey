import functions from './functions.json' assert { type: 'json' };

// Implementations of functions defined in functions.json
// ******************************************************

const showTable = () => {
  return `Data is now displayed in a tabular format.`;
};

const showRecord = (recordID: number) => {
  return `Displaying detailed record of ID: ${recordID}.`;
};

const sort = (field: string, order: 'asc' | 'desc') => {
  return `Data is now sorted by ${field} in ${order}ending order.`;
};

const filter = (
  field: string,
  condition: '>' | '<' | '==' | '!=' | '>=' | '<=',
  value: string
) => {
  return `Data is now filtered by ${field} ${condition} ${value}.`;
};

const group = (field: string) => {
  return `Data is now grouped by ${field}.`;
};

const aggregate = (
  field: string,
  operation: 'avg' | 'sum' | 'count' | 'max' | 'min'
) => {
  return `Data is now aggregated by ${field} with operation ${operation}.`;
};

const plot = (
  type: 'scatter' | 'bar' | 'line',
  x_axis: string,
  y_axis: string
) => {
  return `Data is now plotted as a ${type} plot with ${x_axis} as x-axis and ${y_axis} as y-axis.`;
};

const histogram = (field: string, bin_count: number) => {
  return `A histogram of ${field} with ${bin_count} bins is created.`;
};

const describe = (field: string) => {
  return `Showing basic statistics (mean, median, mode, standard deviation, etc.) for ${field}.`;
};

const correlate = (field1: string, field2: string) => {
  return `Determining the correlation between ${field1} and ${field2}.`;
};

const search = (field: string, value: string) => {
  return `Searching for ${value} in ${field}.`;
};

const replace = (field: string, old_value: string, new_value: string) => {
  return `Replacing ${old_value} with ${new_value} in ${field}.`;
};

const highlight = (
  field: string,
  condition: '>' | '<' | '==' | '!=' | '>=' | '<=',
  value: string
) => {
  return `Highlighting ${field} where ${field} ${condition} ${value}.`;
};

const timeSeriesPlot = (field: string, time_unit: string) => {
  return `Visualizing ${field} over ${time_unit}.`;
};

const zoom = (action: 'in' | 'out', factor: number) => {
  return `Performing zoom ${action} by factor of ${factor}.`;
};

const tooltip = (enable: boolean, fields: string[]) => {
  return `Tooltips are now ${
    enable ? 'enabled' : 'disabled'
  } for fields ${fields.join(', ')}.`;
};

const drillDown = (enable: boolean, level: number) => {
  return `Drill down is now ${
    enable ? 'enabled' : 'disabled'
  } to level ${level}.`;
};

const cluster = (fields: string[], number_of_clusters: number) => {
  return `Finding clusters in data based on fields ${fields.join(
    ', '
  )} with ${number_of_clusters} clusters.`;
};

const trendLine = (field: string, time_unit: string) => {
  return `Analyzing the trend of ${field} over ${time_unit}.`;
};

const detectAnomalies = (field: string, sensitivity: number) => {
  return `Identifying any unusual values in ${field} with sensitivity of ${sensitivity}.`;
};

const reduceDimensions = (
  fields: string[],
  number_of_dimensions: number,
  method: 'PCA' | 't-SNE' | 'UMAP' | 'LLE'
) => {
  return `Reducing the dimensionality of data for fields ${fields.join(
    ', '
  )} to ${number_of_dimensions} dimensions using ${method}.`;
};

const showCorrelationMatrix = (
  fields: string[],
  method: 'Pearson' | 'Spearman' | 'Kendall'
) => {
  return `Displaying correlations among fields ${fields.join(
    ', '
  )} using ${method} method.`;
};

// ******************************************************

export const capabilities = {
  functions,
  implementations: {
    showTable,
    showRecord,
    sort,
    filter,
    group,
    aggregate,
    plot,
    histogram,
    describe,
    correlate,
    search,
    replace,
    highlight,
    timeSeriesPlot,
    zoom,
    tooltip,
    drillDown,
    cluster,
    trendLine,
    detectAnomalies,
    reduceDimensions,
    showCorrelationMatrix,
  },
};
