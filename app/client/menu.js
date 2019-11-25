Session.set('selectedSequenceId', this._id);

Template.menu.events({
  async 'change .js-select'(e) {
    prepareLocalFiles(e.target.files)
  },
  'click .js-sequence-select'() {
    Session.set('page', 'viewer');
    Session.set('selectedSequenceId', this._id);
  },
  'click .js-video-select'() {
    Session.set('page', 'video');
    Session.set('selectedVideoId', this._id);
  },
});

Template.menu.helpers({
  sequences() { return Sequences.find({}, { sort: { startedAt: -1 } }); },
  videos() { return Videos.find({}, { sort: { startedAt: -1 } }); },
  humanizeDuration(duration) { return humanizeDuration(duration); },
});
