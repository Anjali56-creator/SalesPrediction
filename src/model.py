"""
=============================================================================
 Comparative Analysis of Sales Prediction Using Machine Learning Techniques
=============================================================================

This single script does the whole project, step by step:

    Step 1  : Load the dataset
    Step 2  : Understand the dataset
    Step 3  : Handle missing values
    Step 4  : Remove duplicate records
    Step 5  : Convert date / categorical columns
    Step 6  : Feature engineering
    Step 7  : Exploratory Data Analysis (EDA) graphs
    Step 8  : Train-test split
    Step 9  : Train Linear Regression, Decision Tree, Random Forest
    Step 10 : Generate predictions
    Step 11 : Evaluate with MAE, MSE, RMSE, R2
    Step 12 : Build the comparison table
    Step 13 : Pick the best model
    Step 14 : Plot actual vs predicted sales
    Step 15 : Plot model performance comparison
    Step 16 : Plot Random Forest feature importance
    Step 17 : Print the final conclusion

Run it with:   python src/model.py
All graphs go to outputs/graphs/ and all result files go to outputs/results/
=============================================================================
"""

import os

import joblib
import matplotlib
import numpy as np
import pandas as pd
import seaborn as sns

matplotlib.use("Agg")  # draw graphs to files instead of opening windows
import matplotlib.pyplot as plt

from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeRegressor

# Same random number every run, so results are reproducible during the viva.
RANDOM_STATE = 42

# Folder paths (built from this file's location so the script runs from anywhere)
PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_FILE = os.path.join(PROJECT_DIR, "dataset", "sales.csv")
GRAPH_DIR = os.path.join(PROJECT_DIR, "outputs", "graphs")
RESULT_DIR = os.path.join(PROJECT_DIR, "outputs", "results")

os.makedirs(GRAPH_DIR, exist_ok=True)
os.makedirs(RESULT_DIR, exist_ok=True)

# A common look for every graph
sns.set_theme(style="whitegrid")
plt.rcParams["figure.dpi"] = 110


def save_graph(filename):
    """Save the current matplotlib figure into outputs/graphs/ and close it."""
    path = os.path.join(GRAPH_DIR, filename)
    plt.tight_layout()
    plt.savefig(path)
    plt.close()
    print("   saved graph ->", os.path.relpath(path, PROJECT_DIR))


print("=" * 75)
print(" COMPARATIVE ANALYSIS OF SALES PREDICTION USING MACHINE LEARNING")
print("=" * 75)


# ---------------------------------------------------------------------------
# STEP 1 : LOAD THE DATASET
# ---------------------------------------------------------------------------
# encoding="latin-1" is needed because some customer names contain accented
# characters (for example "Reims Collectables") that plain UTF-8 cannot read.
print("\n[STEP 1] Loading the dataset ...")
sales_data = pd.read_csv(DATA_FILE, encoding="latin-1")
print("   Dataset loaded successfully.")


# ---------------------------------------------------------------------------
# STEP 2 : UNDERSTAND THE DATASET
# ---------------------------------------------------------------------------
print("\n[STEP 2] Understanding the dataset ...")
print("   Number of rows    :", sales_data.shape[0])
print("   Number of columns :", sales_data.shape[1])
print("\n   First 5 rows (a few important columns only):")
print(sales_data[["ORDERDATE", "PRODUCTLINE", "QUANTITYORDERED", "MSRP",
                  "COUNTRY", "SALES"]].head())
print("\n   Summary of the target column SALES:")
print(sales_data["SALES"].describe())


# ---------------------------------------------------------------------------
# STEP 3 : HANDLE MISSING VALUES
# ---------------------------------------------------------------------------
print("\n[STEP 3] Handling missing values ...")
missing_before = sales_data.isnull().sum()
print("   Columns that have missing values:")
print(missing_before[missing_before > 0])

# TERRITORY looks empty for about 1000 rows, but those rows are actually the
# North America region written as the text "NA". Pandas mistakes "NA" for
# "Not Available", so we simply put the text back.
sales_data["TERRITORY"] = sales_data["TERRITORY"].fillna("NA")

# ADDRESSLINE2, STATE and POSTALCODE are address details. They are not used to
# predict sales, so we drop them instead of filling them with fake values.
sales_data = sales_data.drop(columns=["ADDRESSLINE2", "STATE", "POSTALCODE"])

