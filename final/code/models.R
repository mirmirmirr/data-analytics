library(caret)
library(kernlab)
library(caret)
library(e1071)
library(GGally)
library(class)

numeric_vars <- c("popularity", "danceability", "energy", "key", 
                  "loudness", "mode", "speechiness", "acousticness", 
                  "instrumentalness", "liveness", "valence", "tempo")
songs_numeric <- songs_scaled[, numeric_vars]

# seed and train and test split (70/30)
set.seed(42)
train_idx <- sample(nrow(songs_scaled), 0.7 * nrow(songs_scaled))
train_data <- songs_scaled[train_idx, ]
test_data <- songs_scaled[-train_idx, ]

# 5 fold cross-validation control
# for preventing overfitting and tuning hyperparameters
cv_control <- trainControl(method = "cv", number = 5)

# the formula for our models (predicting genre from the numeric features)
numeric_formula <- track_genre ~ popularity + danceability + energy + loudness + speechiness + acousticness + instrumentalness + liveness + valence + tempo

# =========================================================================
# MODEL 1: K-Nearest Neighbors (KNN) with Raw Features
# =========================================================================

# distance parameters (k) to test
k_values <- c(3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31)
knn_grid <- expand.grid(k = k_values)

# train kNN
knn_model <- train(numeric_formula, 
                   data = train_data, 
                   method = "knn", 
                   metric = "Accuracy",
                   preProcess = c("center", "scale"),
                   trControl = cv_control,
                   tuneGrid = knn_grid)

print(knn_model)

# new model and predictions
knn_preds <- predict(knn_model, newdata = test_data)
knn_cm <- confusionMatrix(knn_preds, test_data$track_genre)

print(knn_cm)

# =========================================================================
# MODEL 2: K-Nearest Neighbors (KNN) with PCA
# =========================================================================

# distance parameters (k) to test
k_values <- c(3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31)
knn_grid <- expand.grid(k = k_values)

# train KNN using PCA-transformed data
pca_control <- trainControl(method = "cv", number = 5, preProcOptions = list(thresh = 0.95))

knn_pca_model <- train(numeric_formula, 
                       data = train_data, 
                       method = "knn", 
                       metric = "Accuracy",
                       preProcess = c("center", "scale", "pca"), 
                       trControl = pca_control,
                       tuneGrid = knn_grid)

print(knn_pca_model)

# new model and predictions
knn_pca_preds <- predict(knn_pca_model, newdata = test_data)
knn_pca_cm <- confusionMatrix(knn_pca_preds, test_data$track_genre)

print(knn_pca_cm)

# =========================================================================
# MODEL 3: Support Vector Machine (SVM) with Radial Basis Kernel
# =========================================================================

svm_control <- trainControl(method = "cv", number = 5, preProcOptions = list(thresh = 0.95))

svm_model <- train(numeric_formula, 
                   data = train_data, 
                   method = "svmRadial", 
                   metric = "Accuracy",
                   preProcess = c("center", "scale", "pca"), # Scale, then PCA
                   trControl = svm_control)

print(svm_model)

# new model and predictions
svm_preds <- predict(svm_model, newdata = test_data)
svm_cm <- confusionMatrix(svm_preds, test_data$track_genre)

print(svm_cm)

# =========================================================================
# MODEL COMPARISON
# =========================================================================

three_way_comparison <- resamples(list(
  KNN_Raw = knn_model, 
  KNN_PCA = knn_pca_model, 
  SVM_PCA = svm_model
))

summary(three_way_comparison)
bwplot(three_way_comparison, main="Model Accuracy: Raw Features vs PCA")
