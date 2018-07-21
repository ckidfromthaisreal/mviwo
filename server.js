/*
 * application's server side starting point (main).
 */

/** loads environment variables from local .env file. */
// require('dotenv').load();

/** server config file. */
const config = require('./server/server.json');

/** https://expressjs.com/
  express is a minimal and flexible Node.js web application framework that provides a
  robust set of features for web and mobile applications.
*/
const express = require('express');

/** https://nodejs.org/api/path.html
  the path module provides utilities for working with file and directory paths.
*/
const path = require('path');

/** https://nodejs.org/api/http.html
  the http interfaces in Node.js are designed to support many features of the protocol
  which have been traditionally difficult to use.
*/
const http = require('http');

/** https://www.npmjs.com/package/body-parser
  Node.js body parsing middleware. parse incoming request bodies in a middleware before
  your handlers, available under the req.body property.
*/
const bodyParser = require('body-parser');

/** https://github.com/expressjs/compression
 * node.js compression middleware. the following compression codings are supported:
 * deflate, gzip.
 */
const compression = require('compression');

/** custom-made logger module. */
const logger = require('./server/util/logger');

/** custom-made database connection module. */
const db = require('./server/model/db');

/** custom-made router module. */
const router = require('./server/controller/router');

/** express.js application. */
const app = express();

/** port number for application, retrieved from environment. defaults to 8080. */
const port = process.env.PORT || config.DEFAULT_APPLICATION_PORT;

/** custom-made error handler. */
const errorHandler = require('./server/util/error-handler');

/** https://github.com/expressjs/cors
 * a node.js package for providing a Connect/Express middleware that can
 * be used to enable CORS with various options. */
const cors = require('cors');

/* tells the application to use JSON. */
app.use(bodyParser.json());

/* tells the application to use simple algorithm for shallow parsing.
  set to 'extended: true' to enable complex algorithm for deep parsing
  that can deal with nested objects. */
app.use(bodyParser.urlencoded({
	extended: config.DEEP_PARSING
}));

/* point static path to build folder. */
app.use(express.static(/*path.join(__dirname, */'public'/*)*/));

/* compress all responses. */
app.use(compression());

/* setup api's routes in application. */
app.use('/api', router);

/* return index file when other routes are requested. */
app.get('*', (req, res) => {
	res.sendFile(path.join(__dirname, 'public/index.html'));
});

/* set application's port. */
app.set('port', port);

/* set application's environment. */
app.set('env', process.env.NODE_ENV || config.ENVIRONMENT);

/* set view engine for errors. */
if (config.USE_VIEW_ENGINE) {
	app.set('view engine', path.join(__dirname, 'views'));
	app.set('view engine', 'pug');
}

/* add errorHandler to application middleware functions. */
if (config.CUSTOM_ERROR_HANDLER) {
	app.use(errorHandler);
}

app.options('*', cors());

/** http server. */
const server = http.createServer(app);

/* listen on provided port, on all network interfaces.
    connect to database. */
server.listen(port, () => {
	logger.info('HTTP-SERVER', 'server.js:server.listen', `server listening on localhost:${port}`);
	db.connect();
});
