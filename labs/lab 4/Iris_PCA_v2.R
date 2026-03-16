##########################################
### Principal Component Analysis (PCA) ###
##########################################

library(ggfortify)

# PCA with iris dataset
iris.df <- iris
head(iris.df)

# creating another dataframe from iris dataset that contains the columns from 1 to 4
X <- iris.df[,-5]
Y <- iris.df[,5]

## scatter plot of 2 variables colored by class
ggplot(X, aes(x = Petal.Length, y = Petal.Width, color = Y, fill = Y)) + geom_point() + 
  stat_ellipse(type = "t",geom = "polygon",alpha = 0.4)


ggplot(X, aes(x = Sepal.Length, y = Sepal.Width, color = Y, fill = Y)) + geom_point() +
  stat_ellipse(type = "t",geom = "polygon",alpha = 0.4)



####### PCA #######

Xmat <- as.matrix(X)

Xc <- scale(Xmat, center = T, scale = F)

principal_components <- princomp(Xc)

principal_components$loadings


## using autoplot() function to plot the components
autoplot(principal_components, data = iris, colour = 'Species',
         loadings = TRUE, loadings.colour = 'blue',
         loadings.label = TRUE, loadings.label.size = 3, scale = 0)


####### PCA Manually #########

# compute covariance matrix
C <- cov(Xc)

C

# check covariances
cov(X$Petal.Length,X$Petal.Width)
# cov(X$Sepal.Length,X$Sepal.Width)

# eigen-decomposition of covariance matrix
C.eigens <-  eigen(C)

# eigenvector matrix
V <- C.eigens$vectors

# eigenvalues diagonal matrix
A <- C.eigens$values

# reconstruct covariance matrix
Crec <- V %*% diag(A) %*% t(V)

# project original data matrix onto principal components
Z <- Xc %*% V


ggplot(X, aes(x = Petal.Length, y = Petal.Width, color = Y, fill = Y)) + geom_point() 

## scatter plot of dataset in PCs
ggplot(Z, aes(x = Z[,1], y = Z[,2], colour = Y)) + geom_point()


# EOF #