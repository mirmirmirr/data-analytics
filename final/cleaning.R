################################################
######## Data Cleaning: Spotify Dataset ########
################################################

library(readr)

# set working directory (relative path)
setwd("~/coding/data-analytics/final")

## Read the Spotify tracks dataset
songs <- read.csv("songs.csv", stringsAsFactors = FALSE)

## Check the initial dimensions of the dataset
print(paste("Initial dimensions:", nrow(songs), "rows,", ncol(songs), "columns"))

## Replace common placeholders for missing or invalid data with NA
songs[songs == "?"] <- NA
songs[songs == -1] <- NA
songs[songs == "-1"] <- NA

## Remove all rows containing NA or NaN values
songs_clean <- na.omit(songs)

## Convert the target class label (track_genre) to a factor
songs_clean$track_genre <- as.factor(songs_clean$track_genre)

## Remove the "Unnamed: 0" column if they exist in the dataset since they aren't
## useful for modeling
songs_clean <- songs_clean[, !(names(songs_clean) %in% c("X", "Unnamed..0"))]

## Check the cleaned dimensions and verify the structure
print(paste("Cleaned dimensions:", nrow(songs_clean), "rows,", ncol(songs_clean), "columns"))
summary(songs_clean)


################################
######## Genre Profiles ########
################################

library(dplyr)

genre_profiles <- songs_clean |>
  group_by(track_genre) |>
  summarise(
    popularity = mean(popularity, na.rm = TRUE),

    energy_mean = mean(energy, na.rm = TRUE),
    energy_sd = sd(energy, na.rm = TRUE),

    danceability_mean = mean(danceability, na.rm = TRUE),
    danceability_sd = sd(danceability, na.rm = TRUE),

    valence_mean = mean(valence, na.rm = TRUE),
    valence_sd = sd(valence, na.rm = TRUE),

    tempo_mean = mean(tempo, na.rm = TRUE),
    tempo_sd = sd(tempo, na.rm = TRUE),

    acousticness_mean = mean(acousticness, na.rm = TRUE),
    acousticness_sd = sd(acousticness, na.rm = TRUE),

    instrumentalness_mean = mean(instrumentalness, na.rm = TRUE),
    instrumentalness_sd = sd(instrumentalness, na.rm = TRUE),
  ) |>
  arrange(desc(popularity))

genre_profiles_scaled <- genre_profiles |>
  mutate(across(-track_genre, ~ (. - min(.)) / (max(.) - min(.))))

#############################
######## Cluster Map ########
#############################

library(ggplot2)
library(Rtsne)
library(uwot)

song_sample = songs_clean |>
  filter(track_genre %in% (genre_profiles |> slice_head(n = 10) |> pull(track_genre)))

features <- song_sample |>
  select(energy, danceability, valence, tempo, acousticness, instrumentalness)

features_scaled <- scale(features)

pca <- prcomp(features_scaled)
reduced <- pca$x[,1:5]

set.seed(42)
k <- 10
kmeans_result <- kmeans(reduced, centers = k,)

tsne <- Rtsne(reduced, perplexity = 30, check_duplicates = FALSE)

song_sample$cluster <- as.factor(kmeans_result$cluster)
song_sample$x <- tsne$Y[,1]
song_sample$y <- tsne$Y[,2]

ggplot(song_sample, aes(x, y, color = cluster)) +
  geom_point(alpha = 0.6)

ggplot(song_sample, aes(x, y, color = track_genre)) +
  geom_point(alpha = 0.6)

##################################
######## Cluster Profiles ########
##################################

cluster_profiles <- song_sample |>
  group_by(cluster) |>
  summarise(
    popularity = mean(popularity, na.rm = TRUE),

    energy_mean = mean(energy, na.rm = TRUE),
    energy_sd = sd(energy, na.rm = TRUE),

    danceability_mean = mean(danceability, na.rm = TRUE),
    danceability_sd = sd(danceability, na.rm = TRUE),

    valence_mean = mean(valence, na.rm = TRUE),
    valence_sd = sd(valence, na.rm = TRUE),

    tempo_mean = mean(tempo, na.rm = TRUE),
    tempo_sd = sd(tempo, na.rm = TRUE),

    acousticness_mean = mean(acousticness, na.rm = TRUE),
    acousticness_sd = sd(acousticness, na.rm = TRUE),

    instrumentalness_mean = mean(instrumentalness, na.rm = TRUE),
    instrumentalness_sd = sd(instrumentalness, na.rm = TRUE),
  ) |>
  arrange(desc(popularity))

################################
######## Exporting Data ########
################################

library(jsonlite)

export_data_songs <- song_sample |>
  select(
    track_id,
    track_name,
    artists,
    album_name,
    track_genre,
    cluster,
    x,
    y,
    energy,
    danceability,
    valence,
    tempo,
    acousticness,
    instrumentalness
  )

write_json(export_data_songs, "songs.json", pretty = TRUE)

# --- Genre JSON (Includes 'clusters' list sorted by frequency) ---
export_data_genre <- genre_profiles |>
  slice_head(n = 10) |>
  select(
    track_genre,
    energy_mean,
    danceability_mean,
    valence_mean,
    tempo_mean,
    acousticness_mean,
    instrumentalness_mean
  ) |>
  left_join(
    song_sample |>
      group_by(track_genre) |>
      summarise(
        clusters = list(as.integer(names(sort(table(cluster), decreasing = TRUE))[1:5]))
      ),
    by = "track_genre"
  )

write_json(export_data_genre, "genre.json", pretty = TRUE)

export_data_cluster <- cluster_profiles |>
  select(
    cluster,
    energy_mean,
    danceability_mean,
    valence_mean,
    tempo_mean,
    acousticness_mean,
    instrumentalness_mean
  ) |>
  left_join(
    song_sample |>
      group_by(cluster) |>
      summarise(
        genres = list(as.character(names(sort(table(track_genre), decreasing = TRUE))[1:5]))
      ),
    by = "cluster"
  ) |>
  arrange(cluster)

write_json(export_data_cluster, "cluster.json", pretty = TRUE)