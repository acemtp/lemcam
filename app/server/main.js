import fs from 'fs';

const mkdirSync = dirPath => {
  try {
    fs.mkdirSync(dirPath, 0o777);
    fs.chmodSync(dirPath, 0o777);
  } catch (err) {
    if (err.code !== 'EEXIST') error('cannot create directory', { err, dirPath });
  }
};

log('create: /tmp/lemcam', { uid: process.getuid() });
mkdirSync('/tmp/lemcam');
mkdirSync('/tmp/lemcam/files');
mkdirSync('/tmp/lemcam/videos');

Meteor.publish('videos', function () {
  return Videos.find();
});
