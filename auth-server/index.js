var express = require('express'),
	passport = require("passport"),
	site = require('./site'),
	oauth2 = require('./oauth2'),
	user = require('./user'),
	session = require("express-session");

var sessionStoreAddr = process.env.SESSIONSTORE_PORT_6379_TCP_ADDR || "127.0.0.1",
    sessionStorePort = process.env.SESSIONSTORE_PORT_6379_TCP_POR || "6379";

var app = express();

app.set("views", "./views");
app.set('view engine', 'ejs');
app.use(require("cookie-parser")());
app.use(require("body-parser")());

var RedisStore = require('connect-redis')(session);
app.use(session({ 
  store: new RedisStore({
    prefix: "auth-sess:",
    host: sessionStoreAddr,
    port: sessionStorePort
  }),
  saveUnititialized: false,
  secret: 'keyboard cat' }));

app.use(passport.initialize());
app.use(passport.session());

require('./auth');

app.get('/', site.index);
app.get('/login', site.loginForm);
app.post('/login', site.login);
app.get('/logout', site.logout);
app.get('/account', site.account);

app.get('/dialog/authorize', oauth2.authorization);
app.post('/dialog/authorize/decision', oauth2.decision);
app.post('/oauth/token', oauth2.token);

app.get('/api/userinfo', user.info);

var port = process.env.PORT || 4000;
console.log("start on port " + port);
app.listen(port);
