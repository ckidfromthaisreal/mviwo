/*
session router.
*/

/** sessions controller. */
const controller = require('./session.controller');

/** server auth config. */
const jwt = require('../../auth').jwt;

/** metrics router. */
const router = require('express').Router();

/** route permissions. */
const guard = require('express-jwt-permissions')({
	// requestProperty: 'user',
	// permissionsProperty: 'permissions'
});

/* bind get '/' to getAll function */
router.get('/', jwt, guard.check('session:getMany'), controller.getMany);

/* bind get with parameter to getOne function */
router.get('/:id', jwt, guard.check('session:getOne'), controller.getOne);

/* bind post '/' to insertMany function */
router.post('/', jwt, guard.check('session:insertMany'), controller.insertMany);

/* bind post '/1' to insertOne function */
router.post('/1', jwt, guard.check('session:insertOne'), controller.insertOne);

/* bind patch '/' to updateMany function */
router.patch('/', jwt, guard.check('session:updateMany'), controller.updateMany);

/* bind patch with parameter to updateOne function */
router.patch('/:id', jwt, guard.check('session:updateOne'), controller.updateOne);

/* bind delete '/' to deleteMany function */
router.delete('/', jwt, guard.check('session:deleteMany'), controller.deleteMany);

/* bind delete with parameter to deleteOne function */
router.delete('/:id', jwt, guard.check('session:deleteOne'), controller.deleteOne);

/* export router */
module.exports = router;
