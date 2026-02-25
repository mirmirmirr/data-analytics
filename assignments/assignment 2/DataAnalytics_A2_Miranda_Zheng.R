library(readr)
library(EnvStats)
library(nortest)
library(ggplot2)
library(class)

# set working directory (relative path)
setwd("~/coding/data-analytics/assignments/assignment 2")

# read data
epi.data <- read_csv("epi_results_2024_pop_gdp.csv")


# ==============================================================================
# 1. Variable Distributions
# work referenced from basic_R_and_stats_functions.R from classwork
# ==============================================================================

# choose variable + clean
ECO <- epi.data$ECO.new
NAs <- is.na(ECO)
ECO.clean <- ECO[!NAs]

# 1.1 Histogram with density lines overlayed
x <- seq(min(ECO.clean), max(ECO.clean), length = 10)
hist(ECO.clean, x, prob=TRUE, main="Histogram of ECO.new", xlab="ECO", col="lightsteelblue")
lines(density(ECO.clean, bw="SJ"), col="red", lwd=2)
rug(ECO.clean)

# 1.2 Boxplots of the same variable, one for each region
boxplot(ECO ~ epi.data$region, 
        main="Boxplot by Region", 
        xlab="Region", 
        ylab="ECO.new",
        las=2,
        col="lightblue")


# ==============================================================================
# 2. Derive 2 Subsets
# work referenced from basic_R_and_stats_functions.R from classwork
# ==============================================================================

AP.data <- epi.data[epi.data$region == "Asia-Pacific", ]
GW.data <- epi.data[epi.data$region == "Global West", ]

AP.ECO <- AP.data$ECO.new[!is.na(AP.data$ECO.new)]
GW.ECO <- GW.data$ECO.new[!is.na(GW.data$ECO.new)]

# 2.1 Histograms of the same variable for each region
hist(AP.ECO, prob=TRUE, main="Asia-Pacific", xlab="ECO.new", col="lightgreen")
hist(GW.ECO, prob=TRUE, main="Global West", xlab="ECO.new", col="lightpink")

# 2.2 print quantile-quantile plot of two variables
qqplot(AP.ECO, GW.ECO, xlab = "Asia-Pacific Quantiles", ylab = "Global West Quantiles", 
       main = "Q-Q plot") 
abline(0, 1, col="red")


# ==============================================================================
# 3. Linear Models
# work referenced from basic_R_and_stats_functions.R from classwork
# ==============================================================================

### SUBSET/REGION 1
lmod_pop <- lm(log10(ECO.new) ~ log10(population), data = AP.data)
lmod_gdp <- lm(log10(ECO.new) ~ log10(gdp), data = AP.data)

# 3.1 scatter plot of 2 variables with best fit line overlayed
plot(log10(ECO.new) ~ log10(population), data = AP.data, 
     main="Asia-Pacific: log10(ECO.new) vs log10(Pop)", xlab="log10(Population)", ylab="log10(ECO.new)")
abline(lmod_pop, col="red")

plot(log10(ECO.new) ~ log10(gdp), data = AP.data, 
     main="Asia-Pacific: log10(ECO.new) vs log10(GDP)", xlab="log10(GDP)", ylab="log10(ECO.new)")
abline(lmod_gdp, col="red")

# 3.2 Print model output stats
summary(lmod_pop)
summary(lmod_gdp)

# Plot the residuals
plot(lmod_pop$fitted.values, lmod_pop$residuals, main="Residuals: Population Model", xlab="Fitted Values", ylab="Residuals")
abline(h=0, col="red")

plot(lmod_gdp$fitted.values, lmod_gdp$residuals, main="Residuals: GDP Model", xlab="Fitted Values", ylab="Residuals")
abline(h=0, col="red")


### SUBSET/REGION 2
lmod_pop <- lm(log10(ECO.new) ~ log10(population), data = GW.data)
lmod_gdp <- lm(log10(ECO.new) ~ log10(gdp), data = GW.data)

