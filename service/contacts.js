const Contact = require('./schemas/contacts');

const getAllContacts = async owner => Contact.find({ owner });

const getContactById = async contactId => Contact.findById(contactId);

const createContact = async data => {
  return Contact.create(data);
};

const updateContact = async (contactId, owner, fields) => {
  return Contact.findOneAndUpdate({ _id: contactId, owner }, fields, {
    new: true,
    strict: 'throw',
    runValidators: true,
  });
};

const updateStatusContact = async ({ contactId, owner }, favorite) => {
  return Contact.findOneAndUpdate({ _id: contactId, owner }, { favorite });
};

const deleteContact = async (contactId, owner) =>
  Contact.findOneAndDelete({ _id: contactId }, owner);

module.exports = {
  getAllContacts,
  getContactById,
  createContact,
  updateContact,
  updateStatusContact,
  deleteContact,
};
