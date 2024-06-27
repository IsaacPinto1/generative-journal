const express = require("express")
const mongoose = require("mongoose")
const dotenv = require('dotenv');
const axios = require('axios');
const cors = require("cors")
const connectDB = require('./config/db');
const UserModel = require('./models/user')
const ApiKey = require('./models/ApiKey')
const UserJournal = require('./models/UserJournal'); // Adjust the path as necessary

dotenv.config();
connectDB();


const app = express()
app.use(express.json())
app.use(cors())

// USERS:

app.post("/login", (req, res) =>{ // API endpoint
  const {name, pw} = req.body;
  UserModel.findOne({name:name})
  .then(user => {
      if(user) {
          if(user.pw === pw){
              res.json(
                  {status:"Success",
                  name:user.name,
                  id: user._id})
          } else{
              res.json(
                  {status:"Wrong Password",
                  user: null})
          }
      } else{
          res.json(
              {status:"No User Exists",
                  user: null}
          )
      }
  })
})

app.post('/register', (req, res) =>{ // request, response
  const {name, pw} = req.body

  UserModel.findOne({name:name})
  .then(user => {
      if(user) {
          res.json({
              status: "Failure",
              user: null
          })
      } else{
          UserModel.create({name,pw})
          .then(user => res.json({
              status: "Success",
              user: user}))
          .catch(err => res.json(err))
      }
  })
})


app.get('/getUserData', async (req, res) => {
  try {
      const _id = req.query; // Modify the query parameter to "_id"
      const query = _id ? { _id } : {};

      
      const user = await UserModel.findOne(query);
      res.json(user);
  } catch (error) {
    res.status(500).json(error);
  }
});

app.get('/getUserId', async (req, res) => {
  try {
      const { name } = req.query;
      const query = name ? { name } : {};
      
      const user = await UserModel.findOne(query);
      res.json({
          id:user._id
      });
  } catch (error) {
      res.status(500).json(error);
  }
});

app.delete('/deleteDocument/:id', async (req, res) => {
  const { id } = req.params; // Get the ID from the URL parameter
  try {
    const deletedDocument = await UserModel.findByIdAndDelete(id);
    if (!deletedDocument) {
      return res.status(404).json({ error: 'Document not found' });
    }
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});













// OpenAI:




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



























// Journal:

// Endpoint to add a journal entry
app.post('/api/journal', async (req, res) => {
  try {
    const { userID, date, entry } = req.body;

    // Check if the user exists
    const user = await UserModel.findOne({name:userID});
    if (!user) {
      return res.json({
        status: "No User Exists",
        user: null
      });
    }

    // Find or create the user journal entry
    let userJournal = await UserJournal.findOne({ userID });
    if (!userJournal) {
      userJournal = new UserJournal({ userID });
    }

    // Set the journal entry
    userJournal.entries.set(date, { date, entry, summary: "This is the OpenAI response" });

    // Save the journal entry
    await userJournal.save();

    // Respond with success
    res.json({ status: 'Success', user: userJournal });
  } catch (error) {
    console.error('Error saving journal entry:', error);
    res.status(500).send('Error saving journal entry');
  }
});


app.get('/api/journal', async (req, res) => {
  try {
    const { userID, date } = req.query;

    const userJournal = await UserJournal.findOne({ userID });
    if (!userJournal || !userJournal.entries.has(date)) {
      return res.json({ entry: '', summary: '' });
    }

    const journalEntry = userJournal.entries.get(date);
    res.json(journalEntry);
  } catch (error) {
    console.error('Error fetching journal entry:', error);
    res.status(500).send('Error fetching journal entry');
  }
});
