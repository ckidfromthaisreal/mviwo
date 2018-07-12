/** main application router. */
const router = require('express').Router();

/** location router. */
const locationRouter = require('./location/location.router');

/** metric router. */
const metricRouter = require('./metric/metric.router');

/** metric-group router. */
const metricGroupRouter = require('./metric-group/metric-group.router');

/** patient router. */
const patientRouter = require('./patient/patient.router');

/** record router. */
const recordRouter = require('./record/record.router');

/** session router. */
const sessionRouter = require('./session/session.router');

/** user router. */
const userRouter = require('./user/user.router');

/**
 * https://github.com/expressjs/cors
 * package for providing a Connect/Express middleware that can be used to enable CORS with various options.
 */
const cors = require('cors');

/* bind some response to the root. */
router.get('/', (req, res) => {
	res.send('welcome to mviwo api!');
});

/* bind '/location/' route to location router. */
router.use('/location', locationRouter);

/* bind '/metric/' route to metric router. */
router.use('/metric', metricRouter);

/* bind '/metric-group/' route to metric-group router. */
router.use('/metric-group', metricGroupRouter);

/* bind '/patient/' route to patient router. */
router.use('/patient', patientRouter);

/* bind '/record/' route to record router. */
router.use('/record', recordRouter);

/* bind '/session/' route to session router. */
router.use('/session', sessionRouter);

/* bind '/user/' route to user router. */
router.use('/user', cors(), userRouter);

/* export router */
module.exports = router;
