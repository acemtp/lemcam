Template.video.onRendered(function () {
  if (!this.myPlayer) this.myPlayer = videojs('my-video');
  // this.myPlayer.src('https://file-examples.com/wp-content/uploads/2017/04/file_example_MP4_480_1_5MG.mp4');
});

Template.video.events({
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
  'click .js-video-create'() {
    sequence = Sequences.findOne(Session.get('selectedSequenceId'));
    if (!sequence) return;

    const startedX = $('.line-start').attr('x1');
    const startedAt = moment(sequence.startedAt).add(startedX, 'seconds').toDate();

    const endedX = $('.line-end').attr('x1');
    const endedAt = moment(sequence.startedAt).add(endedX, 'seconds').toDate();

l({ ss: sequence.startedAt, startedX, startedAt, endedX, endedAt})

    const clips = Clips.find({ sequenceId: sequence._id, startedAt: { $lte: endedAt }, endedAt: { $gt: startedAt } }, { sort: { startedAt: 1 } }).fetch();

    const uploadInProgressCount = clips.length;

    videoId = Videos.id();
    Videos.insert({
      _id: videoId,
      startedAt,
      endedAt,
      duration: (endedAt - startedAt) / 1000,
      clips,
      uploadInProgressCount,
    });

    log('new video', { video: Videos.findOne(videoId) });

    const uploadClip = (videoId, clipId) => {
      const video = Videos.findOne(videoId);
      const clip = Clips.findOne(clipId);
      const upload = Files.insert({ file: localFiles[clip.name], fileId: clipId, streams: 'dynamic', chunkSize: 'dynamic' }, false);
      upload.on('start', function () { log('file upload start', clipId); });
      upload.on('end', (error, fileObj) => {
        Videos.update(videoId, { $inc: { uploadInProgressCount: -1 } });
        const video = Videos.findOne(videoId);
        log('uploadClip: file upload end', { clipId, video });
        if (video.uploadInProgressCount === 0) {
          log('uploadClip: file all upload end, generate the video');
          Meteor.call('videoCreate', videoId);
        }
      });
      upload.start();
    };

    _.each(clips, clip => { uploadClip(videoId, clip._id); });

    return false;
  }
});
