Session.set('selectedSequenceId', this._id);

Template.menu.events({
  'click .js-sequence-select'() {
    Session.set('page', 'viewer');
    Session.set('selectedSequenceId', this._id);
  },
  async 'change .js-select'(e) {
    prepareLocalFiles(e.target.files)
  },
});

Template.menu.helpers({
  sequences() { return Sequences.find({}, { sort: { startedAt: -1 } }); },
  humanizeDuration(duration) {
    let str = ''; 
    if (duration >= 60) {
      const mn = duration / 60 | 0;
      str += `${mn}min`;
      duration -= mn * 60;
    }
    str += `${duration}s`;
    return str;
  }
});
