# Comparative Analysis of Sales Prediction Using Machine Learning Techniques

A college mini-project that predicts the sales amount of a customer order using three
machine-learning regression models and compares their performance to find the most
suitable one.

---

## Problem Statement

Businesses need to know how much revenue an order or a product line is likely to
generate. Guessing leads to two costly mistakes: ordering too much stock (money stuck
in a warehouse) or ordering too little (lost customers). Many different machine-learning
algorithms can predict sales, but they do not all perform equally well on the same data.

**The problem:** which regression algorithm predicts sales most accurately for this
dataset, and why?

## Objective

1. Clean and prepare a real public sales dataset.
2. Train three regression models — Linear Regression, Decision Tree, Random Forest.
3. Evaluate all three using MAE, MSE, RMSE and R².
4. Compare them in a single table and identify the best performer.
5. Visualise the data, the predictions and the model comparison.
6. Explain *why* the winning model won.

---

## Dataset

| | |
|---|---|
| **Name** | Sample Sales Data (public Kaggle dataset) |
| **File** | `dataset/sales.csv` |
| **Rows** | 2,823 order lines |
| **Columns** | 25 |
| **Period** | 6 January 2003 – 31 May 2005 |
| **Target** | `SALES` — revenue of the order line |

### Columns used as features

| Feature | Type | Meaning |
|---|---|---|
| `QUANTITYORDERED` | Numeric | Units ordered |
| `MSRP` | Numeric | Manufacturer's suggested retail price |
| `ORDER_YEAR` | Engineered | Year taken from the order date |
| `ORDER_MONTH` | Engineered | Month — captures festive-season demand |
| `ORDER_QUARTER` | Engineered | Quarter of the year |
| `ORDER_DAYOFWEEK` | Engineered | Day of week (0 = Monday) |
| `PRODUCTLINE` | Categorical | Product category (7 types) |
| `COUNTRY` | Categorical | Customer country (19 countries) |
| `TERRITORY` | Categorical | Region — EMEA, APAC, NA, Japan |

After one-hot encoding the three categorical columns, the models see **33 features**.

### Two columns deliberately excluded — and why

This is the most important data-preparation decision in the project.

**1. `DEALSIZE` — removed because of data leakage.**
Checking the data shows the ranges do not overlap at all:

| DEALSIZE | Min SALES | Max SALES |
|---|---:|---:|
| Small | 482.13 | 2,999.97 |
| Medium | 3,002.40 | 6,996.42 |
| Large | 7,016.31 | 14,082.80 |

`DEALSIZE` is simply the answer itself put into buckets. Using it would give a near-perfect
score that means nothing, because for a genuinely new order we would not know the deal
size before knowing the sales.

**2. `PRICEEACH` — removed because it is capped and too direct.**
The column is capped at 100 (1,304 of 2,823 rows sit exactly at the cap), and for 1,519 rows
`SALES` is literally `QUANTITYORDERED × PRICEEACH`. Feeding it in would reduce the task to a
multiplication, and all three models would score near 1.00 — making the comparison useless.
We use the uncapped `MSRP` instead.

### Missing values

| Column | Missing | What we did |
|---|---:|---|
| `TERRITORY` | 1,074 | **Not really missing.** These rows are the North America region written as the text `"NA"`, which pandas mistakes for *Not Available*. We put the text back. |
| `ADDRESSLINE2` | 2,521 | Dropped — postal address detail, irrelevant to sales. |
| `STATE` | 1,486 | Dropped — same reason. |
| `POSTALCODE` | 76 | Dropped — same reason. |

Duplicate records: **0 found** (checked with `drop_duplicates()`).

---

## Technologies Used