# 3.1 scatter plot of 2 variables with best fit line overlayed
plot(log10(ECO.new) ~ log10(population), data = GW.data, 
     main="Global West: log10(ECO.new) vs log10(Pop)", xlab="log10(Population)", ylab="log10(ECO.new)")
abline(lmod_pop, col="red")

plot(log10(ECO.new) ~ log10(gdp), data = GW.data, 
     main="Global West: log10(ECO.new) vs log10(GDP)", xlab="log10(GDP)", ylab="log10(ECO.new)")
abline(lmod_gdp, col="red")

# 3.2 Print model output stats
summary(lmod_pop)
summary(lmod_gdp)

# Plot the residuals
plot(lmod_pop$fitted.values, lmod_pop$residuals, main="Residuals: Population Model", xlab="Fitted Values", ylab="Residuals")
abline(h=0, col="red")

plot(lmod_gdp$fitted.values, lmod_gdp$residuals, main="Residuals: GDP Model", xlab="Fitted Values", ylab="Residuals")
abline(h=0, col="red")

# 3.3 Compare the models for both regions and very briefly describe which one
# is a better fit and why you think that is the case.

# I think that the GDP models are the better fit for both regions because it has
# the higher R-squared value and a pretty low p value.


# ==============================================================================
# 4. Classification (kNN)
# work referenced from exercise 2 and iris classifications
# ==============================================================================

knn.data <- epi.data[epi.data$region %in% c("Eastern Europe", "Southern Asia", "Greater Middle East"), ]
knn.clean <- na.omit(knn.data[, c("population", "gdp", "ECO.new", "region")])

knn.clean$population <- log10(knn.clean$population)
knn.clean$gdp <- log10(knn.clean$gdp)

set.seed(6)

s.train <- sample(nrow(knn.clean), floor(0.7 * nrow(knn.clean)))
knn.train <- knn.clean[s.train, ]
knn.test <- knn.clean[-s.train, ]

# 4.1 kNN Model using columns 1:3 for input variables and column 4 for class labels
max_k <- nrow(knn.train) 
k_values <- 1:max_k
accuracies <- numeric(length(k_values))

for (i in seq_along(k_values)) {
  current_k <- k_values[i]
  knn.predicted <-knn(train = knn.train[, 1:3], test = knn.test[, 1:3], cl = knn.train$region, k = current_k)
  table_model <- table(knn.predicted, knn.test$region, dnn=list('predicted','actual'))
  accuracies[i] <- sum(diag(table_model)) / sum(table_model)
}

# optimal k value (k = 1, accuracy = 0.6923077)
optimal_index <- which.max(accuracies)
optimal_k <- k_values[optimal_index]
highest_accuracy <- accuracies[optimal_index]

# 4.2 Train another model with a new 3rd variable
knn.clean <- na.omit(knn.data[, c("population", "gdp", "PAR.new", "region")])

knn.clean$population <- log10(knn.clean$population)
knn.clean$gdp <- log10(knn.clean$gdp)

set.seed(6)

s.train <- sample(nrow(knn.clean), floor(0.7 * nrow(knn.clean)))
knn.train <- knn.clean[s.train, ]
knn.test <- knn.clean[-s.train, ]

# train using prev best k value (accuracy = 0.1538462)
k_val <- 1
knn.predicted <-knn(train = knn.train[, 1:3], test = knn.test[, 1:3], cl = knn.train$region, k = k_val)
table_model <- table(knn.predicted, knn.test$region, dnn=list('predicted','actual'))
accuracy <- sum(diag(table_model)) / sum(table_model)

# 4.3 In 1-2 sentences explain which model performs better and why you think
# that is the case.

# Model 1 (with ECO.new) performs lot better than model 2 (with PAR.new) because
# it's accuracy is higher (0.6923077 vs 0.1538462). This probably means that
# ECO.new has more "clusters" that help the model distinguish between regions
# compared to PAR.new.

