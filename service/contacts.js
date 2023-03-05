const Contact = require('./schemas/contacts');

const getAllContacts = async () => Contact.find();

const getContactById = async (contactId, owner) => Contact.findById(contactId, owner);

const createContact = async ({ name, email, phone, favorite, owner }) => {
  return Contact.create({ name, email, phone, favorite, owner });
};

const updateContact = async (contactId, fields) => {
  return Contact.findByIdAndUpdate(contactId, fields, {
    new: true,
    strict: 'throw',
    runValidators: true,
  });
};

const updateStatusContact = async (contactId, favorite) => {
  return Contact.findByIdAndUpdate(contactId, { favorite });
};

const deleteContact = async contactId => Contact.findByIdAndRemove(contactId);

module.exports = {
  getAllContacts,
  getContactById,
  createContact,
  updateContact,
  updateStatusContact,
  deleteContact,
};