print("   Total missing values after cleaning:", sales_data.isnull().sum().sum())


# ---------------------------------------------------------------------------
# STEP 4 : REMOVE DUPLICATE RECORDS
# ---------------------------------------------------------------------------
print("\n[STEP 4] Removing duplicate records ...")
rows_before = len(sales_data)
sales_data = sales_data.drop_duplicates()
print("   Duplicates removed:", rows_before - len(sales_data))
print("   Rows remaining    :", len(sales_data))


# ---------------------------------------------------------------------------
# STEP 5 : CONVERT DATE AND CATEGORICAL COLUMNS
# ---------------------------------------------------------------------------
print("\n[STEP 5] Converting the date column ...")
sales_data["ORDERDATE"] = pd.to_datetime(sales_data["ORDERDATE"])
print("   Date range:", sales_data["ORDERDATE"].min().date(),
      "to", sales_data["ORDERDATE"].max().date())


# ---------------------------------------------------------------------------
# STEP 6 : FEATURE ENGINEERING
# ---------------------------------------------------------------------------
# Feature engineering means creating new, more useful columns from existing
# ones so that the models can learn better patterns.
print("\n[STEP 6] Creating new features ...")

sales_data["ORDER_YEAR"] = sales_data["ORDERDATE"].dt.year
sales_data["ORDER_MONTH"] = sales_data["ORDERDATE"].dt.month
sales_data["ORDER_QUARTER"] = sales_data["ORDERDATE"].dt.quarter
sales_data["ORDER_DAYOFWEEK"] = sales_data["ORDERDATE"].dt.dayofweek  # 0 = Monday
print("   Created: ORDER_YEAR, ORDER_MONTH, ORDER_QUARTER, ORDER_DAYOFWEEK")

# ---- Two columns are deliberately NOT used as features --------------------
#
# 1) PRICEEACH  -> In this dataset the price is capped at 100. Also, for many
#                  rows SALES is simply QUANTITYORDERED * PRICEEACH. Feeding
#                  the price in would let the model "cheat" by doing a
#                  multiplication instead of actually learning sales patterns.
#
# 2) DEALSIZE   -> This column is created FROM the sales amount itself
#                  (below 3000 = Small, 3000-7000 = Medium, above 7000 = Large).
#                  Using it would be DATA LEAKAGE: giving the model a hint that
#                  would not exist for a genuinely new order.
#
# Removing them keeps the comparison between the three models honest.
print("   Excluded PRICEEACH (price is capped) and DEALSIZE (leaks the target).")

# Features we will actually use to predict sales
numeric_features = [
    "QUANTITYORDERED",    # how many units the customer ordered
    "MSRP",               # manufacturer's suggested retail price of the product
    "ORDER_YEAR",
    "ORDER_MONTH",
    "ORDER_QUARTER",
    "ORDER_DAYOFWEEK",
]
categorical_features = [
    "PRODUCTLINE",        # product category, e.g. Motorcycles, Classic Cars
    "COUNTRY",            # where the order came from
    "TERRITORY",          # bigger region: EMEA, APAC, NA, Japan
]
target_column = "SALES"


# ---------------------------------------------------------------------------
# STEP 7 : EXPLORATORY DATA ANALYSIS (EDA)
# ---------------------------------------------------------------------------
print("\n[STEP 7] Creating EDA graphs ...")

# 7.1 How are sales values spread out?
plt.figure(figsize=(8, 5))
sns.histplot(sales_data["SALES"], bins=40, kde=True, color="#3b7dd8")
plt.title("Distribution of Sales")
plt.xlabel("Sales Amount")
plt.ylabel("Number of Orders")
save_graph("01_sales_distribution.png")

# 7.2 How did total sales change month by month?
monthly_sales = (sales_data.set_index("ORDERDATE")["SALES"]
                 .resample("ME").sum())
plt.figure(figsize=(10, 5))
monthly_sales.plot(marker="o", color="#2e8b57")
plt.title("Monthly Sales Trend Over Time")
plt.xlabel("Month")
plt.ylabel("Total Sales")
save_graph("02_sales_trend_over_time.png")

