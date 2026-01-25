library(readr)
library(EnvStats)
library(nortest)

# set working directory (relative path)
setwd("~/coding/data_analytics/labs/lab 1/")

# read data
epi.data <- read_csv("epi_results_2024_pop_gdp.csv")

GDP <- epi.data$gdp
FSH <- epi.data$FSH.new

## --- Variable summaries ---

summary(GDP)
summary(FSH)

## --- Variable boxplots ---

boxplot(GDP)
boxplot(FSH)

## --- Histograms with overlayed theoretical probability distributions ---

GDP.complete <- GDP[!is.na(GDP)]
GDP.mean <- mean(GDP.complete)
GCP.sd <- sd(GDP.complete)

x <- seq(min(GDP.complete), max(GDP.complete), length = 10)
hist(GDP, x, prob=TRUE) 
GDP.x <- seq(min(GDP.complete), max(GDP.complete), length = 100)
GDP.y <- dnorm(GDP.x, GDP.mean , GCP.sd, log=FALSE)
lines(GDP.x,GDP.y)

FSH.complete <- FSH[!is.na(FSH)]
FSH.mean <- mean(FSH.complete)
FSH.sd <- sd(FSH.complete)

x <- seq(min(FSH.complete), max(FSH.complete), length = 15)
hist(FSH, x, prob=TRUE) 
FSH.x <- seq(min(FSH.complete), max(FSH.complete), length = 100)
FSH.y <- dnorm(FSH.x, FSH.mean , FSH.sd, log=FALSE)
lines(FSH.x,FSH.y)

## --- ECDF plots ---

plot(ecdf(GDP), do.points=FALSE, verticals=TRUE) 
plot(ecdf(FSH), do.points=FALSE, verticals=TRUE) 

## --- QQ plots ---

qqnorm(GDP); qqline(GDP)
qqnorm(FSH); qqline(FSH)

qqplot(GDP, FSH, xlab = "Q-Q plot for GDP & FSH") 

## --- Statistical Tests ---

shapiro.test(GDP)
shapiro.test(FSH)

ad.test(GDP)
ad.test(FSH)

ks.test(GDP,FSH)

wilcox.test(GDP,FSH)

var.test(GDP,FSH)
t.test(GDP,FSH)

