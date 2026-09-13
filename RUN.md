# How to Run the Website

The project has two parts that run at the same time:

| Part | Technology | Address |
|---|---|---|
| **Backend** (the API + machine learning) | FastAPI + scikit-learn | http://localhost:8000 |
| **Frontend** (the website you look at) | React + Vite + Recharts | http://localhost:5173 |

You need **two terminals**, one for each.

---

## First time only — install everything

```bash
# from the project folder: C:\Users\anjal\Downloads\sales_prediction

pip install -r requirements.txt

cd frontend
npm install
cd ..
```

Then train the models once. This creates `outputs/results/trained_models.pkl`,
which the backend loads:

```bash
python src/model.py
```

---

## Every time — start the project

### Terminal 1 — backend

```bash
cd C:\Users\anjal\Downloads\sales_prediction
python -m uvicorn backend.main:app --reload --port 8000
```

Wait until it prints `Application startup complete.`

### Terminal 2 — frontend

```bash
cd C:\Users\anjal\Downloads\sales_prediction\frontend
npm run dev
```

Then open **http://localhost:5173** in your browser.

The small dot at the bottom of the sidebar turns **green** when the website has
successfully connected to the backend, and **red** if the backend is not running.

---

## Checking the backend on its own

FastAPI builds interactive documentation for free. Open:

**http://localhost:8000/docs**

You can try every endpoint there, which is a nice thing to show in a viva.

| Endpoint | What it returns |
|---|---|
| `GET /api/health` | whether the server and models loaded |
| `GET /api/overview` | project and dataset summary (Home page) |
| `GET /api/kpis` | the KPI card numbers (Dashboard page) |
| `GET /api/analytics` | all chart data (Sales Analytics page) |
| `GET /api/models` | metrics, best model, feature importance |
| `GET /api/form-options` | dropdown choices for the prediction form |
| `POST /api/predict` | runs one prediction |

---

## If something goes wrong

**"Backend offline" / red dot**
The backend is not running, or it is on a different port. Start Terminal 1 again
and check it says port 8000.

**`FileNotFoundError: Trained models not found`**
You have not trained the models yet. Run `python src/model.py` once.

**Charts are empty**
Hard-refresh the browser with `Ctrl + Shift + R`.

**Port already in use**
Something else is using 8000 or 5173. Either close it, or start on another port
(`--port 8001` for the backend, `npm run dev -- --port 5174` for the frontend).
If you change the backend port, also update `API_BASE` at the top of
`frontend/src/api.js`.

---

# Deploying to the internet (public URL)

The project is deployed as two pieces, matching the two terminals above:

| Part | Platform | Config file |
|---|---|---|
| Backend (FastAPI + models) | **Render** (free web service) | `render.yaml` |
| Frontend (React + Vite) | **Vercel** | `frontend/vercel.json` |

```text
Browser -> Vercel (React website) -> Render (FastAPI) -> trained models -> dataset
```

## Step 1 - push the code to GitHub

```bash
cd C:\Users\anjal\Downloads\sales_prediction
git remote add origin https://github.com/<your-username>/sales_prediction.git
git push -u origin main
```

## Step 2 - backend on Render

1. Go to https://dashboard.render.com -> **New +** -> **Blueprint**.
2. Connect the GitHub repository. Render reads `render.yaml` automatically.
3. Click **Apply**. The first build takes 3-5 minutes (it installs
   scikit-learn and loads `outputs/results/trained_models.pkl`).
4. Copy the service URL, e.g. `https://sales-prediction-api.onrender.com`,
   and open `<that-url>/api/health` - it should print `{"status":"ok", ...}`.

## Step 3 - frontend on Vercel

1. Go to https://vercel.com/new and import the same GitHub repository.
2. Set **Root Directory** to `frontend`. Vercel detects Vite automatically.
3. Under **Environment Variables** add:
   `VITE_API_URL` = the Render URL from step 2 (no trailing slash).
4. Click **Deploy**. Copy the website URL, e.g.
   `https://sales-prediction.vercel.app`.

## Step 4 - tell the backend about the frontend (CORS)

On Render -> your service -> **Environment**, set
`FRONTEND_URL` = the Vercel URL from step 3, then **Save** (Render redeploys).
Any `*.vercel.app` address is already allowed by the backend, so this step
only matters if you attach a custom domain.

## Notes

* Render's free plan puts the server to sleep after 15 minutes without
  traffic. The first visit after that takes ~1 minute to wake up; the website
  shows a "backend may be starting" message and a refresh link meanwhile.
* `VITE_API_URL` is baked into the website at build time. If the backend URL
  ever changes, update the variable on Vercel and click **Redeploy**.
