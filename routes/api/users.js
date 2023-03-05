const express = require('express');
const router = express.Router();
const authtController = require('../../controllers/users');
const authenticate = require('../../middlewares/authenticate');
const { ctrlWrapper } = require('../../helpers');

router.post('/signup', ctrlWrapper(authtController.register));
router.post('/login', ctrlWrapper(authtController.login));
router.get('/current', authenticate, ctrlWrapper(authtController.getCurrent));
router.get('/logout', authenticate, ctrlWrapper(authtController.logout));

module.exports = router;
