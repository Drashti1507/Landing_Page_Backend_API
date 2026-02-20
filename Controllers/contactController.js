const Contact = require("../Models/contactModel");
const jwt = require("jsonwebtoken");

// Create contact (Public / Optional User)
exports.createContact = async (req, res) => {
  try {
    const contactData = { ...req.body };
    
    // Check if a token is provided to link to a user
    const token = req.headers.authorization?.split(" ")[1];
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        contactData.user = decoded.id;
      } catch (err) {
        // Continue as guest if token is invalid
      }
    }

    const contact = await Contact.create(contactData);
    res.status(201).json(contact);
  } catch (error) {
    res.status(400).json({ msg: "Error creating contact" });
  }
};

// Get all contacts (Admin Only)
exports.getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ msg: "Error fetching contacts" });
  }
};

// Get My Contacts (User Only)
exports.getMyContacts = async (req, res) => {
  try {
    const contacts = await Contact.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ msg: "Error fetching your contact messages" });
  }
};
