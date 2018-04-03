exports.log = (succeeded, fnName, additional) => {
    const datetime = new Date();
    console.log(
        '['
        , datetime.toLocaleDateString()
        , datetime.toLocaleTimeString()
        , '] '
        , (succeeded? 'OK ' : 'FAIL ')
        , fnName + (additional? ': ' + additional : '') + '.'
    );
};