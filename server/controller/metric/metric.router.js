/*
metric router.
*/

/** metrics router. */
const router = require('express').Router();

/** metrics controller. */
const controller = require('./metric.controller');

/* bind get '/' to getAll function */
router.get('/', controller.getAll);

/* bind get with parameter to getOne function */
router.get('/:id', controller.getOne);

/* bind post '/' to insert function */
router.post('/', controller.insert);

/* bind patch with parameter to updateOne function */
router.patch('/:id', controller.updateOne);

/* bind delete with parameter to deleteOne function */
router.delete('/:id', controller.deleteOne);

/* export router */
module.exports = router;