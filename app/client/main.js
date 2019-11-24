Session.setDefault('page', 'welcome');
Session.set('play', false);

playbackRate = 1;

let canPlayCount = -1;

Meteor.subscribe('videos');

extractMetaData = async sequenceId => {
  log('extractMetaData', { sequenceId });
  const sequence = Sequences.findOne(sequenceId);
  if (!sequence) return;

  const clipIds = _.flatten(sequence.frontClipIds, sequence.leftClipIds, sequence.rightClipIds, sequence.backClipIds);

  const clips = Clips.find({ _id: { $in: clipIds } }, { sort: { startedAt: 1 } }).fetch();

  await Promise.all(_.map(clips, async clip => {
    if (!clip.fuzzy) return;
    const file = localFiles[clip.name];
    for (let pos = 0, i = 0; i < 10 && pos < file.size; i++) {
      let s = (new DataView(await file.slice(pos, pos + 4).arrayBuffer())).getUint32();
      const t = (await (await file.slice(pos + 4, pos + 8)).text());
      // console.log({ pos, t, s });
      if (t === 'moov') s = 8;
      if (t === 'mvhd') {
        let d;
        d = (new DataView(await file.slice(pos + (3 * 4) , pos + (3 * 4) + 4).arrayBuffer())).getUint32();
        clip.startedAt = moment(d * 1000 - 2082844800000).toDate();

        d = (new DataView(await file.slice(pos + (4 * 4) , pos + (4 * 4) + 4).arrayBuffer())).getUint32();
        clip.endedAt = moment(d * 1000 - 2082844800000).toDate();

        const timeScale = (new DataView(await file.slice(pos + (5 * 4) , pos + (5 * 4) + 4).arrayBuffer())).getUint32();
        clip.duration = (new DataView(await file.slice(pos + (6 * 4) , pos + (6 * 4) + 4).arrayBuffer())).getUint32() / timeScale;

        Clips.update(clip._id, { $set: { startedAt: clip.startedAt, endedAt: clip.endedAt, duration: clip.duration }, $unset: { fuzzy: true } });
        return;
      }
      pos += s;
    }
  }));

  Sequences.update(sequence._id, { $set: { startedAt: clips[0].startedAt, endedAt: clips[clips.length - 1].endedAt, duration: (clips[clips.length - 1].endedAt - clips[0].startedAt) / 1000 }, $unset: { fuzzy: true } });
};

prepareLocalFiles = async files => {
  _.each(files, file => {
    const date = moment(file.name, 'YYYY-MM-DD_HH-mm-ss');

    if (!date.isValid()) return;

    const splitted = file.name.split('-');
    if (splitted.length < 6) return;
    const position = splitted[5].replace('_repeater', '').replace('.mp4', ''); // front right left back

    if (!localFiles[file.name]) localFiles[file.name] = file;
  });

  log('files insert');

  await Promise.all(_.map(localFiles, async file => {
    if (Clips.findOne({ name: file.name })) return;

    const clip = { _id: Clips.id(), name: file.name };

    const splitted = file.name.split('-');
    if (splitted.length < 6) return;
    clip.position = splitted[5].replace('_repeater', '').replace('.mp4', ''); // front right left back

    clip.startedAt = moment(file.name, 'YYYY-MM-DD_HH-mm-ss').toDate();

    clip.endedAt = moment(clip.startedAt).add(60, 'seconds').toDate();

    clip.duration = 60;

    clip.fuzzy = true; // we don't have the exact timing extracted from the video

    Clips.insert(clip);
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
        fuzzy: true,
      });
    } else {
      sequenceId = newestSequence._id;
      const modifier = { $push: { [`${clip.position}ClipIds`]: clip._id } };
      if (clip.endedAt > newestSequence.endedAt) modifier.$set = { endedAt: clip.endedAt, duration: (clip.endedAt - newestSequence.startedAt) / 1000 };
      Sequences.update(newestSequence._id, modifier);
    }
    Clips.update(clip._id, { $set: { sequenceId } });
  });

  // const sequence = Sequences.findOne();
  // const uploadInProgressCount = sequence.backClipIds ? 4 : 3;

  // videoId = Videos.id();
  // const video = Videos.insert({
  //   _id: videoId,
  //   startedAt: sequence.startedAt,
  //   endedAt: sequence.endedAt,
  //   duration: sequence.duration,
  //   frontClip: Clips.findOne(sequence.frontClipIds[0]),
  //   leftClip: Clips.findOne(sequence.leftClipIds[0]),
  //   rightClip: Clips.findOne(sequence.leftClipIds[0]),
  //   backClip: sequence.backClipIds ? Clips.findOne(sequence.backClipIds[0]) : undefined,
  //   uploadInProgressCount,
  // });

  // uploadClip = (videoId, clipId) => {
  //   const video = Videos.findOne(videoId);
  //   const clip = Clips.findOne(clipId);
  //   const upload = Files.insert({ file: localFiles[clip.name], fileId: `${video[`${clip.position}Clip`]._id}`, streams: 'dynamic', chunkSize: 'dynamic' }, false);
  //   upload.on('start', function () { log('file upload start', clipId); });
  //   upload.on('end', (error, fileObj) => {
  //     Videos.update(videoId, { $inc: { uploadInProgressCount: -1 } });
  //     const video = Videos.findOne(videoId);
  //     log('file upload end', { clipId, video });
  //     if (video.uploadInProgressCount === 0) {
  //       log('file all upload end');
  //       Meteor.call('videoCreate', videoId);
  //     }
  //   });
  //   upload.start();
  // };

  // uploadClip(videoId, sequence.frontClipIds[0]);
  // uploadClip(videoId, sequence.leftClipIds[0]);
  // uploadClip(videoId, sequence.rightClipIds[0]);
  // if (sequence.backClipIds) uploadClip(videoId, sequence.backClipIds[0]);

  Meteor.setTimeout(() => {
    videoSetOffset(0);
  }, 500);

  // var myPlayer = videojs('my-player');
  // myPlayer.src('https://file-examples.com/wp-content/uploads/2017/04/file_example_MP4_480_1_5MG.mp4');
  // myPlayer.src(URL.createObjectURL(localFiles[0]));
};
