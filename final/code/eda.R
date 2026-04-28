library(caret)
library(corrplot)
library(dplyr)
library(GGally)
library(ggplot2)
library(psych)
library(tidyr) 

numeric_vars <- c("popularity", "duration_ms", "danceability", "energy", "key", 
                  "loudness", "mode", "speechiness", "acousticness", 
                  "instrumentalness", "liveness", "valence", "tempo")
songs_numeric <- songs_clean[, numeric_vars]

#####################################################
############### Feature Distributions ###############
#####################################################

songs_long <- pivot_longer(songs_clean, 
                           cols = all_of(numeric_vars),
                           names_to = "Feature",
                           values_to = "Value")

ggplot(songs_long, aes(x = Value)) +
  geom_histogram(aes(y = after_stat(density)), bins = 30, fill = "#016450", color = "darkgreen", alpha = 0.7) +
  geom_density(color = "#1fd35e", linewidth = 1) + 
  facet_wrap(~ Feature, scales = "free", ncol = 3) + 
  theme_minimal() +
  labs(
       x = "Feature Value",
       y = "Density")

##################################################
############### Correlation Matrix ###############
##################################################

cor_matrix <- cor(songs_numeric, use = "complete.obs")
color_palette <- colorRampPalette(c("red", "white", "#016450"))(200)
corrplot(cor_matrix, 
         method = "color", 
         type = "upper", 
         tl.col = "black", 
         tl.cex = 0.8, 
         addCoef.col = "black", 
         number.cex = 0.6, 
         col = color_palette, 
         mar = c(0,0,0,0))

#############################################
############### ANOVA Testing ###############
#############################################

anova_results <- data.frame(
  Feature = character(),
  P_Value = numeric(),
  stringsAsFactors = FALSE
)

# for each feature, run AVONA to see if the mean values differ significantly
# across genres
for (feature in numeric_vars) {
  formula_str <- paste(feature, "~ track_genre")
  anova_model <- aov(as.formula(formula_str), data = songs_clean)
  model_summary <- summary(anova_model)
  p_value <- model_summary[[1]][["Pr(>F)"]][1]
  anova_results <- rbind(anova_results, data.frame(Feature = feature, P_Value = p_value))
}

# sort results
anova_results <- anova_results[order(anova_results$P_Value), ]
print(anova_results)

###############################################
########        Top 10 Features        ########
######## Inspired from the Abalone Lab ########
###############################################

# get the top 10 features
top_10_genres <- songs_clean |>
  group_by(track_genre) |>
  summarize(avg_popularity = mean(popularity, na.rm = TRUE)) |>
  arrange(desc(avg_popularity)) |>
  slice_head(n = 10)

# extract names of genres into alist
target_genres <- top_10_genres$track_genre

# filter main dataset to only keep tracks from those genres
songs_top_10 <- songs_clean |>
  filter(track_genre %in% target_genres)

# drop empty factor levels (important for classification)
songs_top_10$track_genre <- droplevels(songs_top_10$track_genre)

# scale numeric features using Z-score standardization
songs_scaled <- songs_top_10
songs_scaled[, numeric_vars] <- scale(songs_scaled[, numeric_vars])

# split train/test (70% training, 30% testing)
set.seed(123)
train.indexes <- sample(nrow(songs_scaled), 0.7 * nrow(songs_scaled))

train <- songs_scaled[train.indexes, ]
test <- songs_scaled[-train.indexes, ]

X <- train[, numeric_vars]
Y <- train$track_genre

# ==========================================
# Feature-Class Plots
# ==========================================

green_theme <- list(
  box.rectangle = list(col = "#1fd35e"),   # Changes the actual boxes
  box.umbrella  = list(col = "#1fd35e"),   # Changes the whiskers
  plot.symbol   = list(col = "#016450")    # Changes the outlier dots
)

# Box Plot
featurePlot(x = X, 
            y = Y, 
            plot = "box", 
            main = "Top 10 Genres: Feature Box Plots",
            par.settings = green_theme)

# Density Plot
scales <- list(x = list(relation = "free"), y = list(relation = "free"))
featurePlot(x = X, y = Y, plot = "density", scales = scales, 
            main = "Top 10 Genres: Feature Density Overlap",
            par.settings = green_theme)
