Session.setDefault('selectedMinuteId', undefined);
Session.set('play', false);

playbackRate = 1;

let canPlayCount = -1;

Meteor.subscribe('videos');

Template.viewer.events({
  'click .js-play-toggle'() { Session.set('play', !Session.get('play')); return false; },
  'click .js-play-speed'(e) {
    playbackRate = +e.target.dataset.speed;

    const $videosAll = $(`.js-video-test`);
    _.each($videosAll, $video => $video.playbackRate = playbackRate);

    $('.js-play-speed').removeClass('active');
    $(`.js-play-speed[data-speed="${playbackRate}"]`).addClass('active');

    return false;
  },
  // 'ended .js-video'(e) {
  //   l({ m: 'end', t: e.target, endCount, cu: e.target.currentTime, du: e.target.duration });
  //   if (endCount === -1) return;

  //   if (endCount === 2) {
  //     const selectedMinuteId = Session.get('selectedMinuteId');
  //     if (!selectedMinuteId) return;
  //     const minute = Minutes.findOne(selectedMinuteId);
  //     if (!minute) return;

  //     const nextMinute = Minutes.findOne({ createdAt: { $gt: minute.createdAt } }, { sort: { createdAt: 1 } });
  //     if (!nextMinute) return;
  //     Session.set('selectedMinuteId', nextMinute._id);

  //     endCount = 0;
  //   } else endCount++;
  // },
  'canplay .js-video'() {
    if (canPlayCount === -1) return;

    if (canPlayCount === 2) {
      canPlayCount = -1;

      const play = Session.get('play');
      _.each($('.js-video'), $video => (play && $video.currentTime < $video.duration ? $video.play() : $video.pause()));
    } else canPlayCount++;
  },
  async 'change .js-select'(e) {
    // localFiles = _.filter(e.target.files, f => f.type.indexOf('video') === 0);
    // $('.js-video')[0].src = 'https://file-examples.com/wp-content/uploads/2017/04/file_example_MP4_480_1_5MG.mp4';
    // $('.js-video')[0].src = URL.createObjectURL(localFiles[0]);

    _.each(e.target.files, file => {
      const date = moment(file.name, 'YYYY-MM-DD_HH-mm-ss');

      if (!date.isValid()) return;

      const splitted = file.name.split('-');
      if (splitted.length < 6) return;
      const position = splitted[5].replace('_repeater', '').replace('.mp4', ''); // front right left back

      if (!localFiles[file.name]) localFiles[file.name] = file;

      // const minute = Minutes.findOne({ createdAt: date.toDate() });
      // if (minute) Minutes.update(minute._id, { $set: { [position]: file.name } });
      // else Minutes.insert({ _id: Minutes.id(), createdAt: date.toDate(), [position]: file.name });
    });

    log('files insert');

    await Promise.all(_.map(localFiles, async file => {
      for (let pos = 0, i = 0; i < 10 && pos < file.size; i++) {
        let s = (new DataView(await file.slice(pos, pos + 4).arrayBuffer())).getUint32();
        const t = (await (await file.slice(pos + 4, pos + 8)).text());
        // console.log({ pos, t, s });
        if (t === 'moov') s = 8;
        if (t === 'mvhd') {
          if (Clips.findOne({ name: file.name })) return;

          const clip = {
            _id: Clips.id(),
            name: file.name,
          };

          const splitted = file.name.split('-');
          if (splitted.length < 6) return;
          clip.position = splitted[5].replace('_repeater', '').replace('.mp4', ''); // front right left back

          let d;
          d = (new DataView(await file.slice(pos + (3 * 4) , pos + (3 * 4) + 4).arrayBuffer())).getUint32();
          clip.startedAt = moment(d * 1000 - 2082844800000).toDate();

          d = (new DataView(await file.slice(pos + (4 * 4) , pos + (4 * 4) + 4).arrayBuffer())).getUint32();
          clip.endedAt = moment(d * 1000 - 2082844800000).toDate();

          const timeScale = (new DataView(await file.slice(pos + (5 * 4) , pos + (5 * 4) + 4).arrayBuffer())).getUint32();
          clip.duration = (new DataView(await file.slice(pos + (6 * 4) , pos + (6 * 4) + 4).arrayBuffer())).getUint32() / timeScale;

          Clips.insert(clip);
          return;
        }
        pos += s;
      }
    }));

    Clips.find({}, { sort: { startedAt: 1 } }).forEach(clip => {
      const newestSequence = Sequences.findOne({}, { sort: { startedAt: -1 } });
      let sequenceId;
      if (!newestSequence || clip.startedAt - newestSequence.endedAt > 90 * 1000) {
        sequenceId = Sequences.id();
        Sequences.insert({
          _id: sequenceId,
          startedAt: clip.startedAt,
          endedAt: clip.endedAt,
          duration: (clip.endedAt - clip.startedAt) / 1000,
          [`${clip.position}ClipIds`]: [clip._id],
        });
      } else {
        sequenceId = newestSequence._id;
        const modifier = { $push: { [`${clip.position}ClipIds`]: clip._id } };
        if (clip.endedAt > newestSequence.endedAt) modifier.$set = { endedAt: clip.endedAt, duration: (clip.endedAt - newestSequence.startedAt) / 1000 };
        Sequences.update(newestSequence._id, modifier);
      }
      Clips.update(clip._id, { $set: { sequenceId } });
    });

    const sequence = Sequences.findOne();
    const uploadInProgressCount = sequence.backClipIds ? 4 : 3;

    videoId = Videos.id();
    const video = Videos.insert({
      _id: videoId,
      startedAt: sequence.startedAt,
      endedAt: sequence.endedAt,
      duration: sequence.duration,
      frontClip: Clips.findOne(sequence.frontClipIds[0]),
      leftClip: Clips.findOne(sequence.leftClipIds[0]),
      rightClip: Clips.findOne(sequence.leftClipIds[0]),
      backClip: sequence.backClipIds ? Clips.findOne(sequence.backClipIds[0]) : undefined,
      uploadInProgressCount,
    });

    uploadClip = (videoId, clipId) => {
      const video = Videos.findOne(videoId);
      const clip = Clips.findOne(clipId);
      const upload = Files.insert({ file: localFiles[clip.name], fileId: `${video[`${clip.position}Clip`]._id}`, streams: 'dynamic', chunkSize: 'dynamic' }, false);
      upload.on('start', function () { log('file upload start', clipId); });
      upload.on('end', (error, fileObj) => {
        Videos.update(videoId, { $inc: { uploadInProgressCount: -1 } });
        const video = Videos.findOne(videoId);
        log('file upload end', { clipId, video });
        if (video.uploadInProgressCount === 0) {
          log('file all upload end');
          Meteor.call('videoCreate', videoId);
        }
      });
      upload.start();
    };

    uploadClip(videoId, sequence.frontClipIds[0]);
    uploadClip(videoId, sequence.leftClipIds[0]);
    uploadClip(videoId, sequence.rightClipIds[0]);
    if (sequence.backClipIds) uploadClip(videoId, sequence.backClipIds[0]);

    Meteor.setTimeout(() => {
      videoSetOffset(0);
    }, 500);

    // var myPlayer = videojs('my-player');
    // myPlayer.src('https://file-examples.com/wp-content/uploads/2017/04/file_example_MP4_480_1_5MG.mp4');
    // myPlayer.src(URL.createObjectURL(localFiles[0]));
  },
  'click .js-minute-select'() {
    Session.set('selectedMinuteId', this._id);
  },
  'click .js-minute-select.active'(e) {
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
      _.each($('.js-video'), $video => $video.currentTime = e.offsetX);
      const play = Session.get('play');
      if (play) _.each($('.js-video'), $video => (play && $video.currentTime < $video.duration ? $video.play() : $video.pause()));
    }
  },
});

Template.viewer.helpers({
  sequences() { return Sequences.find({}, { sort: { createdAt: 1 } }); },
  // minute() { return Minutes.findOne(`${this}`); },
  // createdAtAndCurrent() { return moment(this.createdAt).add(Session.get('currentTime'), 'seconds'); },
  // minuteBackground() {
  //   const currentTime = Session.get('currentTime');
  //   const currentTimePercent = currentTime * 100 / 60;

  //   const currentTimeMousePosition = Session.get('currentTimeMousePosition');
  //   const currentTimeMousePositionPercent = currentTimeMousePosition * 100 / 60;
  //   if (currentTimeMousePositionPercent < currentTimePercent) {
  //     return `linear-gradient(to right, #BF616A 0%, #BF616A ${currentTimeMousePositionPercent}%, #8FBCBB ${currentTimeMousePositionPercent}%, #8FBCBB ${currentTimePercent}%, #E5E9F0 ${currentTimePercent}%, #E5E9F0 100%)`;
  //   } else {
  //     return `linear-gradient(to right, #BF616A 0%, #BF616A ${currentTimeMousePositionPercent}%, #E5E9F0 ${currentTimeMousePositionPercent}%, #E5E9F0 100%)`;
  //   }
  // },
});
