library(readr)

# set working directory
setwd("~/coding/data-analytics/final")

# read the dataset
songs <- read.csv("songs.csv", stringsAsFactors = FALSE)

# clean the dataset by replacing "?" and -1 with NA, then removing rows with NA values
songs[songs == "?"] <- NA
songs[songs == -1] <- NA
songs[songs == "-1"] <- NA
songs_clean <- na.omit(songs)

# convert track_genre to a factor for classification tasks
songs_clean$track_genre <- as.factor(songs_clean$track_genre)

# remvove "Unnamed: 0" and "X" if they exist
songs_clean <- songs_clean[, !(names(songs_clean) %in% c("X", "Unnamed..0"))]

summary(songs_clean)
