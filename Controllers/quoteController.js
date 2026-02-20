const Quote = require("../Models/quoteModel");

// User submit quote
exports.createQuote = async (req, res) => {
  const quote = await Quote.create({
    message: req.body.message,
    user: req.user.id
  });
  res.json(quote);
};

// User view own quotes
exports.getMyQuotes = async (req, res) => {
  const quotes = await Quote.find({ user: req.user.id });
  res.json(quotes);
};

// Admin view all quotes
exports.getAllQuotes = async (req, res) => {
  const quotes = await Quote.find().populate("user", "name email");
  res.json(quotes);
};