| Technology | Purpose |
|---|---|
| Python 3.11 | Programming language |
| pandas | Loading and cleaning the data |
| NumPy | Numerical calculations |
| Matplotlib | Plotting graphs |
| Seaborn | Better-looking statistical graphs |
| scikit-learn | Machine-learning models and metrics |
| joblib | Saving the trained models to disk |
| **FastAPI** | The backend web API that serves the models |
| **Uvicorn** | The server that runs FastAPI |
| **React + Vite** | The website the user actually sees |
| **Recharts** | Interactive charts on the website |
| Streamlit | An alternative simple dashboard (`app.py`) |

## Machine Learning Models

| Model | How it works in one line | Why we chose it |
|---|---|---|
| **Linear Regression** | Fits one straight-line equation through the data. | The simplest possible baseline — every other model must beat it to justify its complexity. |
| **Decision Tree Regression** | Splits the data with a series of yes/no questions to form a tree of rules. | Can capture non-linear patterns that a straight line cannot, and the rules are easy to read. |
| **Random Forest Regression** | Builds 200 different decision trees and averages their answers. | Averaging cancels out the mistakes of individual trees, usually giving the best accuracy and stability. |

Model settings used: `DecisionTreeRegressor(max_depth=8)`,
`RandomForestRegressor(n_estimators=200, max_depth=12)`, `random_state=42` throughout so the
results are reproducible.

---

## Methodology

```
1. Load dataset            ->  read sales.csv (latin-1 encoding)
2. Understand dataset      ->  shape, info, summary statistics
3. Handle missing values   ->  restore "NA" territory, drop address columns
4. Remove duplicates       ->  drop_duplicates()
5. Convert date column     ->  ORDERDATE to datetime
6. Feature engineering     ->  year, month, quarter, day-of-week
                           ->  exclude DEALSIZE (leakage) and PRICEEACH (capped)
7. EDA                     ->  5 graphs (distribution, trend, category, region, correlation)
8. Train-test split        ->  80% train (2,258 rows) / 20% test (565 rows)
9. Train models            ->  Linear Regression, Decision Tree, Random Forest
10. Predict                ->  predict on the unseen test set
11. Evaluate               ->  MAE, MSE, RMSE, R2
12. Comparison table       ->  outputs/results/model_comparison.csv
13. Best model             ->  highest R2
14. Actual vs predicted    ->  scatter plots + line plot
15. Performance comparison ->  bar charts of MAE, RMSE, R2
16. Feature importance     ->  from the Random Forest
17. Conclusion             ->  outputs/results/conclusion.txt
```

## Evaluation Metrics

| Metric | Full name | What it tells us | Better when |
|---|---|---|---|
| **MAE** | Mean Absolute Error | The average size of the mistake, in sales units. Easiest to explain. | Lower |
| **MSE** | Mean Squared Error | Average of the squared mistakes. Punishes large errors much more heavily. | Lower |
| **RMSE** | Root Mean Squared Error | Square root of MSE, so it is back in sales units and directly comparable to MAE. | Lower |
| **R²** | R-squared / Coefficient of Determination | The fraction of the variation in sales the model explains. 1.0 is perfect, 0 is no better than always guessing the average. | Higher |

---

## Results

These are the **actual measured values** produced by running `python src/model.py`
on the 565-row test set.

| Model | MAE | MSE | RMSE | R² |
| ----------------- | --------: | ------------: | -------: | -----: |
| Linear Regression | 709.68 | 1,342,382.90 | 1,158.61 | 0.6925 |
| Decision Tree | 722.46 | 1,470,391.31 | 1,212.60 | 0.6631 |
| **Random Forest** | **646.58** | **1,130,070.81** | **1,063.05** | **0.7411** |

### Best model: Random Forest Regression

It wins on every single metric — lowest MAE, lowest MSE, lowest RMSE and highest R².
It explains **74.11%** of the variation in sales, and its typical prediction is off by about
**1,063** against an average order value of about **3,554**.

### Random Forest feature importance

