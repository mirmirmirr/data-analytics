## Use k-means and PAM to find clusters in the abalone dataset
## using the feature subset from the exercise 1.

## Find the optimal value k for each model and plot silhouette plots
## for both models with their optimum k.

## imports
library(GGally)
library(ggplot2)
library(psych)
library(cluster)
library(dendextend)
library(colorspace)
library(factoextra)

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
best_test <- test_subset2


## FINDING CLUSTERS ##

# scale variables
scaled_data <- scale(best_train)

## K-MEANS
set.seed(6)
k = 3 # (adult, old, young)

# create lists
k.list <- c(1,2,3,4,5,6,7,8,9,10)
wcss.list <- c()
si.list <- c()

# for each value of k, run the algorithm, compute wcss and average silhouette width and append them to list
for (k in k.list) {
  km <- kmeans(scaled_data, centers = k)
  
  wcss <- km$tot.withinss
  wcss.list <- c(wcss.list,wcss)
  
  if (k > 1){
    si <- silhouette(km$cluster, dist(scaled_data))
    avg.si <- mean(si[, 3])  
    si.list <- c(si.list,avg.si)
  }
}

## plot wcss vs. k
plot(k.list, wcss.list, type = "b")

## plot avg silhouette width vs. k
plot(k.list[-1],si.list,type = "b")


# optimal k value (k = 2)
optimal.k.km <- k.list[-1][which.max(si.list)]
optimal.k.km

# clusters from optimal k value
set.seed(6)
km_optimal <- kmeans(scaled_data, centers = optimal.k.km)

# silhouette plot for optimal k value
silhouette_optimal <- silhouette(km_optimal$cluster, dist(scaled_data))
fviz_silhouette(silhouette_optimal)


## PAM

k.list <- c(1,2,3,4,5,6,7,8,9,10)
sumdiss.list <- c()
si.list.pam <- c()

for (k in k.list) {
  pam <- pam(scaled_data, k)
  sumdiss <- pam$objective[2]
  sumdiss.list <- c(sumdiss.list,sumdiss)
  
  if (k > 1){
    si <- silhouette(pam$cluster, dist(scaled_data))
    avg.si <- mean(si[, 3])  
    si.list.pam <- c(si.list.pam,avg.si)
  }
}

plot(k.list,sumdiss.list,type = "b")
plot(k.list[-1],si.list.pam,type = "b")

# optimal k value (k = 2)
optimal.k.pam <- k.list[-1][which.max(si.list.pam)]
optimal.k.pam

# clusters from optimal k value
set.seed(6)
pam_optimal <- pam(scaled_data, optimal.k.pam)

# silhouette plot for optimal k value
silhouette_optimal <- silhouette(pam_optimal$cluster, dist(scaled_data))
fviz_silhouette(silhouette_optimal)
