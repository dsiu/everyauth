var express = require('express')
  , everyauth = require('../index')
  , conf = require('./conf');

everyauth.debug = true;

var usersByFbId = {};
var usersByTwitId = {};
var usersByGhId = {};
var usersByInstagramId = {};
var usersByFoursquareId = {};
var usersByLinkedinId = {};
var usersByLogin = {
  'brian': {
      login: 'brian'
    , password: 'password'
  }
};

everyauth
  .facebook
    .myHostname('http://local.host:3000')
    .appId(conf.fb.appId)
    .appSecret(conf.fb.appSecret)
    .findOrCreateUser( function (session, accessToken, accessTokenExtra, fbUserMetadata) {
      return usersByFbId[fbUserMetadata.id] ||
        (usersByFbId[fbUserMetadata.id] = fbUserMetadata);
    })
    .redirectPath('/');

everyauth
  .twitter
    .myHostname('http://local.host:3000')
    .consumerKey(conf.twit.consumerKey)
    .consumerSecret(conf.twit.consumerSecret)
    .findOrCreateUser( function (sess, accessToken, accessSecret, twitUser) {
      return usersByTwitId[twitUser.id] || (usersByTwitId[twitUser.id] = twitUser);
    })
    .redirectPath('/');

everyauth
  .password
    .loginWith('email')
    .getLoginPath('/login')
    .postLoginPath('/login')
    .loginView('login.jade')
    .authenticate( function (login, password) {
      var errors = [];
      if (!login) errors.push('Missing login');
      if (!password) errors.push('Missing password');
      if (errors.length) return errors;
      var user = usersByLogin[login];
      if (!user) return ['Login failed'];
      if (user.password !== password) return ['Login failed'];
      return user;
    })

    .getRegisterPath('/register')
    .postRegisterPath('/register')
    .registerView('register.jade')
    .validateRegistration( function (newUserAttrs, errors) {
      var login = newUserAttrs.login;
      if (usersByLogin[login]) errors.push('Login already taken');
      return errors;
    })
    .registerUser( function (newUserAttrs) {
      var login = newUserAttrs[this.loginKey()];
      return usersByLogin[login] = newUserAttrs;
    })

    .loginSuccessRedirect('/')
    .registerSuccessRedirect('/');

everyauth.github
  .myHostname('http://local.host:3000')
  .appId(conf.github.appId)
  .appSecret(conf.github.appSecret)
  .findOrCreateUser( function (sess, accessToken, accessTokenExtra, ghUser) {
      return usersByGhId[ghUser.id] || (usersByGhId[ghUser.id] = ghUser);
  })
  .redirectPath('/');

everyauth.instagram
  .myHostname('http://local.host:3000')
  .appId(conf.instagram.clientId)
  .appSecret(conf.instagram.clientSecret)
  .findOrCreateUser( function (sess, accessToken, accessTokenExtra, hipster) {
      return usersByInstagramId[hipster.id] || (usersByInstagramId[hipster.id] = hipster);
  })
  .redirectPath('/');

everyauth.foursquare
  .myHostname('http://local.host:3000')
  .appId(conf.foursquare.clientId)
  .appSecret(conf.foursquare.clientSecret)
  .findOrCreateUser( function (sess, accessTok, accessTokExtra, addict) {
      return usersByFoursquareId[addict.id] || (usersByFoursquareId[addict.id] = addict);
  })
  .redirectPath('/');

everyauth.linkedin
  .myHostname('http://local.host:3000')
  .consumerKey(conf.linkedin.apiKey)
  .consumerSecret(conf.linkedin.apiSecret)
  .findOrCreateUser( function (sess, accessToken, accessSecret, linkedinUser) {
    return usersByLinkedinId[linkedinUser.id] || (usersByLinkedinId[linkedinUser.id] = linkedinUser);
  })
  .redirectPath('/');


var app = express.createServer(
    express.bodyParser()
  , express.static(__dirname + "/public")
  , express.cookieParser()
  , express.session({ secret: 'htuayreve'})
  , everyauth.middleware()
);

app.configure( function () {
  app.set('view engine', 'jade');
});

app.get('/', function (req, res) {
  res.render('home');
});

everyauth.helpExpress(app);

app.listen(3000);