# 7.3 Which product category earns the most?
category_sales = (sales_data.groupby("PRODUCTLINE")["SALES"]
                  .sum().sort_values(ascending=False))
plt.figure(figsize=(9, 5))
sns.barplot(x=category_sales.values, y=category_sales.index, hue=category_sales.index,
            palette="viridis", legend=False)
plt.title("Total Sales by Product Category")
plt.xlabel("Total Sales")
plt.ylabel("Product Line")
save_graph("03_category_wise_sales.png")

# 7.4 Which countries buy the most? (top 10)
country_sales = (sales_data.groupby("COUNTRY")["SALES"]
                 .sum().sort_values(ascending=False).head(10))
plt.figure(figsize=(9, 5))
sns.barplot(x=country_sales.values, y=country_sales.index, hue=country_sales.index,
            palette="mako", legend=False)
plt.title("Top 10 Countries by Total Sales")
plt.xlabel("Total Sales")
plt.ylabel("Country")
save_graph("04_region_wise_sales.png")

# 7.5 Correlation heatmap: how strongly are the numeric columns related?
correlation_data = sales_data[numeric_features + [target_column]].corr()
plt.figure(figsize=(8, 6))
sns.heatmap(correlation_data, annot=True, fmt=".2f", cmap="coolwarm", center=0)
plt.title("Correlation Heatmap of Numeric Features")
save_graph("05_correlation_heatmap.png")


# ---------------------------------------------------------------------------
# STEP 8 : SPLIT THE DATA INTO TRAINING AND TESTING SETS
# ---------------------------------------------------------------------------
print("\n[STEP 8] Preparing features and splitting the data ...")

# Machine learning models only understand numbers, so text columns such as
# PRODUCTLINE must be converted. pd.get_dummies() creates one 0/1 column for
# each category. This is called ONE-HOT ENCODING.
X = pd.get_dummies(
    sales_data[numeric_features + categorical_features],
    columns=categorical_features,
    drop_first=True,   # drop one column per category to avoid repeated information
)
y = sales_data[target_column]

print("   Number of features after encoding:", X.shape[1])

# 80% of the data is used to teach the models, 20% is kept hidden to test them.
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=RANDOM_STATE
)
print("   Training rows:", len(X_train))
print("   Testing rows :", len(X_test))


# ---------------------------------------------------------------------------
# STEP 9 : TRAIN THE THREE MODELS
# ---------------------------------------------------------------------------
print("\n[STEP 9] Training the models ...")

models = {
    # Fits one straight-line equation through the data.
    "Linear Regression": LinearRegression(),

    # Splits the data into yes/no questions to form a tree of rules.
    # max_depth stops the tree from growing too deep and overfitting.
    "Decision Tree": DecisionTreeRegressor(max_depth=8, random_state=RANDOM_STATE),

    # Builds 200 different decision trees and averages their answers.
    "Random Forest": RandomForestRegressor(
        n_estimators=200, max_depth=12, random_state=RANDOM_STATE
    ),
}

for model_name, model in models.items():
    model.fit(X_train, y_train)
    print("   Trained:", model_name)


# ---------------------------------------------------------------------------
# STEP 10 & 11 : PREDICT AND EVALUATE
# ---------------------------------------------------------------------------
print("\n[STEP 10-11] Predicting on the test set and calculating metrics ...")

predictions = {}   # model name -> predicted sales for the test set
results_rows = []  # one row of metrics per model

for model_name, model in models.items():
    y_pred = model.predict(X_test)
    predictions[model_name] = y_pred

    mae = mean_absolute_error(y_test, y_pred)        # average size of the error
    mse = mean_squared_error(y_test, y_pred)         # average of squared errors
    rmse = np.sqrt(mse)                              # error back in rupees/dollars
    r2 = r2_score(y_test, y_pred)                    # how much variation is explained

    results_rows.append({
        "Model": model_name,
        "MAE": round(mae, 2),
        "MSE": round(mse, 2),
        "RMSE": round(rmse, 2),
        "R2": round(r2, 4),
    })
    print(f"   {model_name:<20} MAE={mae:9.2f}  RMSE={rmse:9.2f}  R2={r2:.4f}")


