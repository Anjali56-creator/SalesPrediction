/*
 * Predict.jsx  --  05 · Predict sales
 *
 * The form fields come from the backend, so they always match the features the
 * models were actually trained on. Clicking "Predict Sales" sends the values to
 * POST /api/predict and shows the real number the model returns.
 */

import { useEffect, useState } from "react";

import { formatRupees, getFormOptions, postPrediction } from "../api";
import { ErrorBox, Loading, SectionHead, useApi } from "../components/Common";

export default function Predict() {
  const { data: options, loading, error } = useApi(getFormOptions);

  // What the user has typed into the form.
  const [form, setForm] = useState({
    quantity: 35,
    msrp: 95,
    productLine: "",
    country: "",
    territory: "",
    orderDate: "2005-05-15",
    model: "",
  });

  const [result, setResult] = useState(null);
  const [predicting, setPredicting] = useState(false);
  const [formError, setFormError] = useState(null);

  // Once the options arrive from the backend, fill in sensible defaults.
  useEffect(() => {
    if (!options) return;
    setForm((current) => ({
      ...current,
      productLine: options.categorical.PRODUCTLINE[0],
      country: options.categorical.COUNTRY.includes("USA")
        ? "USA"
        : options.categorical.COUNTRY[0],
      territory: options.categorical.TERRITORY[0],
      model: options.bestModel,
    }));
  }, [options]);

  if (loading || error) {
    return (
      <Shell>
        {loading && <Loading what="the prediction form" />}
        {error && <ErrorBox message={error} />}
      </Shell>
    );
  }

  /* Updates one field whenever the user types or chooses something. */
  function updateField(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setPredicting(true);
    setFormError(null);

    try {
      const response = await postPrediction({
        ...form,
        quantity: Number(form.quantity),
        msrp: Number(form.msrp),
      });
      setResult(response);
    } catch (problem) {
      setFormError(problem.message);
      setResult(null);
    } finally {
      setPredicting(false);
    }
  }

  const quantityRange = options.numeric.QUANTITYORDERED;
  const msrpRange = options.numeric.MSRP;

  return (
    <Shell>
      <div className="predict-layout">
        <div className="form-panel">
          <p className="panel-title">Order details</p>
          <p className="panel-note">
            The fields are exactly the features the models were trained on.
          </p>
          <form onSubmit={handleSubmit}>
            <div className="field-grid">
              <div className="field">
                <label htmlFor="quantity">Quantity ordered</label>
                <input
                  id="quantity"
                  type="number"
                  min="1"
                  max="500"
                  required
                  value={form.quantity}
                  onChange={(e) => updateField("quantity", e.target.value)}
                />
                <span className="hint">
                  Dataset range: {quantityRange.min}–{quantityRange.max}
                </span>
              </div>

              <div className="field">
                <label htmlFor="msrp">MSRP (list price per unit)</label>
                <input
                  id="msrp"
                  type="number"
                  min="1"
                  max="1000"
                  step="1"
                  required
                  value={form.msrp}
                  onChange={(e) => updateField("msrp", e.target.value)}
                />
                <span className="hint">
                  Dataset range: {msrpRange.min}–{msrpRange.max}
                </span>
              </div>

              <div className="field">
                <label htmlFor="productLine">Product line</label>
                <select
                  id="productLine"
                  value={form.productLine}
                  onChange={(e) => updateField("productLine", e.target.value)}
                >
                  {options.categorical.PRODUCTLINE.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label htmlFor="country">Country</label>
                <select
                  id="country"
                  value={form.country}
                  onChange={(e) => updateField("country", e.target.value)}
                >
                  {options.categorical.COUNTRY.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label htmlFor="territory">Territory</label>
                <select
                  id="territory"
                  value={form.territory}
                  onChange={(e) => updateField("territory", e.target.value)}
                >
                  {options.categorical.TERRITORY.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label htmlFor="orderDate">Order date</label>
                <input
                  id="orderDate"
                  type="date"
                  required
                  value={form.orderDate}
                  onChange={(e) => updateField("orderDate", e.target.value)}
                />
                <span className="hint">month affects seasonal demand</span>
              </div>

              <div className="field">
                <label htmlFor="model">Predict using</label>
                <select
                  id="model"
                  value={form.model}
                  onChange={(e) => updateField("model", e.target.value)}
                >
                  {options.models.map((item) => (
                    <option key={item} value={item}>
                      {item}
                      {item === options.bestModel ? "  (best)" : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button className="btn" type="submit" disabled={predicting}>
              {predicting ? "Predicting…" : "Predict Sales"}
            </button>

            {formError && (
              <div className="state error" style={{ marginTop: 16 }}>
                <strong>Prediction failed</strong>
                {formError}
              </div>
            )}
          </form>
        </div>

        <div className="result-panel">
          {result ? (
            <>
              <p className="label">Predicted Sales</p>
              <p className="result-value">{formatRupees(result.prediction)}</p>
              <p className="result-model">
                predicted by <strong>{result.modelUsed}</strong>
                {result.modelUsed === result.bestModel
                  ? " — the best performing model"
                  : ` — note that ${result.bestModel} scored higher on the test data`}
              </p>

              <div className="compare-list">
                <p className="label" style={{ marginBottom: 2 }}>
                  All three models
                </p>
                {Object.entries(result.allPredictions).map(([name, value]) => (
                  <div
                    key={name}
                    className={
                      "compare-row" + (name === result.bestModel ? " is-best" : "")
                    }
                  >
                    <span className="m">
                      {name}
                      {name === result.bestModel ? " ★" : ""}
                    </span>
                    <span className="v">{formatRupees(value)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <p className="label">Predicted Sales</p>
              <p className="empty-result">
                Fill in the order details and press <strong>Predict Sales</strong>.
                <br />
                <br />
                All three models will run on your input, so you can see how much they
                disagree — which is itself a good demonstration of why comparing models
                matters.
              </p>
            </>
          )}
        </div>
      </div>

      <p className="note">
        <strong>How this works:</strong> the browser sends your values to{" "}
        <code>POST /api/predict</code>. The backend one-hot encodes them into the same 33
        columns used in training, reindexes them into the same order, and calls{" "}
        <code>model.predict()</code>. The number you see is the model's real output.
      </p>
    </Shell>
  );
}

/* The section frame around the form, shared by the loading/error/ready states. */
function Shell({ children }) {
  return (
    <section id="predict" className="section">
      <div className="wrap">
        <SectionHead number="05" label="Predict sales">
          Run your own order through the trained models.
        </SectionHead>
        {children}
      </div>
    </section>
  );
}
