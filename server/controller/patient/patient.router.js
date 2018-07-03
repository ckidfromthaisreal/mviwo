/*
patient router.
*/

/** patient controller. */
const controller = require('./patient.controller');

/** server auth config. */
const jwt = require('../../auth').jwt;

/** router. */
const router = require('express').Router();

/** route permissions. */
const guard = require('express-jwt-permissions')({
	// requestProperty: 'user',
	// permissionsProperty: 'permissions'
});

/* bind get '/' to getAll function */
router.get('/', jwt, guard.check('patient:getMany'), controller.getMany);

/* bind get with parameter to getOne function */
router.get('/:id', jwt, guard.check('patient:getOne'), controller.getOne);

/* bind post '/' to insertMany function */
router.post('/', jwt, guard.check('patient:insertMany'), controller.insertMany);

/* bind post '/1' to insertOne function */
router.post('/1', jwt, guard.check('patient:insertOne'), controller.insertOne);

/* bind patch '/' to updateMany function */
router.patch('/', jwt, guard.check('patient:updateMany'), controller.updateMany);

/* bind patch with parameter to updateOne function */
router.patch('/:id', jwt, guard.check('patient:updateOne'), controller.updateOne);

/* bind delete '/' to deleteMany function */
router.delete('/', jwt, guard.check('patient:deleteMany'), controller.deleteMany);

/* bind delete with parameter to deleteOne function */
router.delete('/:id', jwt, guard.check('patient:deleteOne'), controller.deleteOne);

/* export router */
module.exports = router;
