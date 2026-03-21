library(ggplot2)
library(readr)
library(dplyr)
library(class)         # For kNN
library(randomForest)  # For Random Forest
library(rpart)         # For Decision Trees

# set working directory (relative path)
setwd("~/coding/data-analytics/assignments/assignment 5")

# read data
nyc_data <- read_csv("NYC_sales.csv")

# clean column names
colnames(nyc_data) <- make.names(colnames(nyc_data))

# create subset of data for Manhattan (Borough == "1")
manhatten_data <- subset(nyc_data, BOROUGH == "1")

# clean data for four variables
manhatten_data$LAND.SQUARE.FEET <- as.numeric(gsub(",", "", manhatten_data$LAND.SQUARE.FEET))
manhatten_data$GROSS.SQUARE.FEET <- as.numeric(gsub(",", "", manhatten_data$GROSS.SQUARE.FEET))
manhatten_data$SALE.PRICE <- as.numeric(gsub(",", "", manhatten_data$SALE.PRICE))
manhatten_data$TOTAL.UNITS <- as.numeric(manhatten_data$TOTAL.UNITS)

manhatten_data <- na.omit(manhatten_data[, c("NEIGHBORHOOD", "SALE.PRICE", "LAND.SQUARE.FEET", "GROSS.SQUARE.FEET", "TOTAL.UNITS")])

# keep only valid positive values
manhatten_data <- manhatten_data[
  manhatten_data$SALE.PRICE > 100 &
  manhatten_data$LAND.SQUARE.FEET > 0 &
  manhatten_data$GROSS.SQUARE.FEET > 0 &
  manhatten_data$TOTAL.UNITS > 0,
]

# scale data for better visualization
manhatten_data$logSalePrice <- log10(manhatten_data$SALE.PRICE)
manhatten_data$logLandSqFt <- log10(manhatten_data$LAND.SQUARE.FEET)
manhatten_data$logGrossSqFt <- log10(manhatten_data$GROSS.SQUARE.FEET)
manhatten_data$logTotalUnits <- log10(manhatten_data$TOTAL.UNITS)

# ==============================================================================
# 1. Regression

# ==============================================================================
# A. EXPLORATORY DATA ANALYSIS
# ==============================================================================

ggplot(manhatten_data, aes(x = logSalePrice)) + 
  geom_histogram(fill="blue", bins=50) + 
  labs(title="Distribution of Sale Price (Log Scale)", x="Log10(Sale Price)")

ggplot(manhatten_data, aes(x = logLandSqFt)) + 
  geom_histogram(fill="green", bins=50) + 
  labs(title="Distribution of Land Square Feet (Log Scale)", x="Log10(Land Square Feet)")

ggplot(manhatten_data, aes(x = logGrossSqFt)) + 
  geom_histogram(fill="orange", bins=50) + 
  labs(title="Distribution of Gross Square Feet (Log Scale)", x="Log10(Gross Square Feet)")

ggplot(manhatten_data, aes(x = logTotalUnits)) + 
  geom_histogram(fill="purple", bins=50) + 
  labs(title="Distribution of Total Units (Log Scale)", x="Log10(Total Units)")

# Plotting Outliers in Sale Price
# Boxplots are the best way to demonstrate outliers relative to the median/quartiles
ggplot(manhatten_data, aes(y = logSalePrice)) +
  geom_boxplot(fill = "tomato") +
  labs(title = "Boxplot of Sale Price to Identify Outliers", y = "Log10(Sale Price ($))")

qqnorm(manhatten_data$logSalePrice, main = "Q-Q Plot: Log10(Sale Price)")
qqline(manhatten_data$logSalePrice, col = "blue", lwd = 2)

# Identify Sale Price outliers (on log scale)
q1 <- quantile(manhatten_data$logSalePrice, 0.25, na.rm = TRUE)
q3 <- quantile(manhatten_data$logSalePrice, 0.75, na.rm = TRUE)
iqr_val <- IQR(manhatten_data$logSalePrice, na.rm = TRUE)

lower_bound <- q1 - 1.5 * iqr_val
upper_bound <- q3 + 1.5 * iqr_val

manhatten_data <- manhatten_data %>%
  mutate(
    row_id = row_number(),
    sale_outlier = logSalePrice < lower_bound | logSalePrice > upper_bound
  )

sale_price_outliers <- manhatten_data %>%
  filter(sale_outlier) %>%
  select(row_id, SALE.PRICE, logSalePrice, LAND.SQUARE.FEET, GROSS.SQUARE.FEET, TOTAL.UNITS) %>%
  arrange(desc(SALE.PRICE))

# 2) Histogram with IQR cutoffs
ggplot(manhatten_data, aes(x = logSalePrice)) +
  geom_histogram(bins = 50, fill = "steelblue", color = "white") +
  geom_vline(xintercept = lower_bound, linetype = "dashed", color = "red", linewidth = 1) +
  geom_vline(xintercept = upper_bound, linetype = "dashed", color = "red", linewidth = 1) +
  labs(
    title = "Distribution of Log10(Sale Price) with Outlier Thresholds",
    x = "Log10(Sale Price)",
    y = "Count"
  )