# ---------------------------------------------------------------------------
# STEP 12 : COMPARISON TABLE
# ---------------------------------------------------------------------------
print("\n[STEP 12] Model comparison table")
results_table = pd.DataFrame(results_rows)
print()
print(results_table.to_string(index=False))

results_csv = os.path.join(RESULT_DIR, "model_comparison.csv")
results_table.to_csv(results_csv, index=False)
print("\n   saved table ->", os.path.relpath(results_csv, PROJECT_DIR))


# ---------------------------------------------------------------------------
# STEP 13 : IDENTIFY THE BEST MODEL
# ---------------------------------------------------------------------------
# The best model is the one with the highest R2 score (it explains the most
# variation in sales). Its RMSE will also be the lowest.
best_row = results_table.loc[results_table["R2"].idxmax()]
best_model_name = best_row["Model"]
print("\n[STEP 13] Best performing model:", best_model_name,
      f"(R2 = {best_row['R2']}, RMSE = {best_row['RMSE']})")


# ---------------------------------------------------------------------------
# STEP 14 : ACTUAL VS PREDICTED SALES
# ---------------------------------------------------------------------------
print("\n[STEP 14] Plotting actual vs predicted sales ...")

# One scatter plot per model. Points close to the red diagonal line mean the
# prediction was close to the real value.
fig, axes = plt.subplots(1, 3, figsize=(16, 5), sharey=True)
for ax, (model_name, y_pred) in zip(axes, predictions.items()):
    ax.scatter(y_test, y_pred, alpha=0.45, s=18, color="#3b7dd8",
               edgecolor="none")
    ax.plot([y_test.min(), y_test.max()], [y_test.min(), y_test.max()],
            color="red", linestyle="--", linewidth=1.5, label="Perfect prediction")
    ax.set_title(model_name)
    ax.set_xlabel("Actual Sales")
    ax.legend(fontsize=8)
axes[0].set_ylabel("Predicted Sales")
fig.suptitle("Actual vs Predicted Sales", fontsize=14)
save_graph("06_actual_vs_predicted.png")

# A line comparison for the best model on the first 60 test orders, which is
# easier to read than a scatter plot during a presentation.
best_predictions = predictions[best_model_name]
plt.figure(figsize=(11, 5))
plt.plot(y_test.values[:60], marker="o", label="Actual Sales")
plt.plot(best_predictions[:60], marker="x", label=f"Predicted ({best_model_name})")
plt.title(f"Actual vs Predicted Sales for 60 Test Orders - {best_model_name}")
plt.xlabel("Test Order Number")
plt.ylabel("Sales Amount")
plt.legend()
save_graph("07_actual_vs_predicted_best_model.png")


# ---------------------------------------------------------------------------
# STEP 15 : MODEL PERFORMANCE COMPARISON GRAPHS
# ---------------------------------------------------------------------------
print("\n[STEP 15] Plotting model performance comparison ...")

fig, axes = plt.subplots(1, 3, figsize=(15, 4.5))
for ax, metric, color in zip(axes, ["MAE", "RMSE", "R2"],
                             ["#e8833a", "#c0504d", "#2e8b57"]):
    sns.barplot(data=results_table, x="Model", y=metric, ax=ax, color=color)
    ax.set_title(metric)
    ax.set_xlabel("")
    ax.tick_params(axis="x", rotation=15)
    for container in ax.containers:
        ax.bar_label(container, fmt="%.2f", fontsize=8)
fig.suptitle("Model Performance Comparison (lower MAE/RMSE is better, higher R2 is better)",
             fontsize=12)
save_graph("08_model_performance_comparison.png")


# ---------------------------------------------------------------------------
# STEP 16 : RANDOM FOREST FEATURE IMPORTANCE
# ---------------------------------------------------------------------------
print("\n[STEP 16] Plotting Random Forest feature importance ...")

random_forest = models["Random Forest"]
# feature_importances_ tells us how much each feature helped reduce the error.
importance = pd.Series(random_forest.feature_importances_, index=X.columns)
top_features = importance.sort_values(ascending=False).head(12)

plt.figure(figsize=(9, 6))
sns.barplot(x=top_features.values, y=top_features.index, hue=top_features.index,
            palette="crest", legend=False)
plt.title("Top 12 Most Important Features (Random Forest)")
plt.xlabel("Importance Score")
plt.ylabel("Feature")
save_graph("09_random_forest_feature_importance.png")

