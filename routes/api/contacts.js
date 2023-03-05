const express = require('express');
const router = express.Router();
const contactController = require('../../controllers/contacts');
const authenticate = require('../../middlewares/authenticate');

router.get('/', contactController.getAll);
router.get('/:contactId', authenticate, contactController.getById);
router.post('/', contactController.addContact);
router.put('/:contactId', authenticate, contactController.updateContact);
router.patch('/:contactId/favorite', authenticate, contactController.setFavorite);
router.delete('/:contactId', authenticate, contactController.removeContact);

module.exports = router;
