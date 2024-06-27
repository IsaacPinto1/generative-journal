const mongoose = require('mongoose');

const journalEntrySchema = new mongoose.Schema({
  date: { type: String, required: true },
  entry: { type: String, required: true },
  summary: { type: String, required: true, default: "This is the OpenAI response" },
});

const userJournalSchema = new mongoose.Schema({
  userID: { type: String, required: true, unique: true },
  entries: { type: Map, of: journalEntrySchema, default: {} },
});

const UserJournal = mongoose.model('UserJournal', userJournalSchema);
module.exports = UserJournal;