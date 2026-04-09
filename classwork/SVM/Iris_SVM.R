###############################
### Support Vector Machines ###
###############################


library(caret)
library(e1071)
library(GGally)

## take copy
dataset <- iris

dataset$Species <- as.character(dataset$Species)
# dataset <- dataset[-which(dataset$Species=="versicolor"),]
dataset <- dataset[-which(dataset$Species=="setosa"),]
dataset$Species <- as.factor(dataset$Species)

# ## split train/test
N <- nrow(dataset)
train.indexes <- sample(N,0.7*N)

train <- dataset[train.indexes,]
test <- dataset[-train.indexes,]

## feature plots
# ggpairs(dataset, ggplot2::aes(colour = dataset$Species))


ggplot(train, aes(x = Petal.Length, y = Petal.Width, colour = Species)) +
  geom_point()

ggplot(test, aes(x = Petal.Length, y = Petal.Width, colour = Species)) +
  geom_point()


## train SVM model - linear kernel
svm.mod0 <- svm(Species ~ Petal.Length + Petal.Width, data = train, kernel = 'linear')

svm.mod0

## plot decision boundary
plot(svm.mod0, data = train, formula = Petal.Length~Petal.Width, svSymbol = "x", dataSymbol = "o")

### better decision boundary plot
## define function for plotting
make.grid = function(X, n = 75) {
  grange = apply(X, 2, range)
  X1 = seq(from = grange[1,1], to = grange[2,1], length = n)
  X2 = seq(from = grange[1,2], to = grange[2,2], length = n)
  expand.grid(Petal.Length = X1, Petal.Width = X2)
}

X <- train[,3:4]
Y <- as.numeric(train$Species)
Y[Y==2] <- -1

xgrid = make.grid(X)
ygrid = predict(svm.mod0, xgrid)

plot(xgrid, col = c("red","blue")[as.numeric(ygrid)], pch = 20, cex = .2)
points(X, col = Y + 3, pch = 19)
points(X[svm.mod0$index,], pch = 5, cex = 2)
##################


### predict for test data
test.pred <- predict(svm.mod0, test)

cm = as.matrix(table(Actual = test$Species, Predicted = test.pred))

cm

n = sum(cm) # number of instances
nc = nrow(cm) # number of classes
diagv = diag(cm) # number of correctly classified instances per class 
rowsums = apply(cm, 1, sum) # number of instances per class
colsums = apply(cm, 2, sum) # number of predictions per class
p = rowsums / n # distribution of instances over the actual classes
q = colsums / n # distribution of instances over the predicted 

accuracy <- sum(diagv)/n
accuracy

recall = diagv / rowsums 
precision = diagv / colsums
f1 = 2 * precision * recall / (precision + recall) 

svm.mod0.res <- data.frame(precision, recall, f1)
svm.mod0.res

##################


###### train SVM model - radial kernel ######
svm.mod1 <- svm(Species ~ Petal.Length+Petal.Width, data = train, kernel = 'radial')


## plot decision boundary
plot(svm.mod1, data = train, formula = Petal.Length~Petal.Width, svSymbol = "x", dataSymbol = "o")

### better decision boundary plot
## define function for plotting
make.grid = function(X, n = 75) {
  grange = apply(X, 2, range)
  X1 = seq(from = grange[1,1], to = grange[2,1], length = n)
  X2 = seq(from = grange[1,2], to = grange[2,2], length = n)
  expand.grid(Petal.Length = X1, Petal.Width = X2)
}

X <- train[,3:4]
Y <- as.numeric(train$Species)
Y[Y==2] <- -1

xgrid = make.grid(X)

ygrid = predict(svm.mod1, xgrid)

plot(xgrid, col = c("red","blue")[as.numeric(ygrid)], pch = 20, cex = .2)
points(X, col = Y + 3, pch = 19)
points(X[svm.mod1$index,], pch = 5, cex = 2)
##################


### predict for test data
test.pred <- predict(svm.mod1, test)

cm = as.matrix(table(Actual = test$Species, Predicted = test.pred))

cm

n = sum(cm) # number of instances
nc = nrow(cm) # number of classes
diagv = diag(cm) # number of correctly classified instances per class 
rowsums = apply(cm, 1, sum) # number of instances per class
colsums = apply(cm, 2, sum) # number of predictions per class
p = rowsums / n # distribution of instances over the actual classes
q = colsums / n # distribution of instances over the predicted 

accuracy <- sum(diagv)/n
accuracy

