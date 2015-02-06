var express = require('express'),
	passport = require("passport"),
	session = require("express-session"),
  request = require("request"),
	OAuth2Strategy = require("passport-oauth2");

var app = express();

var port = process.env.PORT || 3000,
    authorizationURL = process.env.AUTH_URL || "http://localhost:4000/dialog/authorize",
    tokenURL = process.env.TOKEN_URL || "http://localhost:4000/oauth/token",
    callbackURL = process.env.CALLBACK_URL || "http://localhost:3000/auth/login/callback",
    profileURL = process.env.PROFILE_URL || "http://localhost:4000/api/userinfo",
    sessionStoreAddr = process.env.SESSIONSTORE_PORT_6379_TCP_ADDR || "127.0.0.1",
    sessionStorePort = process.env.SESSIONSTORE_PORT_6379_TCP_POR || "6379";

var RedisStore = require('connect-redis')(session);
app.use(session({ 
  store: new RedisStore({
    prefix: "web-sess:",
    host: sessionStoreAddr,
    port: sessionStorePort
  }),
  saveUnititialized: false,
  secret: 'keyboard cat' }));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

var githubStrategy = new OAuth2Strategy({
    authorizationURL: authorizationURL,
    tokenURL: tokenURL,
    clientID: "abc123",
    clientSecret: "ssh-secret",
    callbackURL: callbackURL
  },
  function(accessToken, refreshToken, profile, done) {    
    request.get(profileURL, {
      'auth': {
        'bearer': accessToken
      }
    }, function (err, response, body) {
      console.log(body);
      body = JSON.parse(body);
      console.log(body.name);
      return done(null, { id: body.user_id, name: body.name });    
    });
  }
);

passport.use(githubStrategy);

app.get("/", function (req, res) {
  console.log("GET - /");
  if (req.isAuthenticated()) {
    res.send("<html><body><a href='/secret'>Secret Page</a><a href='/auth/logout'>Logout</a></body></html>");
  } else {
    res.send("<html><body><a href='/auth/login'>Login</a></body></html>");
  }
})

app.get('/secret', function (req, res) {
  // Will require a valid access_token
  if (req.isAuthenticated()) {
  	res.send('Secret area: ' + req.user.name);	
  } else {
  	res.send('No access');	
  }
  
});

app.get('/auth/logout', function(req, res){
  req.logout();
  req.session.destroy();
  res.redirect('/');
});

app.get('/auth/login',
  passport.authenticate('oauth2'));

app.get('/auth/login/callback',
  passport.authenticate('oauth2', { failureRedirect: '/auth/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });


console.log("start on port " + port);
app.listen(port);
