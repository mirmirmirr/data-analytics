## Train and evaluate 2 kNN models using the abalone dataset
## Each model should use a different subset of features

## Compare models using contingency tables
## Find the optimal value k for the better performing model from above by
## training over a range of k values and choosing the value with the
## highest accuracy (accuracy = correct classifications / total observations)

library("caret")
library(GGally)
library(psych)

library(class)

## read data
setwd("~/coding/data_analytics/labs/lab 3/")
abalone <- read.csv("abalone/abalone.data", header=FALSE)

## rename columns
colnames(abalone) <- c("sex", "length", 'diameter', 'height', 'whole_weight', 'shucked_wieght', 'viscera_wieght', 'shell_weight', 'rings' ) 

## derive age group based in number of rings
abalone$age.group <- cut(abalone$rings, br=c(0,8,11,35), labels = c("young", 'adult', 'old'))

## take copy removing sex and rings
abalone.sub <- abalone[,c(2:8,10)]

## convert class labels to strings
abalone.sub$age.group <- as.character(abalone.sub$age.group)

## convert back to factor
abalone.sub$age.group <- as.factor(abalone.sub$age.group)

## split train/test
train.indexes <- sample(4177,0.7*4177)

train <- abalone.sub[train.indexes,]
test <- abalone.sub[-train.indexes,]


## TRAIN + EVALUATE 2kNN models

# subset 1: length, diameter, height
train_subset1 <- train[, 1:3]
test_subset1  <- test[, 1:3]

# subset 2: whole, shucked, viscera, shell
train_subset2 <- train[, 4:7]
test_subset2  <- test[, 4:7]

train_labels <- train[, 8]
test_labels  <- test[, 8]

# train
initial_k <- 5
knn_model1 <- knn(train = train_subset1, test = test_subset1, cl = train_labels, k = initial_k)
knn_model2 <- knn(train = train_subset2, test = test_subset2, cl = train_labels, k = initial_k)


## CONTINGENCY TABLES
# accuracy = correct classifications / total observations 

# initial tables
table_model1 <- table(knn_model1, test_labels, dnn=list('predicted','actual'))
table_model1
accuracy1 <- sum(diag(table_model1)) / sum(table_model1)
accuracy1 # 0.6180223

table_model2 <- table(knn_model2, test_labels, dnn=list('predicted','actual'))
table_model2
accuracy2 <- sum(diag(table_model2)) / sum(table_model2)
accuracy2 # 0.6539075

# best model
best_train <- train_subset2
test_test <- test_subset2


## OPTIMAL K-VALUE
# training over range of k values and choosing highest accuracy

k_values <- 1:60
accuracies <- numeric(length(k_values))

for (i in seq_along(k_values)) {
  current_k <- k_values[i]
  knn_predicted <-knn(train = train_subset1, test = test_subset1, cl = train_labels, k = current_k)
  table_model <- table(knn_predicted, test_labels, dnn=list('predicted','actual'))
  accuracies[i] <- sum(diag(table_model)) / sum(table_model)
}

# optimal k value (k = 48, accuracy = 0.6411483)
optimal_index <- which.max(accuracies)
optimal_k <- k_values[optimal_index]
highest_accuracy <- accuracies[optimal_index]
