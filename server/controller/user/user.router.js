/*
user router.
*/

/** user router. */
const router = require('express').Router();

/** user controller. */
const controller = require('./user.controller');

/* bind get '/' to getAll function */
// router.get('/', controller.getMany);

/* bind get with parameter to getOne function */
// router.get('/:id', controller.getOne);

/* bind post '/' to insertMany function */
// router.post('/', controller.insertMany);

/* bind post '/register' to register function */
router.post('/register', controller.register);

/* bind post '/login' to login function */
router.post('/login', controller.login);

/* bind post '/logout' to logout function */
// router.post('/logout', controller.logout);

/* bind patch '/' to updateMany function */
// router.patch('/', controller.updateMany);

/* bind patch with parameter to updateOne function */
// router.patch('/:id', controller.updateOne);

/* bind delete with parameter to deleteOne function */
router.delete('/', controller.delete);

/* export router */
module.exports = router;
