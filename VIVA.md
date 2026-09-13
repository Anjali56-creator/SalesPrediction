# Viva Questions and Answers

**Project:** Comparative Analysis of Sales Prediction Using Machine Learning Techniques

Every answer below is written the way you can actually *speak* it in the viva.
Where a number is quoted, it is the real number produced by this project.

---

### Key numbers to memorise

| | |
|---|---|
| Dataset | Sample Sales Data, 2,823 rows, 25 columns, 2003–2005 |
| Split | 80% train (2,258 rows) / 20% test (565 rows) |
| Features used | 33 after one-hot encoding |
| Linear Regression | MAE 709.68 · RMSE 1,158.61 · R² 0.6925 |
| Decision Tree | MAE 722.46 · RMSE 1,212.60 · R² 0.6631 |
| **Random Forest (best)** | **MAE 646.58 · RMSE 1,063.05 · R² 0.7411** |
| Top 2 features | MSRP (0.49) and QUANTITYORDERED (0.35) |

---

## Section A — About the project

### 1. What is sales prediction?

Sales prediction means using past sales data to estimate how much a business will sell in the
future. In my project, I predict the **revenue of a single customer order** from details such as
how many units were ordered, the list price of the product, the product category, the country
and the time of year.

### 2. Why is sales prediction useful?

It helps a business make decisions before money is spent. If a company knows how much it will
sell, it can keep the right amount of stock, plan staff and delivery, set realistic revenue
targets, and decide which product lines deserve more marketing. Without prediction, a company
either over-stocks — money stuck in a warehouse — or under-stocks and loses customers.

### 3. What is the objective of your project?

My objective is not just to predict sales, but to **compare** three regression algorithms —
Linear Regression, Decision Tree and Random Forest — on the same dataset using the same
metrics, and to find out which one is most suitable and explain why.

### 4. Which dataset did you use and why?

I used the publicly available **Sample Sales Data** dataset — 2,823 order lines from 2003 to
2005. I chose it because it has all the features a sales prediction problem needs: date,
product, category, quantity, price, country and region, with the sales amount as the target.
It is also large enough to train on but small enough to explain fully in a viva.

### 5. Why did you choose regression and not classification?

Because the thing I am predicting — the sales amount — is a **continuous number** like 2,871.00.
Regression predicts numbers. Classification predicts categories such as "high sales" or
"low sales". Since my answer is a number, regression is the correct family of algorithms.

---

## Section B — About the models

### 6. Why Linear Regression?

Linear Regression fits one straight-line equation through the data, of the form
`Sales = m₁ × quantity + m₂ × price + ... + c`. I chose it as my **baseline**. It is the simplest
model available, so every more complex model must beat it to justify its complexity. It also
trains instantly and its coefficients are easy to interpret.

### 7. Why Decision Tree Regression?

A Decision Tree splits the data by asking a series of yes/no questions — for example
"is MSRP above 80?", then "is quantity above 40?" — until it reaches a leaf, and it predicts the
average sales of the training orders in that leaf. I chose it because it can capture
**non-linear patterns** that a straight line cannot, and because its rules are human-readable.

### 8. Why Random Forest Regression?

A Random Forest builds **many decision trees** — 200 in my project — each on a slightly
different random sample of the data and of the features, and then averages all their answers.
Individual trees each make different mistakes, and averaging cancels those mistakes out. I
chose it because this usually gives better accuracy and much more stability than a single tree.

### 9. Why did you not use LSTM or Neural Networks?

Three reasons. First, my dataset has only 2,823 rows — neural networks need far more data to
beat simpler models. Second, LSTM is designed for sequential time-series forecasting, but I am
predicting the value of individual independent orders, not a sequence. Third, the objective of
the project is a clear **comparative analysis** of interpretable regression models; adding a
black-box model would add complexity without adding insight.

### 10. What is an ensemble method?

An ensemble means combining several models to get a better result than any one of them alone.
Random Forest is an ensemble — it combines 200 decision trees by averaging. The idea is that
the individual errors are random and in different directions, so they cancel out when averaged,
while the genuine pattern that all trees agree on survives.

---

## Section C — About the metrics

### 11. What is MAE?

MAE is **Mean Absolute Error** — the average size of the mistake, ignoring whether the
prediction was too high or too low. My best model's MAE is 646.58, which means that on average
its prediction is off by about 647. It is the easiest metric to explain because it is in the
same units as sales.

### 12. What is MSE?

MSE is **Mean Squared Error** — we take each mistake, square it, and take the average. Squaring
means a large mistake counts much more heavily than a small one. Its drawback is that the unit
is *squared* sales, so the number 1,130,070 has no direct business meaning.

### 13. What is RMSE?

RMSE is **Root Mean Squared Error** — simply the square root of MSE. Taking the square root
brings the value back into normal sales units, so it can be compared directly with MAE. My best
model's RMSE is 1,063.05.

