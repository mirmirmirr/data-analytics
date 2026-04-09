## load libraries
library(caret)
library(e1071)         # For SVM
library(randomForest)  # For Random Forest
library(ggfortify)
library(readr)

## set working directory so that files can be referenced without the full path
setwd("~/coding/data-analytics/labs/lab 5/")

## read dataset
wine <- read_csv("wine.data", col_names = FALSE)

## set column names
names(wine) <- c("Type","Alcohol","Malic acid","Ash","Alcalinity of ash","Magnesium","Total phenols","Flavanoids","Nonflavanoid Phenols","Proanthocyanins","Color Intensity","Hue","Od280/od315 of diluted wines","Proline")

## change the data type of the "Type" column from character to factor
wine$Type <- as.factor(wine$Type)

# ---------------------------------------------------------
# Prepare the Data
# ---------------------------------------------------------

# Set a random seed for reproducibility
set.seed(123)

# Split into 70% training and 30% testing
N <- nrow(wine)
train.indexes <- sample(N, 0.7 * N)

train <- wine[train.indexes, ]
test <- wine[-train.indexes, ]

# ---------------------------------------------------------
# Train Model 1: Linear SVM
# ---------------------------------------------------------
C.range <- seq(0.1, 10, by = 0.5)

# Tune the SVM using Alcohol and Flavanoids
tuned.linear <- tune.svm(Type ~ Alcohol + Flavanoids, 
                         data = train, 
                         kernel = 'linear',
                         cost = C.range)

best.C.linear <- tuned.linear$best.parameters$cost

# Train the optimal Linear SVM model
svm.linear <- svm(Type ~ Alcohol + Flavanoids, 
                  data = train, 
                  kernel = 'linear', 
                  cost = best.C.linear)

# Predict and evaluate on test data
pred.linear <- predict(svm.linear, test)
cm.linear = as.matrix(table(Actual = test$Type, Predicted = pred.linear))
accuracy.linear <- sum(diag(cm.linear)) / sum(cm.linear)

cm.linear
#           Predicted
# Actual    1   2   3
#       1   19  0   0
#       2   1   23  0
#       3   0   0   11

accuracy.linear
# 0.9814815

# ---------------------------------------------------------
# Train Model 2: Radial (RBF) SVM
# ---------------------------------------------------------
gamma.range <- seq(0.1, 5, by = 0.5)
C.range.rad <- seq(1, 20, by = 1)

# Tune the SVM
tuned.radial <- tune.svm(Type ~ Alcohol + Flavanoids, 
                         data = train, 
                         kernel = 'radial', 
                         gamma = gamma.range, 
                         cost = C.range.rad)

# Extract parameters
best.gamma.radial <- tuned.radial$best.parameters$gamma
best.C.radial <- tuned.radial$best.parameters$cost

best.gamma.radial
best.C.radial

# Train the optimal Radial SVM model
svm.radial <- svm(Type ~ Alcohol + Flavanoids, 
                  data = train, 
                  kernel = 'radial', 
                  gamma = best.gamma.radial, 
                  cost = best.C.radial)

# Predict and evaluate on test data
pred.radial <- predict(svm.radial, test)
cm.radial <- table(Actual = test$Type, Predicted = pred.radial)
accuracy.radial <- sum(diag(cm.radial)) / sum(cm.radial)

cm.radial
#           Predicted
# Actual    1   2   3
#       1   19  0   0
#       2   1   23  0
#       3   0   0   11

accuracy.radial
# 0.9814815

# ---------------------------------------------------------
# Train Model 3: Random Forest
# ---------------------------------------------------------

set.seed(123)
rf.model <- randomForest(Type ~ Alcohol + Flavanoids, 
                         data = train, ntree = 500)
pred.rf <- predict(rf.model, test)
cm.rf <- table(Actual = test$Type, Predicted = pred.rf)
accuracy.rf <- sum(diag(cm.rf)) / sum(cm.rf)

cm.rf
#           Predicted
# Actual    1   2   3
#       1   19  0   0
#       2   1   23  0
#       3   0   2   9

accuracy.rf
# 0.9444444

# ---------------------------------------------------------
# Compare Performance of the Models
# It looks like the linear and radial SVM models performed equally well, while
# the random forest model had slightly lower accuracy. For predicting wine type
# based on alcohol and flavanoids, the SVM models seem to be the best choice.
# ---------------------------------------------------------