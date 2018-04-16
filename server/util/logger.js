/*
custom-made logger module used throughout the server side for timestamped messaging/logging.
*/

/** server config file. */
// const config = require('../server.json');

/** https://github.com/winstonjs/winston
 * winston is designed to be a simple and universal logging library with support for multiple
 * transports. winston aims to decouple parts of the logging process to make it more flexible
 * and extensible.
 */
const winston = require('winston');

/** custom logger. */
const logger = winston.createLogger({
	level: 'info',
	format: winston.format.combine(
		winston.format.colorize(),
		winston.format.printf(info => {
			const date = new Date();
			const timestamp = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
			const lev = info.level.substring(5, info.level.length - 4);
			info.level = info.level.replace(lev, lev.toUpperCase());
			return info.label ? `[${timestamp}]  [${info.level}]  [${info.label}]  ${info.message}` :
				`[${timestamp}]  [${info.level}]  ${info.message}`;
		})
	),
	transports: [
		new winston.transports.File({
			filename: 'server/logs/error.log',
			level: 'error'
		}),
		new winston.transports.File({
			filename: 'server/logs/combined.log'
		})
	],
	exceptionHandlers: [
		new winston.transports.File({
			filename: 'server/logs/exception.log'
		})
	],
	exitOnError: false
});

/* if in production mode, "mute" console logging. */
if (process.env.NODE_ENV !== 'production') {
	logger.add(new winston.transports.Console({
		level: 'info'
	}));
}

/**
 * log a message to console and files.
 * @param level (optional) log level: 'error', 'warn', 'info', 'verbose', 'debug', 'silly'.
 * @param label custom label. ex: 'database'.
 * @param fnName function name. ex: db.js:mongoose.connect
 * @param additional (optional) additional message.
 */
exports.log = (level, label, fnName, message, user) => {
	if (user && typeof user === 'object') {
		user = JSON.stringify(user);
	}

	logger.log({
		level: level ? level : 'info',
		label: label,
		message: message ? user ? `${fnName} : ${message} for user: ${user}` : `${fnName} : ${message}` : `${fnName}`
	});
};

/**
 * log an error message to console and files.
 * @param label custom label. ex: 'database'.
 * @param fnName function name. ex: db.js:mongoose.connect
 * @param additional (optional) additional message.
 */
exports.error = (label, fnName, message, user) => {
	this.log('error', label, fnName, message, user);
};

/**
 * log a warn message to console and files.
 * @param label custom label. ex: 'database'.
 * @param fnName function name. ex: db.js:mongoose.connect
 * @param additional (optional) additional message.
 */
exports.warn = (label, fnName, message, user) => {
	this.log('warn', label, fnName, message, user);
};

/**
 * log an info message to console and files.
 * @param label custom label. ex: 'database'.
 * @param fnName function name. ex: db.js:mongoose.connect
 * @param additional (optional) additional message.
 */
exports.info = (label, fnName, message, user) => {
	this.log('info', label, fnName, message, user);
};

/**
 * log a verbose message to console and files.
 * @param label custom label. ex: 'database'.
 * @param fnName function name. ex: db.js:mongoose.connect
 * @param additional (optional) additional message.
 */
exports.verbose = (label, fnName, message, user) => {
	this.log('verbose', label, fnName, message, user);
};

/**
 * log a debug message to console and files.
 * @param label custom label. ex: 'database'.
 * @param fnName function name. ex: db.js:mongoose.connect
 * @param additional (optional) additional message.
 */
exports.debug = (label, fnName, message, user) => {
	this.log('debug', label, fnName, message, user);
};

/**
 * log a silly message to console and files.
 * @param label custom label. ex: 'database'.
 * @param fnName function name. ex: db.js:mongoose.connect
 * @param additional (optional) additional message.
 */
exports.silly = (label, fnName, message, user) => {
	this.log('silly', label, fnName, message, user);
};
