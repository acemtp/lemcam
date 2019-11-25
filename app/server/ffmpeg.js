import { FFMpegProgress } from 'ffmpeg-progress-wrapper';

const execute = command => {
  const exec = Npm.require('child_process').execFileSync;

  try {
    log('execute: started', { command });
    const res = exec('/bin/bash', ['-c', command]);
    log('execute: ended', { command, res });
    return { ok: true, message: 'localtunnel server restarted' };
  } catch (err) {
    return { ok: false, message: 'Failed to restart localtunnel server' };
  }
};

Meteor.methods({
  videoCreate(videoId) {
    this.unblock();
    log('videoCreate', videoId);
    const video = Videos.findOne(videoId);
    if (!video) return;

    let sources = '';
    let sources2 = [];
    let filters = '';
    let overlays = '';

    const clipPositions = {
      front: 'x=640:y=0',
      left: 'x=0:y=480',
      right: 'x=1280:y=480',
      back: 'x=640:y=480',
    };

    _.each(video.clips, (clip, i) => {
      sources += `-i ${Files.findOne(clip._id).path} `;
      sources2.push(`-i`);
      sources2.push(`${Files.findOne(clip._id).path}`);

      const delta = (clip.startedAt - video.startedAt) / 1000;

l({delta})

      filters += `[${i}:v] ${delta < 0 ? `trim=${-delta},` : ''}setpts=PTS-STARTPTS${delta > 0 ? `+${delta}/TB` : ''}, scale=640x480${_.contains(['left', 'right'], clip.position) ? ', hflip' : ''} [v${i}];`;
      overlays += `[v${i}] overlay=eof_action=pass:repeatlast=0:${clipPositions[clip.position]} [o${i}]; [o${i}]`;
    });

    l({sources});
    l({filters});
    l({overlays});

    // const command = `ffmpeg -loglevel error ${sources} -filter_complex "color=duration=${video.duration}:s=1920x960:c=black, fps=35 [base];${filters}[base]${overlays} drawtext=fontcolor=white:fontsize=24:borderw=2:bordercolor=black@1.0:x=(w/2-text_w/2):y=(h-(text_h*2)):text='%{pts\\:localtime\\:${+new Date(video.startedAt)}\\:%x %X} - created with lemcam.com' [tmp0]" -map [tmp0] -preset veryslow -tune film -crf 18 -allow_sw 1 -b:v 5000K -c:v h264_videotoolbox -metadata description="created with lemcam.com" -y /tmp/lemcam/videos/${video._id}.mp4`;

    // console.log(command);
    // execute(command);

    (async () => {
      const process = new FFMpegProgress([...sources2, `-filter_complex`, `color=duration=${video.duration}:s=1920x960:c=black, fps=35 [base];${filters}[base]${overlays} drawtext=fontcolor=white:fontsize=24:borderw=2:bordercolor=black@1.0:x=(w/2-text_w/2):y=(h-(text_h*2)):text='%{pts\\:localtime\\:${+new Date(video.startedAt)}\\:%x %X} - created with lemcam.com' [tmp0]`, `-map`, `[tmp0]`, `-preset`, `veryslow`, `-tune`, `film`, `-crf`, `18`, `-allow_sw`, `1`, `-b:v`, `5000K`, `-c:v`, `h264_videotoolbox`, `-metadata`, `description="created with lemcam.com"`, `-y`, `/tmp/lemcam/videos/${video._id}.mp4`]);
      // process.on('raw', console.log);
      // process.once('details', (details) => console.log('details', JSON.stringify(details)));
      process.on('progress', Meteor.bindEnvironment(progress => {
        const percent = (progress.time / 10 / video.duration) | 0;
        console.log('progress', percent, JSON.stringify(progress));
        Videos.update(video._id, { $set: { status: `video encoding ${percent}%` } });
      }));
      // process.once('end', console.log.bind(console, 'Conversion finished and exited with code'));
      // process.done(console.log);
      try {
        await process.onDone();
        Videos.update(video._id, { $set: { url: `${Meteor.absoluteUrl()}${video._id}.mp4`, status: `video available` } });
        log('done');
      } catch (err) {
        error('error', { err });
      }
    })();
  },
});

Meteor.startup(() => {
  // Meteor.call('videoCreate', 'vid_KW6xo9nuEKJjYEmZC');
  // Meteor.call('videoCreate', 'vid_cysiTnPQQwie3HbPk');
});
