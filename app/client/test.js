
let playDate;
let playOffset;

// update the html with this offset
currentOffset = 0;
const updateOffset = offset => {
  sequence = Sequences.findOne();
  if (!sequence) return;

  const date = moment(sequence.startedAt).add(offset, 'seconds');

  $('.js-video-date').html(date.format('MM-DD-YYYY HH:mm:ss'));
  $('.js-video-offset').html(Number(offset).toFixed(2));
  
  $('.line-current').attr('x1', offset).attr('x2', offset)

  currentOffset = offset;
};

// force the video to a specific position in the sequence
// "offset" is between 0s and the duration of the sequence in seconds
videoSetOffset = offset => {
  sequence = Sequences.findOne();
  if (!sequence) return;

  const date = moment(sequence.startedAt).add(offset, 'seconds').toDate();

  const $videosAll = $(`.js-video-test`);
  _.each($videosAll, video => video.pause());
  _.each($videosAll, video => video.playbackRate = playbackRate);
  _.each($videosAll, video => video.currentTime = 0);
  $(`.js-video-test`).hide();

  _.each(['front', 'left', 'right', 'back'], position => {
    const video = Clips.findOne({ position, startedAt: { $lte: date }, endedAt: { $gte: date } });
    if (!video) {
      const nextVideo = Clips.findOne({ position, startedAt: { $gte: date } }, { sort: { startedAt: 1 } });
      if (!nextVideo) {
        log(Sequences.findOne());
        return;
      }
      log('no video for now, display the next one', { nextVideo, ct: (date - nextVideo.startedAt) / 1000 });

      const $videos = $(`.js-video-test[data-video-id="${nextVideo._id}"]`);
      if (!$videos.length) return;
      $videos[0].playbackRate = playbackRate;
      $videos[0].currentTime = 0;
      if (Session.get('play')) Meteor.setTimeout(() => { $videos[0].play(); }, nextVideo.startedAt - date);
      $videos.show();

      return;
    }

    const $videos = $(`.js-video-test[data-video-id="${video._id}"]`);
    if (!$videos.length) return;
    $videos[0].playbackRate = playbackRate;
    $videos[0].currentTime = (date - video.startedAt) / 1000;
    if (Session.get('play')) $videos[0].play();
    $videos.show();
  });

  updateOffset(offset);

  if (Session.get('play')) {
    playDate = new Date();
    playOffset = currentOffset;
  }
};

let currentTimeHandler;

Tracker.autorun(() => {
  const play = Session.get('play');
  // _.each($('.js-video'), $video => (play && $video.currentTime < $video.duration ? $video.play() : $video.pause()));

  if (play) {
    if (currentTimeHandler) return;

    playDate = new Date();
    playOffset = currentOffset;

    currentTimeHandler = Meteor.setInterval(() => {
      const offset = playOffset + playbackRate * (new Date() - playDate) / 1000;
      updateOffset(offset);
    }, 100);

    videoSetOffset(playOffset);
    // endCount = 0;
    // _.each($('.js-video'), $video => { if ($video.currentTime >= $video.duration) endCount++; });
  } else {
    if (currentTimeHandler) Meteor.clearInterval(currentTimeHandler);
    currentTimeHandler = undefined;

    videoSetOffset(playOffset);

    // endCount = -1;
  }
});

Template.test.helpers({
  sequence() { return Sequences.findOne(); },
  video() { return Clips.findOne(`${this}`); },
  url(name) { return name ? URL.createObjectURL(files[name]) : '' },
});

Template.viewer.events({
  'ended .js-video-test'(e) {
    l({ m: 'testend', aa: this, t: e.target, d: e.target.dataset, cu: e.target.currentTime, du: e.target.duration });

    const sequence = Sequences.findOne();
    if (!sequence) return;

    const nextVideoIndex = sequence[`${this.position}VideoIds`].indexOf(this._id) + 1;
    if (nextVideoIndex >= sequence[`${this.position}VideoIds`].length) return;
    const nextVideoId = sequence[`${this.position}VideoIds`][nextVideoIndex];

    // const nextVideo = Clips.findOne(nextVideoId);
    // if (!nextVideo) return;

    const currentTime = Session.get('currentTime');
    const currentDate = moment(sequence.startedAt).add(currentTime, 'seconds').toDate();

    const $videos = $(`.js-video-test[data-video-id="${this._id}"]`);
    $videos.hide();

    const $nextVideos = $(`.js-video-test[data-video-id="${nextVideoId}"]`);
    if (!$nextVideos.length) return;
    $nextVideos[0].playbackRate = playbackRate;

// XXX faire que ca deporte le play a plus tard si la video est trop en avance

    $nextVideos[0].currentTime = (currentDate - nextVideo.startedAt) / 1000;
    if (Session.get('play')) Meteor.setTimeout(() => { $videos[0].play(); }, nextVideo.startedAt - date);
    $nextVideos[0].play();
    $nextVideos.show();
  },
});
