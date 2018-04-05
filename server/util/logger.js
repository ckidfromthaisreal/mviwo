/*
custom-made logger module used throughout the server side for timestamped messaging/logging.
*/

/** server config file. */
const config = require('../server.json');

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
      return info.label ? `[${timestamp}]  [${info.level}]  [${info.label}]  ${info.message}`:
      `[${timestamp}]  [${info.level}]  ${info.message}`;
    })
  ),
  transports: [
    new winston.transports.File({ filename: 'server/logs/error.log', level: 'error'}),
    new winston.transports.File({ filename: 'server/logs/combined.log'})
  ],
  exceptionHandlers: [
    new winston.transports.File({ filename: 'server/logs/exception.log'})
  ],
  exitOnError: false
});

/* if in production mode, "mute" console logging. */
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console());
}

/**
 * log a message to console and files.
 * @param level (optional) log level: 'error', 'warn', 'info', 'verbose', 'debug', 'silly'.
 * @param label custom label. ex: 'database'.
 * @param fnName function name. ex: db.js:mongoose.connect
 * @param additional (optional) additional message.
 */
exports.log = (level, label, fnName, additional) => {
    logger.log({
      level: level ? level : 'info',
      label: label,
      message: additional ? `${fnName} : ${additional}` : `${fnName}`
    });
};

/**
 * log an error message to console and files.
 * @param label custom label. ex: 'database'.
 * @param fnName function name. ex: db.js:mongoose.connect
 * @param additional (optional) additional message.
 */
exports.error = (label, fnName, additional) => {
  logger.error({
    label: label,
    message: additional ? `${fnName} : ${additional}` : `${fnName}`
  });
};

/**
 * log a warn message to console and files.
 * @param label custom label. ex: 'database'.
 * @param fnName function name. ex: db.js:mongoose.connect
 * @param additional (optional) additional message.
 */
exports.warn = (label, fnName, additional) => {
  logger.warn({
    label: label,
    message: additional ? `${fnName} : ${additional}` : `${fnName}`
  });
};

/**
 * log an info message to console and files.
 * @param label custom label. ex: 'database'.
 * @param fnName function name. ex: db.js:mongoose.connect
 * @param additional (optional) additional message.
 */
exports.info = (label, fnName, additional) => {
  logger.info({
    label: label,
    message: additional ? `${fnName} : ${additional}` : `${fnName}`
  });
};

/**
 * log a verbose message to console and files.
 * @param label custom label. ex: 'database'.
 * @param fnName function name. ex: db.js:mongoose.connect
 * @param additional (optional) additional message.
 */
exports.verbose = (label, fnName, additional) => {
  logger.verbose({
    label: label,
    message: additional ? `${fnName} : ${additional}` : `${fnName}`
  });
};

/**
 * log a debug message to console and files.
 * @param label custom label. ex: 'database'.
 * @param fnName function name. ex: db.js:mongoose.connect
 * @param additional (optional) additional message.
 */
exports.debug = (label, fnName, additional) => {
  logger.debug({
    label: label,
    message: additional ? `${fnName} : ${additional}` : `${fnName}`
  });
};

/**
 * log a silly message to console and files.
 * @param label custom label. ex: 'database'.
 * @param fnName function name. ex: db.js:mongoose.connect
 * @param additional (optional) additional message.
 */
exports.silly = (label, fnName, additional) => {
  logger.silly({
    label: label,
    message: additional ? `${fnName} : ${additional}` : `${fnName}`
  });
};
