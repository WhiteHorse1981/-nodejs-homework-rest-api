const service = require('../service/contacts');
const { contactUpdateValidatar, updateFavoriteValidator } = require('../utils/validator');

const getAll = async (req, res) => {
  const { _id: owner } = req.user;

  const contacts = await service.getAllContacts(owner);

  res.status(200).json(contacts);
};

const getById = async (req, res) => {
  const { contactId } = req.params;

  const contact = await service.getContactById(contactId);
  console.log('contact: ', contact);
  if (contact) {
    res.status(200).json(contact);
  } else {
    res.status(404).json({ message: 'Not found' });
  }
};

const addContact = async (req, res, next) => {
  let { name, email, phone, favorite } = req.body;

  const { _id: owner } = req.user;

  if (!favorite) {
    favorite = false;
  }
  try {
    const result = await service.createContact({ name, email, phone, favorite, owner });
    res.status(201).json(result);
  } catch (e) {
    console.warn(e);
    next(e);
  }
};

const updateContact = async (req, res, next) => {
  try {
    const { error } = contactUpdateValidatar(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { contactId } = req.params;

    const { _id: owner } = req.user;

    const fields = req.body;

    const contact = await service.updateContact(contactId, owner, fields);

    if (contact) {
      res.status(200).json(contact);
    } else {
      res.status(404).json({ message: 'Not found' });
    }
  } catch (error) {
    console.error(error.message);
    next(error);
  }
};

const setFavorite = async (req, res, next) => {
  try {
    const { error } = updateFavoriteValidator(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { favorite } = req.body;
    const { contactId } = req.params;
    const { _id: owner } = req.user;

    const contact = await service.updateStatusContact({ contactId, owner }, favorite);

    if (contact) {
      res.status(200).json(contact);
    } else {
      res.status(404).json({ message: 'Not found' });
    }
  } catch (error) {
    console.error(error.message);
    next(error);
  }
};

const removeContact = async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const { _id: owner } = req.user;
    const contactToRemove = await service.deleteContact(contactId, owner);

    if (!contactToRemove) {
      return res.status(404).json({ message: 'Not found contact' });
    } else {
      res.status(200).json({ message: 'Contact deleted' });
    }
  } catch (error) {
    console.log(`Error: ${error.message}`);
    next(error);
  }
};

module.exports = {
  getAll,
  getById,
  addContact,
  updateContact,
  removeContact,
  setFavorite,
};
