/* custom-made logger module. use logger.log(...) */
const logger = require('../util/logger');

/* http://mongoosejs.com/
  mongoose provides a straight-forward, schema-based solution to model your application data.
  it includes built-in type casting, validation, query building, business logic hooks and more,
  out of the box.
*/
const mongoose = require('mongoose');

/* remote db username */
const username = 'Admin';

/* remote db password */
const password = '!A2s3d4f';

/* remote mongodb link */
const remoteDB = 'mongodb://' + username + ':' + password + '@' +
        'clusterladak-shard-00-00-05mix.mongodb.net:27017' + ',' +
        'clusterladak-shard-00-01-05mix.mongodb.net:27017' + ',' +
        'clusterladak-shard-00-02-05mix.mongodb.net:27017' + '/' +
        'LadakhEHealthDB?ssl=true' + '&' +
        'replicaSet=ClusterLadak-shard-0' + '&' +
        'authSource=admin';

/* local mongodb link used a fallback when remoteDB is inaccessible. */
const localDB = 'mongodb://localhost/LadakhEHealthDB';

/* 'pointer' to current db link. */
let currentDB = remoteDB;

/* */
mongoose.Promise = global.Promise;

/* connection to database */
const connection = mongoose.connection;

/* on connection failed: if failed on remote, try to connect to local. */
connection.on('error', () => {
    logger.log(false, 'db.js:mongoose.connect', currentDB);

    if (currentDB !== localDB) {
        currentDB = localDB;
        mongoose.connect(currentDB, {useMongoClient: true});
    }
});

/* on successful connection, log a message. */
connection.once('open', () => {
    logger.log(true, 'db.js:mongoose.connect', currentDB);
});

/* exported connect to db function. */
exports.connect = () => {
    // mongoose.connect(currentDB, {useMongoClient: true});
    mongoose.connect(currentDB);
};