| Feature | Importance |
|---|---:|
| MSRP | 0.491 |
| QUANTITYORDERED | 0.348 |
| ORDER_MONTH | 0.039 |
| ORDER_YEAR | 0.027 |
| ORDER_DAYOFWEEK | 0.022 |

`MSRP` and `QUANTITYORDERED` together do about **84%** of the work. This matches business
common sense: revenue is mostly price × quantity. The remaining features add smaller
seasonal and regional refinements.

### Conclusion — why these results happened

**Random Forest performed best.** It trains 200 decision trees on slightly different samples of
the data and averages their answers. The individual trees each make different mistakes, and
averaging cancels those mistakes out. That gives predictions which are both more accurate and
more stable than any single model here.

**Linear Regression came second.** Sales are roughly price × quantity, and a straight-line model
already captures a good part of that relationship — which is why a very simple model scores a
respectable 0.6925. What it fundamentally cannot capture is the *multiplying* effect between
price and quantity, or seasonal jumps, so it falls behind the forest.

**A single Decision Tree came last**, which is a genuinely useful result to discuss. A tree
predicts one constant value for every order that lands in the same leaf, so its predictions form
a "staircase" instead of a smooth line — this is clearly visible in
`outputs/graphs/06_actual_vs_predicted.png`. It also fits the peculiarities of the particular
training rows more than the general pattern. That is exactly the weakness Random Forest fixes.

**The key lesson of this comparative analysis:** a single decision tree is *not* automatically
better than a simple linear model. It is the **combination of many trees** that wins.

---

## Project Structure

```
sales_prediction/
│
├── dataset/
│   └── sales.csv                        # the public sales dataset
│
├── notebooks/
│   └── sales_prediction.ipynb           # step-by-step notebook with explanations
│
├── src/
│   └── model.py                         # the complete pipeline as one script
│
├── outputs/
│   ├── graphs/                          # all 9 generated graphs
│   │   ├── 01_sales_distribution.png
│   │   ├── 02_sales_trend_over_time.png
│   │   ├── 03_category_wise_sales.png
│   │   ├── 04_region_wise_sales.png
│   │   ├── 05_correlation_heatmap.png
│   │   ├── 06_actual_vs_predicted.png
│   │   ├── 07_actual_vs_predicted_best_model.png
│   │   ├── 08_model_performance_comparison.png
│   │   └── 09_random_forest_feature_importance.png
│   └── results/
│       ├── model_comparison.csv         # the comparison table
│       ├── feature_importance.csv
│       ├── conclusion.txt
│       ├── cleaned_sales.csv
│       └── trained_models.pkl           # saved models used by the dashboard
│
├── backend/                             # the web API
│   ├── main.py                          # FastAPI routes
│   └── ml_service.py                    # loads the trained models
│
├── frontend/                            # the React website
│   ├── index.html
│   ├── package.json
│   └── src/
│       ├── App.jsx                      # header nav + the sections in order
│       ├── api.js                       # every call to the backend
│       ├── theme.js                     # chart colour palette
│       ├── styles.css                   # design tokens + all styling
│       ├── components/Common.jsx        # section heading, figure, loading, error, useApi
│       └── sections/                    # one file per section of the page
│           ├── Hero.jsx                 #    title + headline result
│           ├── Overview.jsx             # 01 project overview + pipeline
│           ├── Methodology.jsx          # 02 dataset, features, models, metrics
│           ├── Insights.jsx             # 03 sales analytics charts
│           ├── Comparison.jsx           # 04 model comparison
│           └── Predict.jsx              # 05 live prediction form
│
├── app.py                               # Streamlit dashboard (alternative)
├── README.md
├── RUN.md                               # how to start the website
├── VIVA.md                              # 37 viva questions with answers
└── requirements.txt
```

---

## The Website

A full React dashboard sits on top of the machine learning, with five sections:
**Home → Dashboard → Sales Analytics → Model Comparison → Sales Prediction**.

### How the parts fit together