importance_csv = os.path.join(RESULT_DIR, "feature_importance.csv")
importance.sort_values(ascending=False).to_csv(
    importance_csv, header=["Importance"])
print("   saved table ->", os.path.relpath(importance_csv, PROJECT_DIR))


# ---------------------------------------------------------------------------
# SAVE THE TRAINED MODELS (used by the Streamlit dashboard app.py)
# ---------------------------------------------------------------------------
model_bundle = {
    "models": models,
    "feature_columns": list(X.columns),
    "numeric_features": numeric_features,
    "categorical_features": categorical_features,
    "results_table": results_table,
    "best_model_name": best_model_name,
    # The choices shown in the dashboard dropdowns
    "options": {col: sorted(sales_data[col].dropna().unique().tolist())
                for col in categorical_features},
    # The real test-set values, so the website can draw the actual vs
    # predicted chart using exactly these numbers instead of retraining.
    "y_test": y_test.tolist(),
    "test_predictions": {name: preds.tolist()
                         for name, preds in predictions.items()},
    # Sensible min/max/default for each number box on the prediction form
    "numeric_ranges": {
        col: {"min": float(sales_data[col].min()),
              "max": float(sales_data[col].max()),
              "mean": float(sales_data[col].mean())}
        for col in ["QUANTITYORDERED", "MSRP"]
    },
}
bundle_path = os.path.join(RESULT_DIR, "trained_models.pkl")
joblib.dump(model_bundle, bundle_path)
print("   saved models ->", os.path.relpath(bundle_path, PROJECT_DIR))

# Save the cleaned dataset so the dashboard does not repeat the cleaning work.
clean_path = os.path.join(RESULT_DIR, "cleaned_sales.csv")
sales_data.to_csv(clean_path, index=False)
print("   saved clean data ->", os.path.relpath(clean_path, PROJECT_DIR))


# ---------------------------------------------------------------------------
# STEP 17 : FINAL CONCLUSION
# ---------------------------------------------------------------------------
linear_r2 = results_table.loc[results_table["Model"] == "Linear Regression", "R2"].iloc[0]
tree_r2 = results_table.loc[results_table["Model"] == "Decision Tree", "R2"].iloc[0]
forest_r2 = results_table.loc[results_table["Model"] == "Random Forest", "R2"].iloc[0]

conclusion = f"""
{"=" * 75}
 FINAL CONCLUSION
{"=" * 75}

 Linear Regression  ->  R2 = {linear_r2}
 Decision Tree      ->  R2 = {tree_r2}
 Random Forest      ->  R2 = {forest_r2}

 BEST MODEL: {best_model_name}
 (MAE = {best_row['MAE']}, MSE = {best_row['MSE']}, RMSE = {best_row['RMSE']}, R2 = {best_row['R2']})

 Why this result makes sense:

 * Random Forest performed best. It trains many different decision trees on
   slightly different samples of the data and averages their answers. The
   mistakes of individual trees cancel each other out, so the final prediction
   is both more accurate and more stable than any single model here.

 * Linear Regression came second. It assumes sales rise in a straight line as
   quantity and price rise. Since sales really are close to
   quantity x price, a straight-line model already captures a large part of
   the pattern, which is why it does respectably well. What it cannot capture
   is the multiplying effect between the two, so it still loses to the forest.

 * Decision Tree came last, which is a genuinely useful result to discuss.
   A single tree predicts a constant value for every order that lands in the
   same leaf, so it produces a "staircase" of predictions instead of a smooth
   line. It also memorises the particular training rows it saw, so it does not
   generalise as well to new orders. This is exactly the weakness that Random
   Forest fixes by averaging many trees together.

 * The lesson of the comparison: a single tree is NOT automatically better
   than a simple linear model. It is the combination of many trees that wins.

 Practical meaning: the best model's RMSE of about {best_row['RMSE']} means the
 typical prediction is off by roughly that amount, compared with an average
 order value of about {sales_data['SALES'].mean():.0f}.
{"=" * 75}
"""
print(conclusion)

with open(os.path.join(RESULT_DIR, "conclusion.txt"), "w", encoding="utf-8") as f:
    f.write(conclusion)

print("All done. Check the outputs/ folder for graphs and result files.")
