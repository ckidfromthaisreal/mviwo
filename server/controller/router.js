/** main application router. */
const router = require('express').Router();

/** metric router. */
const metricRouter = require('./metric/metric.router');

/** metric-group router. */
const metricGroupRouter = require('./metric-group/metric-group.router');

/** user router. */
const userRouter = require('./user/user.router');

/* bind some response to the root. */
router.get('/', (req, res) => {
	res.send('welcome to mviwo api!');
});

/* bind '/metric/' route to metric router. */
router.use('/metric', metricRouter);

/* bind '/metric-group/' route to metric-group router. */
router.use('/metric-group', metricGroupRouter);

/* bind '/user/' route to user router. */
router.use('/user', userRouter);

/* export router */
module.exports = router;
