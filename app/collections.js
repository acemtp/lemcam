Files = new FilesCollection({
  collectionName: 'Files',
  storagePath: '/tmp/lemcam/files',
  downloadRoute: '/api/files',
  public: true,
  debug: true,
});

// a video is a concatenation of different Clips in one video and published
Videos = new Mongo.Collection('videos');
Videos.id = () => `vid_${Random.id()}`;
if (Meteor.isServer) {
  Videos.deny({
    insert() { return false; },
    update() { return false; },
    remove() { return true; },
  });
  Videos.allow({
    insert() { return true; },
    update() { return true; },
    remove() { return false; },
  });
}
