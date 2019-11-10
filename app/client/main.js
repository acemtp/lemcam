Session.setDefault('selectedMinuteId', undefined);
Session.setDefault('currentTime', 0.0);
Session.setDefault('play', false);

let speed = 1;

let canPlayCount = -1;

endCount = -1;

Tracker.autorun(() => {
  const selectedMinuteId = Session.get('selectedMinuteId');
  if (!selectedMinuteId) return;
  const minute = Minutes.findOne(selectedMinuteId);
  if (!minute) return;

  canPlayCount = 0;

  _.each(['front', 'left', 'right', 'back'], position => {
    const video = $(`.js-video[data-position="${position}"]`)[0];
    video.src = videos[minute[position]] ? URL.createObjectURL(videos[minute[position]]) : '';
    video.playbackRate = speed;
  });

  Session.set('currentTime', 0);
});

let currentTimeHandler;

Tracker.autorun(() => {
  const play = Session.get('play');
  _.each($('.js-video'), $video => (play && $video.currentTime < $video.duration ? $video.play() : $video.pause()));

  if (play) {
    currentTimeHandler = Meteor.setInterval(() => {
      Session.set('currentTime', $('.js-video[data-position="left"]')[0].currentTime);
    }, 100);

    endCount = 0;
    _.each($('.js-video'), $video => { if ($video.currentTime >= $video.duration) endCount++; });
  } else {
    if (currentTimeHandler) Meteor.clearInterval(currentTimeHandler);
    currentTimeHandler = undefined;
    endCount = -1;
  }
});


Template.viewer.events({
  'click .js-play-toggle'() { Session.set('play', !Session.get('play')); return false; },
  'click .js-play-speed'(e) {
    speed = +e.target.dataset.speed;
    _.each($('.js-video'), $video => $video.playbackRate = speed);

    $('.js-play-speed').removeClass('active');
    $(`.js-play-speed[data-speed="${speed}"]`).addClass('active');

    return false;
  },
  'ended .js-video'(e) {
    l({ m: 'end', t: e.target, endCount, cu: e.target.currentTime, du: e.target.duration });
    if (endCount === -1) return;

    if (endCount === 2) {
      const selectedMinuteId = Session.get('selectedMinuteId');
      if (!selectedMinuteId) return;
      const minute = Minutes.findOne(selectedMinuteId);
      if (!minute) return;

      const nextMinute = Minutes.findOne({ createdAt: { $gt: minute.createdAt } }, { sort: { createdAt: 1 } });
      if (!nextMinute) return;
      Session.set('selectedMinuteId', nextMinute._id);

      endCount = 0;
    } else endCount++;
  },
  'canplay .js-video'() {
    if (canPlayCount === -1) return;

    if (canPlayCount === 2) {
      canPlayCount = -1;

      const play = Session.get('play');
      _.each($('.js-video'), $video => (play && $video.currentTime < $video.duration ? $video.play() : $video.pause()));
    } else canPlayCount++;
  },
  'change .js-select'(e) {
    // files = _.filter(e.target.files, f => f.type.indexOf('video') === 0);
    // $('.js-video')[0].src = 'https://file-examples.com/wp-content/uploads/2017/04/file_example_MP4_480_1_5MG.mp4';
    // $('.js-video')[0].src = URL.createObjectURL(files[0]);

    _.each(e.target.files, file => {
      const date = moment(file.name, 'YYYY-MM-DD_HH-mm-ss');

      if (!date.isValid()) return;

      const splitted = file.name.split('-');
      if (splitted.length < 6) return;
      const position = splitted[5].replace('_repeater', '').replace('.mp4', ''); // front right left back

      if (!videos[file.name]) videos[file.name] = file;

      const minute = Minutes.findOne({ createdAt: date.toDate() });
      if (minute) Minutes.update(minute._id, { $set: { [position]: file.name } });
      else Minutes.insert({ _id: Minutes.id(), createdAt: date.toDate(), [position]: file.name });
    });

    Minutes.find({}, { sort: { createdAt: 1 } }).forEach(minute => {
      const newestSequence = Sequences.findOne({}, { sort: { startedAt: -1 } });
      if (!newestSequence || minute.createdAt - newestSequence.endedAt > 90 * 1000) {
        Sequences.insert({
          _id: Sequences.id(),
          startedAt: minute.createdAt,
          endedAt: moment(minute.createdAt).add(60, 'seconds').toDate(),
          minuteIds: [minute._id],
        });
      } else {
        Sequences.update(newestSequence._id, {
          $set: { endedAt: moment(minute.createdAt).add(60, 'seconds').toDate() },
          $push: { minuteIds: minute._id },
        });
      }
    });

    const minute = Minutes.findOne({}, { sort: { createdAt: -1 } });
    if (minute) Session.set('selectedMinuteId', minute._id);

    // var myPlayer = videojs('my-player');
    // myPlayer.src('https://file-examples.com/wp-content/uploads/2017/04/file_example_MP4_480_1_5MG.mp4');
    // myPlayer.src(URL.createObjectURL(files[0]));
  },
  'click .js-minute-select'() {
    Session.set('selectedMinuteId', this._id);
  },
  'click .js-minute-select.active'(e) {
    Session.set('currentTime', e.offsetX);
    Session.set('currentTimeMousePosition', e.offsetX);
    _.each($('.js-video'), $video => $video.currentTime = e.offsetX);
    const play = Session.get('play');
    if (play) _.each($('.js-video'), $video => (play && $video.currentTime < $video.duration ? $video.play() : $video.pause()));
  },
  'mouseenter .js-minute-select.active'(e) {
    Session.set('currentTimeMousePosition', e.offsetX);
  },
  'mouseleave .js-minute-select.active'() {
    Session.set('currentTimeMousePosition', -1);
  },
  'mousemove .js-minute-select.active'(e) {
    Session.set('currentTimeMousePosition', e.offsetX);

    if (e.which || e.buttons) {
      Session.set('currentTime', e.offsetX);
      _.each($('.js-video'), $video => $video.currentTime = e.offsetX);
      const play = Session.get('play');
      if (play) _.each($('.js-video'), $video => (play && $video.currentTime < $video.duration ? $video.play() : $video.pause()));
    }
  },
});

Template.viewer.helpers({
  sequences() { return Sequences.find({}, { sort: { createdAt: 1 } }); },
  minute() { return Minutes.findOne(`${this}`); },
  createdAtAndCurrent() { return moment(this.createdAt).add(Session.get('currentTime'), 'seconds'); },
  minuteBackground() {
    const currentTime = Session.get('currentTime');
    const currentTimePercent = currentTime * 100 / 60;

    const currentTimeMousePosition = Session.get('currentTimeMousePosition');
    const currentTimeMousePositionPercent = currentTimeMousePosition * 100 / 60;
    if (currentTimeMousePositionPercent < currentTimePercent) {
      return `linear-gradient(to right, #BF616A 0%, #BF616A ${currentTimeMousePositionPercent}%, #8FBCBB ${currentTimeMousePositionPercent}%, #8FBCBB ${currentTimePercent}%, #E5E9F0 ${currentTimePercent}%, #E5E9F0 100%)`;
    } else {
      return `linear-gradient(to right, #BF616A 0%, #BF616A ${currentTimeMousePositionPercent}%, #E5E9F0 ${currentTimeMousePositionPercent}%, #E5E9F0 100%)`;
    }
  },
});
