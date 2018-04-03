/*
custom-made logger module used throughout the server side for timestamped messaging/logging.
*/

/**
 * log an operation conclusion message to console. message will contain a timestamp.
 * @param {*} succeeded true if successful, false otherwise.
 * @param {*} fnName operation that was attempted.
 * @param {*} additional additional information to be logged.
 */
exports.log = (succeeded, fnName, additional) => {
    const datetime = new Date();
    console.log(
        '['
        , datetime.toLocaleDateString()
        , datetime.toLocaleTimeString()
        , '] '
        , (succeeded? 'OK ' : 'FAIL ')
        , fnName
        , (additional? ': ' + additional : '')
        , '.'
    );
};