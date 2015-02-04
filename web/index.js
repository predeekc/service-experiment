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

// var githubStrategy = new OAuth2Strategy({
//     authorizationURL: 'https://github.com/login/oauth/authorize',
//     tokenURL: 'https://github.com/login/oauth/access_token',
//     clientID: "e214c3e87c3e071f1253",
//     clientSecret: "9ff7111d73cb7ca5f0eb0ae7e1134de4ff17f99f",
//     callbackURL: "http://localhost:3000/auth/github/callback"
//   },
//   function(accessToken, refreshToken, profile, done) {    
//     return done(null, { token: accessToken });    
//   }
// );
var githubStrategy = new OAuth2Strategy({
    authorizationURL: 'https://auth.sample.local/dialog/authorize',
    tokenURL: 'http://auth.sample.local:4000/oauth/token',
    clientID: "abc123",
    clientSecret: "ssh-secret",
    callbackURL: "https://www.sample.local/auth/github/callback"
  },
  function(accessToken, refreshToken, profile, done) {    
  	console.log(accessToken);
    return done(null, { token: accessToken });    
  }
);
githubStrategy.name = "github";
passport.use(githubStrategy);

app.get("/", function (req, res) {
	res.send("<html><body><a href='/auth/github'>Github Login</a></body></html>")
})

app.get('/secret', function (req, res) {
  // Will require a valid access_token
  if (req.isAuthenticated()) {
  	res.send('Secret area: ' + req.user.token);	
  } else {
  	res.send('No access');	
  }
  
});

app.get('/public', function (req, res) {
  // Does not require an access_token
  res.send('Public area');
});

app.get('/auth/github',
  passport.authenticate('github'));

app.get('/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });

app.listen(3000);
