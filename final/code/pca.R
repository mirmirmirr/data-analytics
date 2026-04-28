library(caret)
library(ggplot2)
library(ggfortify) 

numeric_vars <- c("popularity", "danceability", "energy", "key", 
                  "loudness", "mode", "speechiness", "acousticness", 
                  "instrumentalness", "liveness", "valence", "tempo")
songs_numeric <- songs_scaled[, numeric_vars]

# run PCA with scaling and centering (standardization)
pca_model <- prcomp(songs_numeric, center = TRUE, scale. = TRUE)

summary(pca_model)

## PCA 1
pc1_loadings <- pca_model$rotation[, "PC1"]
sorted_pc1 <- sort(abs(pc1_loadings), decreasing = TRUE)

print("Variables driving Principal Component 1 (Highest to Lowest):")
print(sorted_pc1)

## PCA 2
pc2_loadings <- pca_model$rotation[, "PC2"]
sorted_pc2 <- sort(abs(pc2_loadings), decreasing = TRUE)

print("Variables driving Principal Component 2 (Highest to Lowest):")
print(sorted_pc2)

## PCA Biplot
autoplot(pca_model, 
         data = songs_scaled, 
         colour = '#C0E6D9',
         alpha = 0.1,
         loadings = TRUE, 
         loadings.colour = '#1fd35e', 
         loadings.label = TRUE, 
         loadings.label.size = 4, 
         loadings.label.colour = 'black') +
  theme_minimal() +
  ggtitle("PCA Biplot")