recall = diagv / rowsums 
precision = diagv / colsums
f1 = 2 * precision * recall / (precision + recall) 

svm.mod1.res <- data.frame(precision, recall, f1)
svm.mod1.res

##################



### train SVM model - polynomial kernel ###
svm.mod2 <- svm(Species ~ Petal.Length+Petal.Width, data = train, kernel = 'polynomial')


## plot decision boundary
plot(svm.mod2, data = train, formula = Petal.Length~Petal.Width, svSymbol = "x", dataSymbol = "o")

### better decision boundary plot
## define function for plotting
make.grid = function(X, n = 75) {
  grange = apply(X, 2, range)
  X1 = seq(from = grange[1,1], to = grange[2,1], length = n)
  X2 = seq(from = grange[1,2], to = grange[2,2], length = n)
  expand.grid(Petal.Length = X1, Petal.Width = X2)
}

X <- train[,3:4]
Y <- as.numeric(train$Species)
Y[Y==2] <- -1

xgrid = make.grid(X)
# xgrid[1:10,]

ygrid = predict(svm.mod2, xgrid)

plot(xgrid, col = c("red","blue")[as.numeric(ygrid)], pch = 20, cex = .2)

points(X, col = Y + 3, pch = 19)
points(X[svm.mod2$index,], pch = 5, cex = 2)


### predict for test data
test.pred <- predict(svm.mod2, test)

cm = as.matrix(table(Actual = test$Species, Predicted = test.pred))

cm

n = sum(cm) # number of instances
nc = nrow(cm) # number of classes
diagv = diag(cm) # number of correctly classified instances per class 
rowsums = apply(cm, 1, sum) # number of instances per class
colsums = apply(cm, 2, sum) # number of predictions per class
p = rowsums / n # distribution of instances over the actual classes
q = colsums / n # distribution of instances over the predicted 

accuracy <- sum(diagv)/n
accuracy

recall = diagv / rowsums 
precision = diagv / colsums
f1 = 2 * precision * recall / (precision + recall) 

svm.mod2.res <- data.frame(precision, recall, f1)
svm.mod2.res

##################



### Tuned SVM - polynomial ###

## set ranges for parameters to tune
gamma.range <- seq(0.1,10, .1)
gamma.range

C.range <- seq(1,20, 1)
C.range

tuned.svm <- tune.svm(Species~Petal.Length+Petal.Width, data = train, kernel = 'polynomial', gamma = gamma.range, cost = C.range)
tuned.svm

gamma <- tuned.svm$best.parameters$gamma

C <- tuned.svm$best.parameters$cost

svm.mod3 <- svm(Species ~ Petal.Length+Petal.Width, data = train, kernel = 'polynomial', gamma = gamma, cost = C)

svm.mod3

## plot decision boundary
plot(svm.mod3, data = train, formula = Petal.Length~Petal.Width, svSymbol = "x", dataSymbol = "o")

### better decision boundary plot
## define function for plotting
make.grid = function(X, n = 75) {
  grange = apply(X, 2, range)
  X1 = seq(from = grange[1,1], to = grange[2,1], length = n)
  X2 = seq(from = grange[1,2], to = grange[2,2], length = n)
  expand.grid(Petal.Length = X1, Petal.Width = X2)
}

X <- train[,3:4]
Y <- as.numeric(train$Species)
Y[Y==2] <- -1

xgrid = make.grid(X)
# xgrid[1:10,]

ygrid = predict(svm.mod3, xgrid)

plot(xgrid, col = c("red","blue")[as.numeric(ygrid)], pch = 20, cex = .2)

points(X, col = Y + 3, pch = 19)
points(X[svm.mod3$index,], pch = 5, cex = 2)


### predict for test data
test.pred <- predict(svm.mod3, test)

cm = as.matrix(table(Actual = test$Species, Predicted = test.pred))

cm

n = sum(cm) # number of instances
nc = nrow(cm) # number of classes
diagv = diag(cm) # number of correctly classified instances per class 
rowsums = apply(cm, 1, sum) # number of instances per class
colsums = apply(cm, 2, sum) # number of predictions per class
p = rowsums / n # distribution of instances over the actual classes
q = colsums / n # distribution of instances over the predicted 

accuracy <- sum(diagv)/n
accuracy

recall = diagv / rowsums 
precision = diagv / colsums
f1 = 2 * precision * recall / (precision + recall) 

svm.mod3.res <- data.frame(precision, recall, f1)
svm.mod3.res

### EOF ###