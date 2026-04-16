export type Song = {
  track_id: string;
  track_name: string;
  artists: string;
  album_name: string;
  track_genre: string;
  cluster: string;
  x: number;
  y: number;
  energy: number;
  danceability: number;
  valence: number;
  tempo: number;
  acousticness: number;
  instrumentalness: number;
};

export type Group = {
  group: string;
  energy_mean: number;
  danceability_mean: number;
  valence_mean: number;
  tempo_mean: number;
  acousticness_mean: number;
  instrumentalness_mean: number;
  seen_in: string[];
};

export type GroupDetails = {
  group: string;
  title: string;
  description: string;
  insight: string;
};
