library(ggplot2)
library(readr)
library(dplyr)
library(randomForest)  # For Random Forest
library(rpart)         # For Decision Trees
library(e1071)         # For SVM

# set working directory (relative path)
setwd("~/coding/data-analytics/assignments/assignment 6")

# =====================================================================
# Exploratory Data Analysis & Cleaning
# =====================================================================

census <- read.csv("data/adult.data", header = FALSE, strip.white = TRUE, na.strings = c("?", " ?"))

# Assign column names based on the adult.names file
colnames(census) <- c("age", "workclass", "fnlwgt", "education", "education_num",
                      "marital_status", "occupation", "relationship", "race", "sex",
                      "capital_gain", "capital_loss", "hours_per_week", "native_country", "income")

# Remove rows with missing values
census_clean <- na.omit(census)

# Convert character columns to factors
categorical_cols <- c("workclass", "education", "marital_status", "occupation", 
                      "relationship", "race", "sex", "native_country", "income")
census_clean[categorical_cols] <- lapply(census_clean[categorical_cols], as.factor)

summary(census_clean)

# Plot 1: Overall Income Distribution
ggplot(census_clean, aes(x = income, fill = income)) +
  geom_bar() +
  labs(title = "Distribution of Income", x = "Income Level", y = "Count") 

# Plot 2: Age vs. Income
ggplot(census_clean, aes(x = age, fill = income)) +
  geom_histogram(binwidth = 5, position = "dodge", color="black") +
  labs(title = "Age Distribution Grouped by Income", x = "Age", y = "Count")

# Plot 3: Hours Per Week vs. Income (Boxplot for outliers)
ggplot(census_clean, aes(x = income, y = hours_per_week, fill = income)) +
  geom_boxplot() +
  labs(title = "Hours Worked Per Week by Income Level", x = "Income Level", y = "Hours Per Week")

# Plot 4: Age vs. Hours Per Week (Scatter Plot)
ggplot(census_clean, aes(x = age, y = hours_per_week, color = income)) +
  geom_point(alpha = 0.2) +
  labs(title = "Scatter Plot: Age vs. Hours Worked Per Week",
       x = "Age", 
       y = "Hours Per Week") +
  scale_color_manual(values = c("<=50K" = "#E69F00", ">50K" = "#56B4E9")) +
  theme_minimal() +
  guides(color = guide_legend(override.aes = list(alpha = 1, size = 3)))

# Plot 5: Education vs. Income
census_clean$education <- reorder(census_clean$education, census_clean$education_num)

ggplot(census_clean, aes(x = education, fill = income)) +
  geom_bar(color = "black") +
  labs(title = "Income Distribution by Educational Attainment", 
       x = "Education Level", 
       y = "Count") +
  theme(axis.text.x = element_text(angle = 45, hjust = 1))

# =====================================================================
# Model Development, Validation and Optimization
# =====================================================================

set.seed(42)

N <- nrow(census_clean)
train_size <- sample(N, 0.7 * N)

train_data <- census_clean[train_size, ]
test_data <- census_clean[-train_size, ]

# Custom Evaluation Function
eval_metrics <- function(actual, predicted, label) {
  cm <- table(Actual = actual, Predicted = predicted)
  print(paste("--- Contingency Table for", label, "---"))
  print(cm)
  
  # accuracy
  acc <- sum(diag(cm)) / sum(cm)
  
  # precision + recall (Assuming ">50K" is the second column/row)
  precision <- cm[2,2] / sum(cm[,2])
  recall <- cm[2,2] / sum(cm[2,])
  f1 <- 2 * (precision * recall) / (precision + recall)
  
  cat("\nMetrics for", label, ":\n")
  cat("Accuracy:", round(acc, 4), "\n")
  cat("Precision (>50K):", round(precision, 4), "\n")
  cat("Recall (>50K):", round(recall, 4), "\n")
  cat("F1 Score:", round(f1, 4), "\n\n")
  
  return(c(Accuracy = acc, Precision = precision, Recall = recall, F1 = f1))
}


model_formula <- income ~ age + education_num + race + sex + hours_per_week

# ------------------------------------------
# Linear Regression (Baseline)
# ------------------------------------------
train_data$income_numeric <- ifelse(train_data$income == ">50K", 1, 0)
model_formula.A <- income_numeric ~ age
model_formula.B <- income_numeric ~ education_num
model_formula.C <- income_numeric ~ race
model_formula.D <- income_numeric ~ sex
model_formula.E <- income_numeric ~ hours_per_week

lm_model.A <- lm(model_formula.A, data = train_data)
summary(lm_model.A)

lm_model.B <- lm(model_formula.B, data = train_data)
summary(lm_model.B)

lm_model.C <- lm(model_formula.C, data = train_data)
summary(lm_model.C)

lm_model.D <- lm(model_formula.D, data = train_data)
summary(lm_model.D)

lm_model.E <- lm(model_formula.E, data = train_data)
summary(lm_model.E)

# ------------------------------------------
# Model 1: Decision Tree
# ------------------------------------------
dt_model <- rpart(model_formula, data = train_data, method = "class")
dt_pred <- predict(dt_model, test_data, type = "class")
dt_metrics <- eval_metrics(test_data$income, dt_pred, "Decision Tree")

# ------------------------------------------
# Model 2: Random Forest
# ------------------------------------------
# ntree = 100 to save processing time, exactly like your assignment 5
rf_model <- randomForest(model_formula, data = train_data, ntree = 100, importance = TRUE)
rf_pred <- predict(rf_model, test_data)
rf_metrics <- eval_metrics(test_data$income, rf_pred, "Random Forest")

# Check which variables the Random Forest found most important
varImpPlot(rf_model, main="Random Forest Variable Importance")

# ------------------------------------------
# Model 3: Support Vector Machine
# ------------------------------------------
svm_model <- svm(model_formula, 
                 data = train_data, 
                 kernel = 'linear', 
                 cost = 1) # Standard cost parameter

# Predict on test data
svm_pred <- predict(svm_model, test_data)

# Evaluate using your custom metrics function
svm_metrics <- eval_metrics(test_data$income, svm_pred, "Support Vector Machine")

# =====================================================================
# Model Comparisons
# =====================================================================
results <- data.frame(
  Model = c("Decision Tree", "Random Forest", "Support Vector Machine"),
  Accuracy = c(dt_metrics["Accuracy"], rf_metrics["Accuracy"], svm_metrics["Accuracy"]),
  F1_Score = c(dt_metrics["F1"], rf_metrics["F1"], svm_metrics["F1"])
)

results
