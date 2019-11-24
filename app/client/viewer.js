
let playDate;
let playOffset;

// update the html with this offset
currentOffset = 0;
const updateOffset = offset => {
  sequence = Sequences.findOne(Session.get('selectedSequenceId'));
  if (!sequence) return;

  const date = moment(sequence.startedAt).add(offset, 'seconds');

  $('.js-video-date').html(date.format('YY-MM-DD HH:mm:ss'));
  $('.js-video-offset').html(humanizeDuration(offset));
  
  $('.line-current').attr('x1', offset).attr('x2', offset)

  currentOffset = offset;
};

// force the video to a specific position in the sequence
// "offset" is between 0s and the duration of the sequence in seconds
videoSetOffset = offset => {
  sequence = Sequences.findOne(Session.get('selectedSequenceId'));
  if (!sequence) return;

  const date = moment(sequence.startedAt).add(offset, 'seconds').toDate();

  _.each(['front', 'left', 'right', 'back'], position => {
    dbVideoSet(date, position);
  });

  updateOffset(offset);

  if (Session.get('play')) {
    playDate = new Date();
    playOffset = currentOffset;
  }
};

let currentTimeHandler;

Meteor.startup(() => {
  Tracker.autorun(() => {
    const selectedSequenceId = Session.get('selectedSequenceId');
    l({selectedSequenceId});
    extractMetaData(selectedSequenceId);
    videoSetOffset(currentOffset);
  });

  Tracker.autorun(() => {
    const play = Session.get('play');
    // _.each($('.js-video'), $video => (play && $video.currentTime < $video.duration ? $video.play() : $video.pause()));

    if (play) {
      if (currentTimeHandler) return;

      playDate = new Date();
      playOffset = currentOffset;

      // update the offset regularly
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

      videoSetOffset(currentOffset);

      // endCount = -1;
    }
  });
});

Template.viewer.events({
  'click .js-forward'() { videoSetOffset(currentOffset + 1); },
  'click .js-backward'() { videoSetOffset(Math.max(0, currentOffset - 1)); },
  'click .js-fast-forward'() { videoSetOffset(currentOffset + 10); },
  'click .js-fast-backward'() { videoSetOffset(Math.max(0, currentOffset - 10)); },
  'click .js-play-toggle'() { Session.set('play', !Session.get('play')); return false; },
  'click .js-play-speed'(e) {
    playbackRate = +e.target.dataset.speed;

    const $videosAll = $(`.js-video-test`);
    _.each($videosAll, $video => $video.playbackRate = playbackRate);

    $('.js-play-speed').removeClass('active');
    $(`.js-play-speed[data-speed="${playbackRate}"]`).addClass('active');

    return false;
  },
});
