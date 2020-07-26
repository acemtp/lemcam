Template.videosMenu.events({
  'click .js-video-select'() {
    Session.set('page', 'video');
    Session.set('selectedVideoId', this._id);
  },
});

Template.videosMenu.helpers({
  videos() { return Videos.find({}, { sort: { startedAt: -1 } }); },
  humanizeDuration(duration) { return humanizeDuration(duration); },
});

Template.video.onRendered(function () {
  this.autorun(() => {
    FlowRouter.watchPathChange();
    if (!this.myPlayer) this.myPlayer = videojs('my-video');
    this.myPlayer.src({ type: 'video/mp4', src: `http://localhost:3200/video/${FlowRouter.current().params._id}` });
  });
});

Template.video.events({
});

Template.video.helpers({
});

Template.video.onDestroyed(function () {
  this.myPlayer?.dispose();
});
