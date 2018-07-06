/*
user router.
*/

/** user router. */
const router = require('express').Router();

/** user controller. */
const controller = require('./user.controller');

/** server auth config. */
const jwt = require('../../auth').jwt;

/** route permissions. */
const guard = require('express-jwt-permissions')({
	// requestProperty: 'user',
	// permissionsProperty: 'permissions'
});

/* bind get '/' to getAll function */
router.get('/', jwt, guard.check('user:getMany'), controller.getMany);

/* bind get with parameter to getOne function */
router.get('/:id', jwt, guard.check('user:getOne'), controller.getOne);

/* bind post '/register' to register function */
router.post('/register', controller.register);

/* bind post '/login' to login function */
router.post('/login', controller.login);

/* bind patch '/' to updateMany function */
router.patch('/', jwt, guard.check('user:updateMany'), controller.updateMany);

/* bind patch with parameter to updateOne function */
router.patch('/:id', jwt, guard.check('user:updateOne'), controller.updateOne);

/* bind delete to deleteMany function */
router.delete('/', jwt, guard.check('user:deleteMany'), controller.deleteMany);

/* bind delete with parameter to deleteOne function */
router.delete('/:id', jwt, guard.check('user:deleteOne'), controller.deleteOne);

/* export router */
module.exports = router;
