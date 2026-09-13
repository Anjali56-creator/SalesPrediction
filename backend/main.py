"""
main.py  --  the FastAPI backend for the Sales Prediction website
=================================================================

This file creates the web API. The React website calls these addresses to get
its data, so that nothing on the website is hard-coded.

    GET  /api/overview       project + dataset summary   (Home page)
    GET  /api/kpis           the KPI cards               (Dashboard page)
    GET  /api/analytics      all the chart data          (Sales Analytics page)
    GET  /api/models         metrics + best model        (Model Comparison page)
    GET  /api/form-options   what to show in the form    (Prediction page)
    POST /api/predict        run one prediction          (Prediction page)

Run it locally with:
    python -m uvicorn backend.main:app --reload --port 8000

In production (Render) it is started with:
    uvicorn backend.main:app --host 0.0.0.0 --port $PORT
"""

import os

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from pydantic import BaseModel, Field

from backend.ml_service import MLService

app = FastAPI(
    title="Sales Prediction API",
    description="Backend for the Comparative Analysis of Sales Prediction mini-project",
    version="1.0.0",
)

# The React website runs on a different address from this API, so browsers
# block the requests by default (the "same-origin policy"). CORS tells the
# browser which website addresses are allowed to call this API.
#
#   * locally     -> the Vite dev server on port 5173
#   * in production -> the Vercel URL, read from the FRONTEND_URL environment
#                    variable (comma-separated if there is more than one)
#   * any *.vercel.app preview URL is also allowed, so preview deployments work
allowed_origins = ["http://localhost:5173", "http://127.0.0.1:5173"]
for url in os.environ.get("FRONTEND_URL", "").split(","):
    url = url.strip().rstrip("/")
    if url:
        allowed_origins.append(url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the trained models once, when the server starts, instead of on every
# request. This is what makes the website fast.
ml = MLService()


# ---------------------------------------------------------------------------
# The shape of the data the prediction form sends us.
# Pydantic checks it automatically and returns a clear error if it is wrong.
# ---------------------------------------------------------------------------
class PredictionRequest(BaseModel):
    quantity: int = Field(..., ge=1, le=500, description="Units ordered")
    msrp: float = Field(..., gt=0, le=1000, description="List price per unit")
    productLine: str
    country: str
    territory: str
    orderDate: str
    model: str


@app.get("/", include_in_schema=False)
def root():
    """Opening the bare backend URL in a browser sends you to the API docs."""
    return RedirectResponse(url="/docs")


@app.get("/api/health")
def health():
    """A simple check that the server is alive."""
    return {"status": "ok", "modelsLoaded": list(ml.models.keys())}


@app.get("/api/overview")
def overview():
    return ml.get_overview()


@app.get("/api/kpis")
def kpis():
    return ml.get_kpis()


@app.get("/api/analytics")
def analytics():
    return ml.get_analytics()


@app.get("/api/models")
def models():
    return ml.get_model_comparison()


@app.get("/api/form-options")
def form_options():
    return ml.get_form_options()


@app.post("/api/predict")
def predict(request: PredictionRequest):
    try:
        return ml.predict(
            quantity=request.quantity,
            msrp=request.msrp,
            product_line=request.productLine,
            country=request.country,
            territory=request.territory,
            order_date=request.orderDate,
            model_name=request.model,
        )
    except ValueError as error:
        # Turns a Python error into a proper HTTP error the website can show.
        raise HTTPException(status_code=400, detail=str(error))
