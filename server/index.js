const express = require("express")
const mongoose = require("mongoose")
const ApiKey = require('./models/ApiKey')
const dotenv = require('dotenv');
const axios = require('axios');
const connectDB = require('./config/db');

dotenv.config();
connectDB();


const app = express()
app.use(express.json())

app.post('/registerkey', (req, res) =>{ // request, response
  const {service,apiKey} = req.body
  ApiKey.create({service, apiKey}).then(objID => res.json({
    status: "Success",
    user: objID
  }))
  .catch(err => res.json(err))
})


app.get('/api/completion', async (req, res) => {
    try {
      const apiKeyDoc = await ApiKey.findOne({ service: 'OpenAI' });
      if (!apiKeyDoc) {
        return res.status(404).json({ msg: 'API key not found' });
      }
      console.log('API Key:', apiKeyDoc.apiKey);
      console.log('Prompt:', req.body.prompt);
  
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          "messages":[{"role":"user", "content":req.body.prompt}],
          "model": "gpt-3.5-turbo"
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKeyDoc.apiKey}`,
          },
        }
      );
        // Extract the necessary data from the response
      const completion = response.data.choices[0].message.content;

      console.log(completion)
      
      // Send only the extracted data back to the client
      res.json({ completion });
    } catch (error) {
      console.error('Error fetching data from OpenAI API:', error);
      res.status(500).send('Error fetching data from OpenAI API');
    }
  });


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));