```
  src/model.py                  trains the 3 models ONCE and saves them
        │                       to outputs/results/trained_models.pkl
        ▼
  backend/ml_service.py         LOADS that file (it does not retrain)
        │
        ▼
  backend/main.py               exposes the data as a web API on port 8000
        │   ▲
        │   │  fetch() / POST
        ▼   │
  frontend/src/api.js           the website's only link to the backend
        │
        ▼
  React pages                   draw the KPIs, charts, table and form
```

The important point for the viva: because the backend **loads the same saved
models** rather than training its own, the website and the report can never
disagree. Nothing on the website is typed in by hand.

### How the prediction flow works

1. The user fills in the form on the **Sales Prediction** page. The dropdown
   choices were fetched from `GET /api/form-options`, so they always match the
   real categories in the dataset.
2. Pressing **Predict Sales** sends the values as JSON to `POST /api/predict`.
3. FastAPI checks the values with a Pydantic model (for example, quantity must
   be between 1 and 500) and returns a clear error if they are wrong.
4. `ml_service.predict()` builds a one-row DataFrame, one-hot encodes it, and
   calls `reindex()` so the columns are in exactly the same order the models saw
   during training. **Without this reindex step the prediction would be wrong.**
5. All three models predict, and the result is sent back as JSON.
6. The website shows the chosen model's number in large type, plus all three
   side by side so you can see how much they disagree.

---

## How to Run the Project

### 1. Install the required libraries

```bash
pip install -r requirements.txt
```

### 2. Run the complete analysis

```bash
python src/model.py
```

This prints every step to the screen and fills `outputs/graphs/` and `outputs/results/`.
It takes about 10 seconds.

### 3. Open the notebook (recommended for the viva)

```bash
jupyter notebook notebooks/sales_prediction.ipynb
```

Run the cells one by one — each has a markdown explanation above it.

### 4. Launch the website (two terminals)

**Terminal 1 — backend** (from the project folder):

```bash
python -m uvicorn backend.main:app --reload --port 8000
```

**Terminal 2 — frontend**:

```bash
cd frontend
npm install      # first time only
npm run dev
```

Then open **http://localhost:5173**.

| | |
|---|---|
| **Frontend URL** | http://localhost:5173 |
| **Backend URL** | http://localhost:8000 |
| **API docs** | http://localhost:8000/docs |

Full details and troubleshooting are in **[RUN.md](RUN.md)**.

### 5. Optional — the simpler Streamlit dashboard

```bash
streamlit run app.py
```

Then open the link it prints (usually `http://localhost:8501`). The dashboard has three tabs:

- **Sales Trends** — monthly trend, category-wise and country-wise sales, sample data
- **Model Comparison** — the comparison table, bar charts and all project graphs
- **Predict Sales** — enter quantity, MSRP, product line, country, territory and date, and get
  a predicted sales amount from all three models side by side

> Run `python src/model.py` before `streamlit run app.py`, because the dashboard loads the
> trained models that the script saves.

---

## Future Scope

1. **Add advertising and discount data.** This dataset has no marketing spend column. Real
   discount and advertising figures would very likely push R² well above 0.75.
2. **Time-series forecasting.** Right now we predict the value of a single order. Predicting
   *next month's total sales* would need time-aware models such as ARIMA or Prophet.
3. **Hyperparameter tuning.** `GridSearchCV` could search for better `max_depth` and
   `n_estimators` values instead of the sensible fixed values used here.
4. **Cross-validation.** K-fold cross-validation would give a more reliable score than a single
   80/20 split.
5. **More models.** Gradient Boosting or XGBoost often beat Random Forest on tabular data.
6. **Deployment.** The dashboard could be hosted on Streamlit Cloud so anyone can use it, and
   connected to a live sales database instead of a CSV file.

---

## Viva Preparation

See **[VIVA.md](VIVA.md)** for 25 likely viva questions with simple, speakable answers.
