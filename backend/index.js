// routes
require('./routes/auth.routes')(app);
require('./routes/user.routes')(app);
require('./routes/tournament.routes')(app);
require('./routes/team.routes')(app);
require('./routes/player.routes')(app);
require('./routes/match.routes')(app);
require('./routes/matchEvent.routes')(app);
require('./routes/notification.routes')(app); 