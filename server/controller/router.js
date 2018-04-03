/* main application router. */
const router = require('express').Router();

/* metric router. */
const metricRouter = require('./metric/metric.router');

router.get('/', (req, res) => {
    res.send('welcome to mviwo api!');
});

/* bind '/metric/' route to metric router. */
router.use('/metric', metricRouter);

/* export router */
module.exports = router;