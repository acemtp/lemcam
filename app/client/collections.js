// each entry is one video file for one position, key is the file.name of the video
files = {};

// each entry is one video metadata for one position
Videos = new Mongo.Collection(null);
Videos.id = () => `vid_${Random.id()}`;

// each entry is one minute of video that contains all position
Minutes = new Mongo.Collection(null);
Minutes.id = () => `min_${Random.id()}`;

// each entry is a sequence of minutes
Sequences = new Mongo.Collection(null);
Sequences.id = () => `seq_${Random.id()}`;
