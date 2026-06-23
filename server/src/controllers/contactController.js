import Contact from '../models/Contact.js';

export const submitContact = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validate request body fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'All fields (name, email, subject, message) are required.' });
    }

    // Basic email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address.' });
    }

    // Create contact record in MongoDB
    const contact = await Contact.create({
      name,
      email,
      subject,
      message,
    });

    return res.status(201).json({
      message: 'Contact form submitted successfully.',
      contact: {
        id: contact._id,
        name: contact.name,
        email: contact.email,
        subject: contact.subject,
        createdAt: contact.createdAt,
      },
    });
  } catch (error) {
    console.error('Error submitting contact form:', error);
    return res.status(500).json({ message: 'Internal server error while submitting contact form.' });
  }
};
