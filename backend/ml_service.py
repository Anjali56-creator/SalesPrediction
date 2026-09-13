"""
ml_service.py
=============

This file is the bridge between the machine-learning work and the website.

It does NOT retrain the models. Instead it loads the models that
`src/model.py` already trained and saved into
`outputs/results/trained_models.pkl`.

That is deliberate, and it is an important point for the viva: the website and
the report therefore show exactly the SAME numbers, because they come from the
same single training run. Nothing on the website is typed in by hand.
"""

import os

import joblib
import pandas as pd

# Folder paths, built from this file's location so it works from anywhere
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(BACKEND_DIR)
RESULT_DIR = os.path.join(PROJECT_DIR, "outputs", "results")

BUNDLE_PATH = os.path.join(RESULT_DIR, "trained_models.pkl")
CLEAN_DATA_PATH = os.path.join(RESULT_DIR, "cleaned_sales.csv")


class MLService:
    """Holds the trained models and the cleaned data in memory."""

    def __init__(self):
        # A clear error message is better than a confusing crash later on.
        if not os.path.exists(BUNDLE_PATH):
            raise FileNotFoundError(
                "Trained models not found.\n"
                "Please run this first:   python src/model.py"
            )

        bundle = joblib.load(BUNDLE_PATH)

        self.models = bundle["models"]                       # the 3 trained models
        self.feature_columns = bundle["feature_columns"]     # the 33 encoded columns
        self.numeric_features = bundle["numeric_features"]
        self.categorical_features = bundle["categorical_features"]
        self.results_table = bundle["results_table"]         # the metrics DataFrame
        self.best_model_name = bundle["best_model_name"]
        self.options = bundle["options"]                     # dropdown choices
        self.numeric_ranges = bundle["numeric_ranges"]
        self.y_test = bundle["y_test"]
        self.test_predictions = bundle["test_predictions"]

        self.data = pd.read_csv(CLEAN_DATA_PATH, parse_dates=["ORDERDATE"])

    # -- Section 2 : Dashboard KPI cards ------------------------------------
    def get_kpis(self):
        best = self.results_table[
            self.results_table["Model"] == self.best_model_name
        ].iloc[0]

        return {
            "totalSales": float(self.data["SALES"].sum()),
            "totalOrders": int(len(self.data)),
            "averageSales": float(self.data["SALES"].mean()),
            "bestModel": self.best_model_name,
            "bestR2": float(best["R2"]),
            "bestRMSE": float(best["RMSE"]),
            "productLines": int(self.data["PRODUCTLINE"].nunique()),
            "countries": int(self.data["COUNTRY"].nunique()),
            "dateFrom": self.data["ORDERDATE"].min().strftime("%b %Y"),
            "dateTo": self.data["ORDERDATE"].max().strftime("%b %Y"),
        }

    # -- Section 1 : Home / Overview ----------------------------------------
    def get_overview(self):
        return {
            "rows": int(len(self.data)),
            "featureCount": len(self.feature_columns),
            "numericFeatures": self.numeric_features,
            "categoricalFeatures": self.categorical_features,
            "modelNames": list(self.models.keys()),
            "bestModel": self.best_model_name,
            "dateFrom": self.data["ORDERDATE"].min().strftime("%d %b %Y"),
            "dateTo": self.data["ORDERDATE"].max().strftime("%d %b %Y"),
        }

    # -- Section 3 : Sales Analytics charts ---------------------------------
    def get_analytics(self):
        # Sales over time (monthly totals)
        monthly = self.data.set_index("ORDERDATE")["SALES"].resample("ME").sum()
        sales_over_time = [
            {"month": date.strftime("%b %Y"), "sales": round(float(value), 2)}
            for date, value in monthly.items()
        ]

        # Sales by product category
        category = (self.data.groupby("PRODUCTLINE")["SALES"]
                    .sum().sort_values(ascending=False))
        sales_by_category = [
            {"name": name, "sales": round(float(value), 2)}
            for name, value in category.items()
        ]

        # Sales by region (top 10 countries)
        country = (self.data.groupby("COUNTRY")["SALES"]
                   .sum().sort_values(ascending=False).head(10))
        sales_by_region = [
            {"name": name, "sales": round(float(value), 2)}
            for name, value in country.items()
        ]

        # Sales distribution: count how many orders fall in each price band
        bin_edges = list(range(0, 16001, 2000))
        binned = pd.cut(self.data["SALES"], bins=bin_edges)
        distribution = [
            {"range": f"{interval.left // 1000:.0f}k-{interval.right // 1000:.0f}k",
             "orders": int(count)}
            for interval, count in binned.value_counts().sort_index().items()
        ]

        # Quantity vs Sales and Price(MSRP) vs Sales scatter plots.
        # We send a sample of 400 points so the browser stays fast.
        sample = self.data.sample(n=min(400, len(self.data)), random_state=42)
        quantity_vs_sales = [
            {"quantity": int(q), "sales": round(float(s), 2)}
            for q, s in zip(sample["QUANTITYORDERED"], sample["SALES"])
        ]
        price_vs_sales = [
            {"msrp": float(m), "sales": round(float(s), 2)}
            for m, s in zip(sample["MSRP"], sample["SALES"])
        ]

        return {
            "salesOverTime": sales_over_time,
            "salesByCategory": sales_by_category,
            "salesByRegion": sales_by_region,
            "salesDistribution": distribution,
            "quantityVsSales": quantity_vs_sales,
            "priceVsSales": price_vs_sales,
        }

    # -- Section 4 : Model Comparison ---------------------------------------
    def get_model_comparison(self):
        models = self.results_table.to_dict(orient="records")

        # Actual vs predicted points for the scatter chart (sampled to 300)
        step = max(1, len(self.y_test) // 300)
        actual_vs_predicted = {}
        for model_name, preds in self.test_predictions.items():
            actual_vs_predicted[model_name] = [
                {"actual": round(float(a), 2), "predicted": round(float(p), 2)}
                for a, p in zip(self.y_test[::step], preds[::step])
            ]

        # Feature importance, only available for the Random Forest
        forest = self.models["Random Forest"]
        importance = (pd.Series(forest.feature_importances_,
                                index=self.feature_columns)
                      .sort_values(ascending=False).head(10))
        feature_importance = [
            {"feature": name, "importance": round(float(value), 4)}
            for name, value in importance.items()
        ]

        return {
            "models": models,
            "bestModel": self.best_model_name,
            "actualVsPredicted": actual_vs_predicted,
            "featureImportance": feature_importance,
            "testSize": len(self.y_test),
        }

    # -- Section 5 : Prediction form ----------------------------------------
    def get_form_options(self):
        """Tells the website which input boxes to show and what to put in them."""
        return {
            "categorical": self.options,
            "numeric": self.numeric_ranges,
            "models": list(self.models.keys()),
            "bestModel": self.best_model_name,
        }

    def predict(self, quantity, msrp, product_line, country, territory,
                order_date, model_name):
        """Runs one order through the chosen model and returns the prediction."""
        if model_name not in self.models:
            raise ValueError(f"Unknown model '{model_name}'.")

        date = pd.to_datetime(order_date)

        # Build a one-row table with the same columns used during training.
        new_order = pd.DataFrame([{
            "QUANTITYORDERED": quantity,
            "MSRP": msrp,
            "ORDER_YEAR": date.year,
            "ORDER_MONTH": date.month,
            "ORDER_QUARTER": date.quarter,
            "ORDER_DAYOFWEEK": date.dayofweek,
            "PRODUCTLINE": product_line,
            "COUNTRY": country,
            "TERRITORY": territory,
        }])

        # One-hot encode the text columns exactly as in training, then reindex
        # so the columns are in the same order the models expect. Without this
        # reindex step the prediction would be wrong or would crash.
        encoded = pd.get_dummies(new_order,
                                 columns=self.categorical_features,
                                 drop_first=True)
        encoded = encoded.reindex(columns=self.feature_columns, fill_value=0)

        # Predict with every model, so the user can compare them side by side.
        all_predictions = {
            name: round(float(model.predict(encoded)[0]), 2)
            for name, model in self.models.items()
        }

        return {
            "prediction": all_predictions[model_name],
            "modelUsed": model_name,
            "allPredictions": all_predictions,
            "bestModel": self.best_model_name,
        }
