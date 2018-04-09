/*
metric-group router.
*/

/** metric-groups router. */
const router = require('express').Router();

/** metric-groups controller. */
const controller = require('./metric-group.controller');

/* bind get '/' to getAll function */
router.get('/', controller.getMany);

/* bind get with parameter to getOne function */
// router.get('/:id', controller.getOne);

/* bind post '/' to insertMany function */
// router.post('/', controller.insertMany);

/* bind post '/1' to insertOne function */
// router.post('/1', controller.insertOne);

/* bind patch '/' to updateMany function */
// router.patch('/', controller.updateMany);

/* bind patch with parameter to updateOne function */
// router.patch('/:id', controller.updateOne);

/* bind delete '/' to deleteMany function */
// router.delete('/', controller.deleteMany);

/* bind delete with parameter to deleteOne function */
// router.delete('/:id', controller.deleteOne);

/* export router */
module.exports = router;
