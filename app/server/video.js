var fs = require('fs'),
    http = require('http'),
    url = require('url'),
    path = require('path');
    
Picker.route('/video/:videoId', (params, req, res) => {
  try {
    log('/video', { _ip: lp.ip(req).ip });

    let { videoId } = params;

    const video = Videos.findOne(videoId);
    if (!video) { res.statusCode = 404; res.end('Video not found!'); return; }

    var file = `/tmp/lemcam/videos/${video._id}.mp4`;
    fs.stat(file, function(err, stats) {
      if (err) {
        if (err.code === 'ENOENT') { res.statusCode = 404; res.end('File not found!'); return; }
        res.end(err);
        return;
      }
      var total = stats.size;
      var { range } = req.headers;
      if (!range) {
        res.writeHead(200, { 'Content-Type': 'video/mp4', 'Content-Length': total });
        fs.createReadStream(file).pipe(res);
        return;
      }
      var positions = range.replace(/bytes=/, '').split('-');
      var start = parseInt(positions[0], 10);
      var end = positions[1] ? parseInt(positions[1], 10) : total - 1;
      var chunkSize = (end - start) + 1;

      res.writeHead(206, {
        'Content-Range': 'bytes ' + start + '-' + end + '/' + total,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': 'video/mp4'
      });
      fs.createReadStream(path, { start, end }).pipe(res);
    });
  } catch (err) {
    error('video route failed', { err });
    res.end('');
  }
});
