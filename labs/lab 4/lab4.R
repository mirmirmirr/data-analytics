##########################################
### Principal Component Analysis (PCA) ###
##########################################

## load libraries
library(caret)
library(ggfortify)
library(readr)

## set working directory so that files can be referenced without the full path
setwd("~/coding/data-analytics/labs/lab 4/")

## read dataset
wine <- read_csv("wine.data", col_names = FALSE)

## set column names
names(wine) <- c("Type","Alcohol","Malic acid","Ash","Alcalinity of ash","Magnesium","Total phenols","Flavanoids","Nonflavanoid Phenols","Proanthocyanins","Color Intensity","Hue","Od280/od315 of diluted wines","Proline")

## inspect data frame
head(wine)

## change the data type of the "Type" column from character to factor
####
# Factors look like regular strings (characters) but with factors R knows 
# that the column is a categorical variable with finite possible values
# e.g. "Type" in the Wine dataset can only be 1, 2, or 3
####

wine$Type <- as.factor(wine$Type)


## visualize variables
pairs.panels(wine[,-1],gap = 0,bg = c("red", "yellow", "blue")[wine$Type],pch=21)

ggpairs(wine, ggplot2::aes(colour = Type))

###

X <- wine[,-1]
Y <- wine$Type

###

# ---------------------------------------------------------
# Compute the PCs and plot the dataset using 1st and 2nd PCs
# ---------------------------------------------------------

Xmat <- as.matrix(X)
Xc <- scale(Xmat, center = T, scale = F)

principal_components <- princomp(Xc)

autoplot(principal_components, data = wine, colour = 'Type',
         loadings = TRUE, loadings.colour = 'blue',
         loadings.label = TRUE, loadings.label.size = 3, scale = 0) +
  ggtitle("PCA of Wine Dataset (First 2 Principal Components)")

# ---------------------------------------------------------
# Identify variables contributing most to the 1st PC
# ---------------------------------------------------------

pc1_loadings <- abs(principal_components$loadings[, "Comp.1"])

# sort loadings
sorted_pc1_loadings <- sort(pc1_loadings, decreasing = TRUE)
print(sorted_pc1_loadings)

# ---------------------------------------------------------
# Train a kNN classifier using a subset of variables
# ---------------------------------------------------------

set.seed(6)
wine.scaled = scale(X)

# split train/test
train.indexes <- sample(nrow(wine.scaled), 0.7 * nrow(wine.scaled))

train <- wine.scaled[train.indexes,]
test <- wine.scaled[-train.indexes,]

# train kNN model using 4 variables
subset_vars <- c("Proline", "Magnesium", "Alcalinity of ash", "Color Intensity")
train_subset <- train[, subset_vars]
test_subset <- test[, subset_vars]

train_labels <- Y[train.indexes]
test_labels <- Y[-train.indexes]

initial_k <- 5
knn.model <- knn(train = train_subset, test = test_subset, cl = train_labels, k = initial_k)


# ---------------------------------------------------------
# Train a kNN classifier using the first 2 PCs
# ---------------------------------------------------------

pca_scores <- as.data.frame(principal_components$scores)

train_pca <- pca_scores[train.indexes, 1:2]
test_pca <- pca_scores[-train.indexes, 1:2]

initial_k <- 5
knn.pca <- knn(train = train_pca, test = test_pca, cl = train_labels, k = initial_k)

# ---------------------------------------------------------
# Compare the models
# ---------------------------------------------------------

# contingency table for subset model
table_subset <- table(knn.model, test_labels, dnn=list('predicted','actual'))
table_subset
accuracy_subset <- sum(diag(table_subset)) / sum(table_subset)
accuracy_subset # 0.8704

precision_subset <- diag(table_subset) / colSums(table_subset)
recall_subset <- diag(table_subset) / rowSums(table_subset)
f1_subset <- 2 * (precision_subset * recall_subset) / (precision_subset + recall_subset)

data.frame(precision_subset, recall_subset, f1_subset)
#          precision_subset   recall_subset   f1_subset
# 1        0.8947368          0.8095238       0.8500000
# 2        0.8000000          0.8421053       0.8205128
# 3        0.9333333          1.0000000       0.9655172

# contingency table for PCA model
table_pca <- table(knn.pca, test_labels, dnn=list('predicted','actual'))
table_pca
accuracy_pca <- sum(diag(table_pca)) / sum(table_pca)
accuracy_pca # 0.6667

precision_pca <- diag(table_pca) / colSums(table_pca)
recall_pca <- diag(table_pca) / rowSums(table_pca)
f1_pca <- 2 * (precision_pca * recall_pca) / (precision_pca + recall_pca)

data.frame(precision_pca, recall_pca, f1_pca)
#       precision_pca   recall_pca    f1_pca
# 1     0.8421053       0.7619048     0.8000000
# 2     0.6500000       0.6842105     0.6666667
# 3     0.4666667       0.5000000     0.4827586