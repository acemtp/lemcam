// each entry is one video file for one position, key is the file.name of the video
videos = {};

// each entry is one minute of video that contains all position
Minutes = new Mongo.Collection();
Minutes.id = () => `min_${Random.id()}`;

// each entry is a sequence of minutes
Sequences = new Mongo.Collection();
Sequences.id = () => `seq_${Random.id()}`;
