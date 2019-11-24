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
    log('videoCreate', videoId);
    const video = Videos.findOne(videoId);
    if (!video) return;

    const frontFile = Files.findOne(video.frontFileId);
    const leftFile = Files.findOne(video.leftFileId);
    const rightFile = Files.findOne(video.rightFileId);

    execute(`ffmpeg -loglevel error -i ${leftFile.path} -i ${frontFile.path} -i ${rightFile.path} -filter_complex "color=duration=40.82:s=1920x960:c=black, fps=24 [base];[0:v] setpts=PTS-STARTPTS, scale=640x480, hflip [left];[1:v] setpts=PTS-STARTPTS, scale=640x480 [front];[2:v] setpts=PTS-STARTPTS, scale=640x480, hflip [right];color=duration=40.82:s=640x480:c=black, fps=24 [rear]; [base][left] overlay=eof_action=pass:repeatlast=0:x=0:y=480 [left1]; [left1][front] overlay=eof_action=pass:repeatlast=0:x=640:y=0 [front1]; [front1][right] overlay=eof_action=pass:repeatlast=0:x=1280:y=480 [right1]; [right1][rear] overlay=eof_action=pass:repeatlast=0:x=640:y=480 [rear1]; [rear1] drawtext=fontfile=/Library/Fonts/Arial Unicode.ttf:fontcolor=white:fontsize=24:borderw=2:bordercolor=black@1.0:x=(w/2-text_w/2):y=(h-(text_h*2)):text='%{pts\\:localtime\\:1573059304\\:%x %X}' [tmp0]" -map [tmp0] -preset ultrafast -crf 33 -allow_sw 1 -b:v 15000 -c:v h264_videotoolbox -metadata description="Created by lemcam" -y /tmp/lemcam/videos/${video._id}.mp4`);
  },
});

// Meteor.startup(() => {
//   Meteor.call('videoCreate', 'vid_vKXXzS7LghZwatucj');
// });
