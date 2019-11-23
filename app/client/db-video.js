dbVideoNext = position => {
  const $dbVideos = $(`.js-db-video[data-position="${position}"]`);
  if (!$dbVideos.length) return;
  const data = Blaze.getData($dbVideos[0]);

  const clip = Clips.findOne(data.currentClipIds[data.currentBuffer]);
  if (!clip) return;

  dbVideoSet(clip.endedAt, position);
};

dbVideoSet = (date, position) => {
  const clips = Clips.find({ position, endedAt: { $gt: date } }, { sort: { startedAt: 1 }, limit: 2 }).fetch();
  if (clips.length === 0) {
    log('dbVideoSet: no clip found', { date, position });
    return;
  }

  const $dbVideos = $(`.js-db-video[data-position="${position}"]`);
  if (!$dbVideos.length) return;
  const data = Blaze.getData($dbVideos[0]);

  log('dbVideoSet', { date, position, clips, data });

  const clip = clips[0];

  const swap = clip._id === data.currentClipIds[1 - data.currentBuffer];

  if (swap) {
    log('dbVideoSet swap');
    $(`.js-video-test[data-position="${clip.position}"][data-buffer="${data.currentBuffer}"]`).hide();
    data.currentBuffer = 1 - data.currentBuffer;
  }

  const $videos = $(`.js-video-test[data-position="${clip.position}"][data-buffer="${data.currentBuffer}"]`);
  if (!$videos.length) return;
  const video = $videos[0];
  if (clip._id !== data.currentClipIds[data.currentBuffer]) {
    log('dbVideoSet load front buffer');
    video.src = URL.createObjectURL(files[clip.name]);
    video.playbackRate = playbackRate;
    data.currentClipIds[data.currentBuffer] = clip._id;
    if (Session.get('play')) video.play();
  }
  log('dbVideoSet set front buffer');
  const delta = date - clip.startedAt;
  video.currentTime = Math.max(0, delta / 1000);
  $videos.show();
  if (Session.get('play')) {
    if (delta < 0) {
      log('dbVideoSet wait empty start', { delta });
      video.pause();
      Meteor.setTimeout(() => {
        log('dbVideoSet timeout start');
        video.play();
      }, -delta / playbackRate);
    } else {
      video.play();
    }
  } else video.pause();

  if (clips.length === 2) {
    const clip = clips[1];
    const $videos = $(`.js-video-test[data-position="${clip.position}"][data-buffer="${1 - data.currentBuffer}"]`);
    if (!$videos.length) return;
    const video = $videos[0];
    if (clip._id !== data.currentClipIds[1 - data.currentBuffer]) {
      log('dbVideoSet load back buffer');
      video.src = URL.createObjectURL(files[clip.name]);
      data.currentClipIds[1 - data.currentBuffer] = clip._id;
      video.playbackRate = playbackRate;
      video.currentTime = 0;
      video.pause();
    }
  }

  //   const nextVideo = Clips.findOne({ position, startedAt: { $gt: date } }, { sort: { startedAt: 1 } });
  //   if (!nextVideo) {
  //     log(Sequences.findOne());
  //     return;
  //   }
  //   log('no video for now, display the next one', { nextVideo, ct: (date - nextVideo.startedAt) / 1000 });

  //   const $videos = $(`.js-video-test[data-video-id="${nextVideo._id}"]`);
  //   if (!$videos.length) return;
  //   $videos[0].playbackRate = playbackRate;
  //   $videos[0].currentTime = 0;
  //   if (Session.get('play')) Meteor.setTimeout(() => { $videos[0].play(); }, nextVideo.startedAt - date);
  //   $videos.show();

  //   return;
  // }
};

Template.dbVideo.onCreated(function() {
  const { position } = this.data;
  this.data.currentBuffer = 0;
  this.data.currentClipIds = [undefined, undefined];
});

Template.dbVideo.events({
  'ended .js-video-test'(e) {
    l({ m: 'testend', aa: this, t: e.target, d: e.target.dataset, cu: e.target.currentTime, du: e.target.duration });

    const sequence = Sequences.findOne();
    if (!sequence) return;

    dbVideoNext(this.position);
return;

    const nextVideoIndex = sequence[`${this.position}VideoIds`].indexOf(this._id) + 1;
    if (nextVideoIndex >= sequence[`${this.position}VideoIds`].length) return;
    const nextVideoId = sequence[`${this.position}VideoIds`][nextVideoIndex];

    // const nextVideo = Clips.findOne(nextVideoId);
    // if (!nextVideo) return;

    // const currentTime = Session.get('currentTime');
    // const currentDate = moment(sequence.startedAt).add(currentTime, 'seconds').toDate();

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
