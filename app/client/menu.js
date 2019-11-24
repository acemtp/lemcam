Session.set('selectedSequenceId', this._id);

Template.menu.events({
  'click .js-sequence-select'() {
    Session.set('page', 'viewer');
    Session.set('selectedSequenceId', this._id);
  },
});

Template.menu.helpers({
  sequences() { return Sequences.find({}, { sort: { startedAt: -1 } }); },
});
