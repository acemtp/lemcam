const googleapis = require('googleapis');
const { google } = googleapis;
const { OAuth2 } = google.auth;

var TOKEN_PATH = '/tmp/lemcam/youtube-token.json';

function authorize() {
  const credentials = JSON.parse(Assets.getText('client_secret.json'));
  var clientSecret = credentials.installed.client_secret;
  var clientId = credentials.installed.client_id;
  var redirectUrl = credentials.installed.redirect_uris[0];
  var oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);

  // Check if we have previously stored a token.
  token = fs.readFileSync(TOKEN_PATH);
  oauth2Client.credentials = JSON.parse(token);
  return oauth2Client;
}

getNewToken = () => {
  const credentials = JSON.parse(Assets.getText('client_secret.json'));
  var clientSecret = credentials.installed.client_secret;
  var clientId = credentials.installed.client_id;
  var redirectUrl = credentials.installed.redirect_uris[0];
  var oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);

  var authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/youtube',
      'https://www.googleapis.com/auth/youtube.upload',
      'https://www.googleapis.com/auth/youtube.force-ssl',
      'https://www.googleapis.com/auth/youtube.readonly',
      'https://www.googleapis.com/auth/youtubepartner',
      'https://www.googleapis.com/auth/youtubepartner-channel-audit',
    ]
  });
  return authUrl;
}

saveNewToken = code => {
  const credentials = JSON.parse(Assets.getText('client_secret.json'));
  var clientSecret = credentials.installed.client_secret;
  var clientId = credentials.installed.client_id;
  var redirectUrl = credentials.installed.redirect_uris[0];
  var oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);

  oauth2Client.getToken(code, function(err, token) {
    if (err) {
      console.log('Error while trying to retrieve access token', err);
      return;
    }
    fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
      if (err) throw err;
      console.log('Token stored to ' + TOKEN_PATH);
    });
  });
};

youtubeUpload = videoId => {
  const video = Videos.findOne(videoId);
  if (!video) return;

  var youtube = google.youtube('v3');
  const res = Promise.await(youtube.videos.insert({
    auth: authorize(),
    part: 'snippet,status',
    resource: {
      snippet: { title: 'lemcam', description: 'Created by lemcam'},
      status: { privacyStatus: 'unlisted' },
    },
    media: {
      body: fs.createReadStream(`/tmp/lemcam/videos/${video._id}.mp4`),
    }
  }));
  log(res);

  if (res.status === 200) {
    Videos.update(video._id, { $set: {
      youtubeId: res.data.id,
      youtubeUrl: `https://www.youtube.com/watch?v=${res.data.id}`,
    } });
  } else {
    Videos.update(video._id, { $set: { youtubeRes: res } });
  }
};

// Meteor.startup(() => {
//   youtubeUpload('vid_vKXXzS7LghZwatucj');
// });
