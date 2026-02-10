library("ggplot2")
library("readr")

# set working directory (relative path)
setwd("~/coding/data_analytics/labs/lab 2/")

## read dataset
NY_House_Dataset <- read_csv("NY-House-Dataset.csv")
dataset <- NY_House_Dataset



## CLEANING DATA + LOG TRANSFORMING
dataset <- dataset[dataset$BEDS > 0 & dataset$BATH > 0,]

dataset$logPrice <- log10(dataset$PRICE)
dataset$logSqFt  <- log10(dataset$PROPERTYSQFT)
dataset$logBeds  <- log10(dataset$BEDS)
dataset$logBath  <- log10(dataset$BATH)

# cleaning sqft
ggplot(dataset, aes(x = logSqFt, y = log10(PRICE))) +
  geom_point()

lmod_sqft <- lm(logPrice ~ logSqFt, data = dataset)
summary(lmod_sqft)

sort(table(dataset$PROPERTYSQFT), decreasing = TRUE)[1:5]
dataset <- dataset[dataset$PROPERTYSQFT!=2184.207862,]
ggplot(dataset, aes(x = logSqFt, y = log10(PRICE))) +
  geom_point()

lmod_sqft <- lm(logPrice ~ logSqFt, data = dataset)
summary(lmod_sqft)

# cleaning beds
ggplot(dataset, aes(x = logBeds, y = log10(PRICE))) +
  geom_point()

lmod_bed <- lm(logPrice ~ logBeds, data = dataset)
summary(lmod_bed)

ggplot(lmod_bed, aes(x = .fitted, y = .resid)) +
  geom_point() +
  geom_hline(yintercept = 0)

outlier_check <- dataset[resid(lmod_bed) > 2, ]
table(outlier_check$BEDS)

dataset <- dataset[dataset$BEDS!=7,]
ggplot(dataset, aes(x = logBeds, y = log10(PRICE))) +
  geom_point()

lmod_bed <- lm(logPrice ~ logBeds, data = dataset)
summary(lmod_bed)

# cleaning baths
ggplot(dataset, aes(x = logBath, y = log10(PRICE))) +
  geom_point()

lmod_bath <- lm(logPrice ~ logBath, data = dataset)
summary(lmod_bath)

ggplot(lmod_bath, aes(x = .fitted, y = .resid)) +
  geom_point() +
  geom_hline(yintercept = 0)



## FITTING LINEAR MODELS

## combination 1: sqft + beds
lmod_sqft_bed <- lm(logPrice ~ logSqFt + logBeds, data = dataset)

# summary
summary(lmod_sqft_bed)

# most significant variable vs price
ggplot(dataset, aes(x = logSqFt, y = logPrice)) +
  geom_point()

# residual plot
ggplot(lmod_sqft_bed, aes(x = .fitted, y = .resid)) +
  geom_point() +
  geom_hline(yintercept = 0)

## combination 2: sqft + bath
lmod_sqft_bath <- lm(logPrice ~ logSqFt + logBath, data = dataset)

# summary
summary(lmod_sqft_bath)

# most significant variable vs price
ggplot(dataset, aes(x = logSqFt, y = logPrice)) +
  geom_point()

# residual plot
ggplot(lmod_sqft_bath, aes(x = .fitted, y = .resid)) +
  geom_point() +
  geom_hline(yintercept = 0)

# combination 3: sqft + beds + bath
lmod_all <- lm(logPrice ~ logSqFt + logBeds + logBath, data = dataset)

# summary
summary(lmod_all)

# most significant variable vs price
ggplot(dataset, aes(x = logSqFt, y = logPrice)) +
  geom_point()

# residual plot
ggplot(lmod_all, aes(x = .fitted, y = .resid)) +
  geom_point() +
  geom_hline(yintercept = 0)
