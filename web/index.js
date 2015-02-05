var express = require('express'),
	passport = require("passport"),
	session = require("express-session"),
	OAuth2Strategy = require("passport-oauth2");

var app = express();

app.use(session({ secret: 'keyboard cat' }));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

var githubStrategy = new OAuth2Strategy({
    authorizationURL: 'https://auth.sample.local/dialog/authorize',
    tokenURL: 'http://auth.sample.local/oauth/token',
    clientID: "abc123",
    clientSecret: "ssh-secret",
    callbackURL: "https://www.sample.local/auth/login/callback"
  },
  function(accessToken, refreshToken, profile, done) {    
  	console.log(accessToken);
    return done(null, { token: accessToken });    
  }
);

passport.use(githubStrategy);

app.get("/", function (req, res) {
  if (req.isAuthenticated()) {
    res.send("<html><body><a href='/secret'>Secret Page</a></body></html>");
  } else {
    res.send("<html><body><a href='/auth/login'>Login</a></body></html>");
  }
})

app.get('/secret', function (req, res) {
  // Will require a valid access_token
  if (req.isAuthenticated()) {
  	res.send('Secret area: ' + req.user.token);	
  } else {
  	res.send('No access');	
  }
  
});

app.get('/auth/login',
  passport.authenticate('oauth2'));

app.get('/auth/login/callback',
  passport.authenticate('oauth2', { failureRedirect: '/auth/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });

app.listen(80);
