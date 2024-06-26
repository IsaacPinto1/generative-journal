const express = require("express")
const mongoose = require("mongoose")
const ApiKey = require('./models/ApiKey')
const dotenv = require('dotenv');
const cors = require("cors")
const axios = require('axios');
const connectDB = require('./config/db');

dotenv.config();
connectDB();


const app = express()
app.use(express.json())
app.use(cors())


app.get('/api/completion', async (req, res) => {
    try {
      const apiKeyDoc = await ApiKey.findOne({ service: 'openai' });
      if (!apiKeyDoc) {
        return res.status(404).json({ msg: 'API key not found' });
      }
  
      const response = await axios.post(
        'https://api.openai.com/v1/engines/davinci-codex/completions',
        {
          prompt: req.query.prompt,
          max_tokens: 150,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKeyDoc.apiKey}`,
          },
        }
      );
  
      res.json(response.data.choices[0].text);
    } catch (error) {
      console.error('Error fetching data from OpenAI API:', error);
      res.status(500).send('Error fetching data from OpenAI API');
    }
  });


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));