### 14. What is R² Score?

R² tells us **what fraction of the variation in sales the model explains**. A score of 1.0 is a
perfect model, and 0 means the model is no better than always guessing the average sales. My
Random Forest scored 0.7411, meaning it explains about 74% of the variation in sales.

### 15. Which metric is better and why?

It depends on the purpose, so I look at all four.

- **R²** is best for *comparing models*, because it is a fraction between 0 and 1 and does not
  depend on the scale of the data.
- **RMSE** is best for *reporting accuracy to a business*, because it is in rupees or dollars.
- **MAE** is best when you want a simple, honest average error.

In my project all four agreed — Random Forest won on every one of them — which makes the
conclusion very safe.

### 16. Why is your RMSE larger than your MAE?

RMSE is always greater than or equal to MAE, because RMSE squares the errors first and so
penalises large errors more. The gap between them (1,063 versus 647) tells me my model makes a
**few large mistakes** — mostly on very large orders, which is visible in the actual-versus-
predicted graph as the scattered points at the top right.

---

## Section D — About the process

### 17. What is a train-test split and why do we need it?

I split the data into 80% for training and 20% for testing. The models learn only from the
training part; the testing part is hidden from them. This is the only fair way to judge a
model — testing on data the model has already seen is like giving a student the exam paper
beforehand. I used `random_state=42` so the split is the same every time and my results are
reproducible.

### 18. Why do we preprocess data?

Because raw data is messy, and a model is only as good as the data given to it — "garbage in,
garbage out". In my project I had to restore wrongly-read missing values, drop irrelevant
address columns, check for duplicates, convert the date column into a real date type, and
convert text categories into numbers, because scikit-learn models only understand numbers.

### 19. What is feature engineering? Give an example from your project.

Feature engineering means creating new, more useful columns from existing ones. My best example
is the **order date**. A raw date like "24/2/2003" is useless to a model. I extracted the year,
month, quarter and day of the week from it. The month turned out to matter — the sales trend
graph shows a big spike every November, the festive season — and `ORDER_MONTH` became the third
most important feature in the Random Forest.

### 20. What is one-hot encoding and why did you use it?

Machine-learning models only understand numbers, but `PRODUCTLINE` contains text like
"Motorcycles". One-hot encoding creates a separate 0/1 column for each category — so
`PRODUCTLINE_Motorcycles` is 1 for a motorcycle order and 0 otherwise. I used
`pd.get_dummies(..., drop_first=True)`; `drop_first` drops one column per category because it
would be redundant — if all the others are 0, we already know it is the dropped one. After
encoding, my 9 original features became 33 columns.

### 21. How did you handle missing values?

I found four columns with missing values. `ADDRESSLINE2`, `STATE` and `POSTALCODE` are postal
address details that have nothing to do with sales, so I **dropped** them rather than inventing
values. `TERRITORY` was more interesting: about 1,074 rows looked empty, but those rows are
actually the **North America** region written as the text `"NA"`, which pandas mistakes for
"Not Available". So I simply put the text back. That was not real missing data at all — it was a
reading mistake, and catching it is a good example of why you must *understand* your data
before cleaning it.

### 22. Did you find duplicate records?

I checked using `drop_duplicates()` and found **zero** exact duplicates. I still keep the step in
the code, because duplicates would be counted twice during training and would wrongly give those
orders extra importance.

---

## Section E — The important "why" questions

### 23. What is data leakage, and did you face it?

Data leakage is when a feature secretly contains the answer, so the model scores brilliantly in
testing but is useless in the real world. **Yes, I faced it.** The dataset has a `DEALSIZE`
column with values Small, Medium and Large. When I checked, Small was always below 3,000, Medium
was 3,000 to 7,000 and Large was above 7,000 — so `DEALSIZE` is just the sales amount put into
buckets. If I had used it, my R² would have looked near-perfect, but for a genuinely new order I
would not know the deal size before knowing the sales. So I removed it.

I also removed `PRICEEACH`, for a related reason: it is capped at 100 in this dataset, and for
1,519 of the 2,823 rows `SALES` is exactly `quantity × PRICEEACH`. Giving it to the model would
reduce the whole problem to a multiplication, and all three models would score near 1.00 — which
would make my comparison meaningless. I used `MSRP`, the uncapped list price, instead.

### 24. Why did Random Forest perform better than the other two?

Because it **averages many models instead of trusting one**. Each of its 200 trees is trained on
a different random sample, so each makes different mistakes. When you average them, the random
mistakes cancel out but the real pattern — which all the trees agree on — survives. It also
handles the non-linear, multiplying relationship between price and quantity that a straight line
cannot represent. That is why it won on all four metrics.

### 25. Why did the Decision Tree perform *worse* than Linear Regression? Isn't a tree more powerful?

This is my most interesting result, and the answer is no — not automatically.

