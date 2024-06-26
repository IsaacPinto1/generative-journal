const mongoose = require('mongoose')

const apiKeySchema = new mongoose.Schema({
    service: String,
    apiKey: String,
  });
  
  const ApiKey = mongoose.model('ApiKey', apiKeySchema);
  module.exports = ApiKey