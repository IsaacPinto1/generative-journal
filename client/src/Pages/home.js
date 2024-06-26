import React from 'react'
import {Link, Navigate} from 'react-router-dom'
import { useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { useState } from 'react';
import axios from 'axios';
import { CookiesProvider, useCookies } from "react-cookie";
import './home.css'

function Home(){

    const [cookies, setCookie, removeCookie] = useCookies(["user"]);
    const navigate = useNavigate()
    const [name, setName] = useState('');
    const [entry, setEntry] = useState('');
    const [response, setResponse] = useState('Please make an entry.');
    const [date, setDate] = useState(''); // New state for date

    function logOut(){
        removeCookie("user", { path: '/'});
        navigate("/login")
    }

    const handleChange = (e) => {
        setEntry(e.target.value);
    };

    const summarizeJournalEntry = async (entryText) => {
      try {
        const openaiRes = await axios.post('http://localhost:3001/api/completion', {
            prompt: `Read the following journal entry and provide a brief wellness tip. Start your
            reponse with 'Wellness Tip:'` + `\n${entryText}`
          },
          {
            headers: {
              'Content-Type': 'application/json'
            },
          }
        );

        const extractedSummary = openaiRes.data.completion;

        const res = await axios.post('http://localhost:3001/api/journal', {
          userID: name,
          date,
          entry: entryText,
          summary: extractedSummary
        });
    
        // Now call OpenAI API to summarize the entry
    
        // Update the state with the OpenAI response
        setResponse(openaiRes.data.completion);
      } catch (error) {
        console.error('Error saving or summarizing journal entry:', error);
        setResponse('Error saving or summarizing journal entry');
      }
    };

    const handleDateChange = async (e) => {
      const selectedDate = e.target.value;
      setDate(selectedDate);
      const userID = name;
    
    
      try {
        const res = await axios.get('http://localhost:3001/api/journal', {
          params: { userID, date: selectedDate }
        });
    
        const { entry, summary } = res.data;
        setEntry(entry);
        if(summary == ""){
          setResponse("Please make an entry.")
        } else{
          setResponse(summary);
        }
      } catch (error) {
        console.error('Error fetching journal entry:', error);
        setResponse('Error fetching journal entry');
      }
    };


    const handleSubmit = async (e) => {
      e.preventDefault();
    
      if (!date) {
        setResponse('Please select a date');
        return;
      }
    
      try {
        await summarizeJournalEntry(entry); // Call the summarize function
    
        // Optionally, clear the entry field after submission
        //setEntry('');
      } catch (error) {
        console.error('Error saving or summarizing journal entry:', error);
        setResponse('Error saving or summarizing journal entry');
      }
    };


    useEffect(() => {
        const handleFetchData = async () => {
            try {
                const searchId = cookies.user;
            
                const response = await axios.get(`http://localhost:3001/getUserData?_id=${searchId}`);
                /*Query is passed as a dictionary. Names used determine the keys for the dictionary
                To have multiple: ?_id=${searchId}&param1=${queryParam1}&param2=${queryParam2} */
                setName(response.data.name)
            } catch (error) {
                console.log(error);
            }
          };
    
        handleFetchData();
      }, []);

    useEffect(() => {
        if (!cookies.user) {
          navigate("/login");
          return;
        }
      }, [cookies]);


    return(
        <>
        {name === '' ?
        <div className="loader-container">
            <div className="spinner"></div>
        </div>
        :
        <>
            <div id = 'header-container'>
              <h1>{name}'s Journal</h1>
              <button onClick={logOut} className='logout-button'>Log Out</button>
            </div>
            <form onSubmit={handleSubmit}>
                <input
                    type="date"
                    value={date}
                    onChange={handleDateChange} // New date input field
                    required
                />
                <br></br>
                <textarea
                value={entry}
                onChange={handleChange}
                placeholder="Write your journal entry here..."
                />
                <br></br>
                <button type="submit">Submit</button>
            </form>
            <div id = 'response-container'>
            {date == "" ? <p>Please select a date.</p> : response == "" ? <p>Please make an entry.</p> : response}
            </div>
            {/*response && <p>{JSON.stringify(response)}</p>*/}
            <br></br>
        </>
        }
        </>
    ) 
}

export default Home

