# Basic Features

According to: https://chat.openai.com/share/a830e289-3114-494d-b058-db04b83f9008

Display Data:
Show Table: Display the data in a tabular format.
Show Record: View a detailed record of a particular car.

Data Sorting:
Sort (by field, order): E.g., Sort(by model year, desc) or Sort(by mpg, asc).

Data Filtering:
Filter (by field, condition, value): E.g., Filter(by horsepower, >, 200) or Filter(by car type, ==, 'Sedan').

Data Grouping:
Group (by field): E.g., Group(by car type) to see the number of cars of each type.
Aggregate (by field, operation): E.g., Aggregate(by cylinders, avg of mpg) to see the average miles per gallon for each cylinder count.

Visualization:
Plot (type, x-axis, y-axis): E.g., Plot(scatter, displacement, horsepower) or Plot(bar, car type, count).
Histogram (field, bin count): E.g., Histogram(weight, 10 bins).

Data Exploration:
Describe (field): Show basic statistics for a field, e.g., Describe(mpg) to get mean, median, mode, etc. for miles per gallon.
Correlate (field1, field2): E.g., Correlate(weight, mpg) to see how weight correlates with mpg.

Search:
Search (field, value): E.g., Search(car name, 'Mustang') to find all records with 'Mustang' in the car name.

Data Modification:
Replace (field, old value, new value): E.g., Replace(origin, 'USA', 'United States') to update the 'origin' field.

Data Highlighting:
Highlight (field, condition, value): E.g., Highlight(horsepower, >, 250) to visually emphasize cars with more than 250 horsepower.

Time Series (for fields like model year):
Time Series Plot (field, time unit): E.g., Time Series Plot(mpg, by model year).

Interactive Features:
Zoom In/Out (on visualization): Allow users to zoom in or out on a particular section of a plot.
Tooltip (for visualization): Display more information when hovering over a data point in a visualization.
Drill Down (on visualization): Click on a data point or segment in a visualization to see more detailed data.

Data Clustering:
Cluster (fields, number of clusters): E.g., Cluster([mpg, horsepower], 3) to find three distinct clusters based on miles per gallon and horsepower.

Trend Analysis:
Trend Line (field, time unit): E.g., Trend Line(mpg, by model year) to analyze the trend of miles per gallon over model years.

Anomaly Detection:
Detect Anomalies (field): E.g., Detect Anomalies(weight) to identify any unusual weight values that might be outliers.

Dimensionality Reduction:
Reduce Dimensions (fields, number of dimensions): E.g., Reduce Dimensions([mpg, horsepower, weight], 2) for visualization or data simplification purposes.

Correlation Matrix:
Show Correlation Matrix: Display correlations among all variables to identify potential relationships.

# Additional Features

Data Export:
Export (format): E.g., Export(CSV) to download the currently viewed/filtered dataset as a CSV.

Data Import:
Import (format): E.g., Import(CSV) to upload a new dataset in CSV format.

Prediction:
Predict (field to predict, based on fields): E.g., Predict(mpg, based on [cylinders, horsepower]) to predict miles per gallon based on the number of cylinders and horsepower.

Association Rule Mining:
Find Associations (field): E.g., Find Associations(car type) to discover associations like "Sedans are commonly associated with 4 cylinders."

Text Analysis (if there are text fields like car name):
Text Search (text field, keyword): E.g., Text Search(car name, 'Ford').
Topic Extraction (text field): Extract common topics or themes from a textual column.

Classification:
Classify (target field, based on fields): E.g., Classify(car type, based on [mpg, weight, horsepower]) to classify cars into types.

Feature Importance:
Feature Importance (for prediction field): E.g., Feature Importance(mpg) to identify which columns are most influential in predicting miles per gallon.

Time Series Decomposition:
Decompose Time Series (field, time unit): E.g., Decompose Time Series(mpg, by model year) to analyze seasonal, trend, and residual components.

Geospatial Analysis (if applicable):
Geospatial Plot (latitude field, longitude field, value to display): For datasets with location data.

Recommendation (if applicable):
Recommend (based on field): E.g., Recommend(car type, based on user preferences) to suggest similar cars.