A single tree gives **one constant prediction** to every order that falls in the same leaf, so
its predictions come out as a staircase rather than a smooth line. You can see this clearly in
my actual-versus-predicted graph — the Decision Tree's points form horizontal bands.

Meanwhile, sales in this dataset are roughly price × quantity, which is a fairly smooth upward
relationship — and that is exactly the kind of pattern a straight line handles well. So Linear
Regression's simplicity is an advantage here, and it scores 0.6925 against the tree's 0.6631.

The lesson of my comparative analysis is that a single decision tree is not automatically better
than a simple linear model — it is the **combination of many trees** that wins.

### 26. What is overfitting? How did you prevent it?

Overfitting is when a model memorises the training data, including its noise, instead of learning
the general pattern. It then performs excellently on training data and badly on new data. It is
like a student memorising answers instead of understanding the subject.

I prevented it in three ways: I kept a 20% test set that the models never saw; I limited the
Decision Tree to `max_depth=8` and the Random Forest to `max_depth=12` so they cannot grow deep
enough to memorise individual rows; and I used Random Forest itself, since averaging many trees
naturally reduces overfitting.

### 27. What is underfitting?

Underfitting is the opposite — the model is too simple to capture the pattern, so it performs
badly on both training and test data. Linear Regression slightly underfits my data, because a
straight line cannot represent the multiplying effect between price and quantity.

### 28. What is feature importance, and what did it tell you?

Feature importance tells us how much each feature helped the Random Forest reduce its error. The
scores add up to 1. In my project `MSRP` scored 0.49 and `QUANTITYORDERED` scored 0.35 — together
about 84% of the total. This matches business common sense: revenue is mostly price × quantity.
The date and country features made up the remaining smaller refinements. It is a good sanity
check that the model learned something sensible and not an accident of the data.

### 29. What does a correlation heatmap show, and what did yours show?

Correlation measures how strongly two numeric columns move together, from -1 to +1. My heatmap
showed that `QUANTITYORDERED` and `MSRP` both have a clear positive correlation with `SALES` —
more units or a costlier product means more revenue. The date features had almost no *linear*
correlation, but the tree models could still use them for seasonal patterns. That is an important
point: correlation only measures *linear* relationships.

### 30. What are the limitations of your project?

I would give four honestly:

1. **No advertising or discount data.** The dataset has no marketing-spend column, which is
   probably the single biggest reason my R² stops at 0.74.
2. **Small and old dataset.** 2,823 rows from 2003–2005 across only three years — not enough to
   learn strong long-term trends.
3. **Single train-test split.** My numbers depend somewhat on which 20% happened to be chosen for
   testing. K-fold cross-validation would give a more reliable estimate.
4. **Order-level, not time-series.** I predict one order at a time; I do not forecast next
   month's total sales, which is what a business would often really want.

### 31. What is the future scope of your project?

Adding real advertising and discount data, which should push accuracy up considerably; using
time-series models like ARIMA or Prophet to forecast monthly totals instead of single orders;
tuning hyperparameters with `GridSearchCV` instead of fixed values; using K-fold cross-validation
for more reliable scores; trying Gradient Boosting or XGBoost, which often beat Random Forest on
tabular data; and deploying the dashboard on Streamlit Cloud connected to a live sales database.

---

## Section F — Quick-fire questions

### 32. Why `random_state=42`?

It fixes the random number generator so the train-test split and the Random Forest's randomness
are identical every time I run the code. That makes my results **reproducible** — I get the exact
same numbers during the viva as in my report. The value 42 itself has no special meaning; any
fixed number works.

### 33. What does `test_size=0.2` mean?

It means 20% of the data is kept aside for testing and 80% is used for training. With 2,823 rows,
that is 565 test rows and 2,258 training rows. 80/20 is the standard choice — enough data to
train properly, enough to test reliably.

### 34. What is `n_estimators=200`?

It is the number of decision trees in the Random Forest. More trees generally means better and
more stable predictions, but slower training. 200 is a good balance for a dataset of this size.

### 35. Why did you use `encoding="latin-1"` when reading the CSV?

Because some customer names in the dataset contain accented European characters, for example
French addresses like "59 rue de l'Abbaye". The default UTF-8 encoding cannot read those bytes
and the file fails to load, so latin-1 is needed.

### 36. Can your model predict sales for a brand-new product?

Only partly. If the new product belongs to one of the seven existing product lines and I know its
MSRP, the model can give a reasonable estimate, because it has learned how price and quantity
drive revenue within that category. But if it is an entirely new *category* the model has never
seen, the prediction would be unreliable — the model can only work with patterns it was trained on.

### 37. How would you improve accuracy without changing the dataset?

By tuning hyperparameters with `GridSearchCV` to find better `max_depth` and `n_estimators`
values; by engineering more features, such as a "days since the first order" column or the
average sales per customer; and by using K-fold cross-validation so I am optimising against a
more reliable score rather than one lucky split.