# 3) Scatter plot with outliers highlighted
ggplot(manhatten_data, aes(x = logGrossSqFt, y = logSalePrice, color = sale_outlier)) +
  geom_point(alpha = 0.6) +
  geom_smooth(method = "lm", se = FALSE, color = "black") +
  scale_color_manual(values = c("FALSE" = "grey60", "TRUE" = "red")) +
  labs(
    title = "Sale Price vs Gross Sq Ft (Outliers Highlighted)",
    x = "Log10(Gross Sq Ft)",
    y = "Log10(Sale Price)",
    color = "Outlier"
  )

ggplot(manhatten_data, aes(x = logLandSqFt, y = logSalePrice, color = sale_outlier)) +
  geom_point(alpha = 0.6) +
  geom_smooth(method = "lm", se = FALSE, color = "black") +
  scale_color_manual(values = c("FALSE" = "grey60", "TRUE" = "red")) +
  labs(
    title = "Sale Price vs Gross Sq Ft (Outliers Highlighted)",
    x = "Log10(Gross Sq Ft)",
    y = "Log10(Sale Price)",
    color = "Outlier"
  )

ggplot(manhatten_data, aes(x = logTotalUnits, y = logSalePrice, color = sale_outlier)) +
  geom_point(alpha = 0.6) +
  geom_smooth(method = "lm", se = FALSE, color = "black") +
  scale_color_manual(values = c("FALSE" = "grey60", "TRUE" = "red")) +
  labs(
    title = "Sale Price vs Gross Sq Ft (Outliers Highlighted)",
    x = "Log10(Gross Sq Ft)",
    y = "Log10(Sale Price)",
    color = "Outlier"
  )

# ==============================================================================
# B. REGRESSION ANALYSIS
# ==============================================================================

set.seed(123)
train_size <- floor(0.7 * nrow(manhatten_data))
train_indices <- sample(seq_len(nrow(manhatten_data)), size = train_size)

train_data <- manhatten_data[train_indices, ]
test_data <- manhatten_data[-train_indices, ]

# Fit linear regression model
model1 <- lm(logSalePrice ~ logLandSqFt + logGrossSqFt + logTotalUnits, data = train_data)
model2 <- lm(logSalePrice ~ logLandSqFt + logGrossSqFt, data = train_data)
model3 <- lm(logSalePrice ~ logTotalUnits + logLandSqFt, data = train_data)
model4 <- lm(logSalePrice ~ logLandSqFt, data = train_data)
model5 <- lm(logSalePrice ~ logGrossSqFt, data = train_data)

# Best performing model based on R-squared and p-values
summary(model1)
summary(model2)
summary(model3)
summary(model4)
summary(model5)

# ==============================================================================


# ==============================================================================
# 2. Classification

# keep 3-4 neighborhoods from the data
neighborhood_data <- c("CHELSEA", "CHINATOWN", 
                        "EAST VILLAGE", "GREENWICH VILLAGE-CENTRAL") 

data <- manhatten_data %>%
  filter(NEIGHBORHOOD %in% neighborhood_data) %>%
  select(NEIGHBORHOOD, logSalePrice, logLandSqFt, logGrossSqFt, logTotalUnits)


data$NEIGHBORHOOD <- as.factor(data$NEIGHBORHOOD)

set.seed(456)
train_idx <- sample(1:nrow(data), 0.7 * nrow(data))
train_data <- data[train_idx, ]
test_data  <- data[-train_idx, ]

features <- c("logSalePrice", "logLandSqFt", "logGrossSqFt", "logTotalUnits")

train_scaled <- scale(train_data[, features])
test_scaled <- scale(test_data[, features])

# 4. Train and Predict
# Model 1: k-Nearest Neighbors (k=5)
knn_pred <- knn(train = train_scaled, test = test_scaled, 
                cl = train_data$NEIGHBORHOOD, k = 5)

# Model 2: Random Forest
rf_model <- randomForest(NEIGHBORHOOD ~ logSalePrice + logLandSqFt + logGrossSqFt + logTotalUnits, 
                         data = train_data, ntree = 100)
rf_pred <- predict(rf_model, test_data)

# Model 3: Decision Tree (rpart)
dt_model <- rpart(NEIGHBORHOOD ~ logSalePrice + logLandSqFt + logGrossSqFt + logTotalUnits, 
                  data = train_data, method = "class")
dt_pred <- predict(dt_model, test_data, type = "class")

eval_metrics <- function(actual, predicted, label) {
  cm <- table(Actual = actual, Predicted = predicted)
  print(paste("Contingency Table for", label))
  print(cm)
  
  # Calculate Accuracy
  acc <- sum(diag(cm)) / sum(cm)
  
  # For multi-class, we calculate Macro-averaged Precision and Recall
  precision <- diag(cm) / colSums(cm)
  recall <- diag(cm) / rowSums(cm)
  f1 <- 2 * (precision * recall) / (precision + recall)
  
  cat("\nMetrics for", label, ":\n")
  cat("Accuracy:", round(acc, 3), "\n")
  cat("Mean F1-Score:", round(mean(f1, na.rm = TRUE), 3), "\n\n")
}

eval_metrics(test_data$NEIGHBORHOOD, knn_pred, "kNN")
eval_metrics(test_data$NEIGHBORHOOD, rf_pred, "Random Forest")
eval_metrics(test_data$NEIGHBORHOOD, dt_pred, "Decision Tree")

# ==============================================================================