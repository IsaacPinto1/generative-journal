import React from 'react'
import {Link, Navigate} from 'react-router-dom'
import { useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { useState } from 'react';
import axios from 'axios';
import { CookiesProvider, useCookies } from "react-cookie";

function Home(){

    const [cookies, setCookie, removeCookie] = useCookies(["user"]);
    const navigate = useNavigate()
    const [name, setName] = useState('');
    const [entry, setEntry] = useState('');
    const [response, setResponse] = useState(null);
    const [date, setDate] = useState(''); // New state for date

    function logOut(){
        removeCookie("user", { path: '/'});
        navigate("/login")
    }

    const handleChange = (e) => {
        setEntry(e.target.value);
    };

    const handleDateChange = (e) => {
        setDate(e.target.value); // New function to handle date change
      };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        const userID = name;

        if (!date) { // Check if date is selected
            setResponse('Please select a date');
            return;
        }

        try {
          const res = await axios.post('http://localhost:3001/api/journal', {
            userID,
            date,
            entry
          });
    
          setResponse(res.data);
        } catch (error) {
          console.error('Error saving journal entry:', error);
          setResponse('Error saving journal entry');
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
            <h2>Hello, {name}!</h2>
            <p>Welcome to the journal</p>
            <h1>Journal Entry</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="date"
                    value={date}
                    onChange={handleDateChange} // New date input field
                    required
                />
                <textarea
                value={entry}
                onChange={handleChange}
                placeholder="Write your journal entry here..."
                />
                <button type="submit">Submit</button>
            </form>
            {response && <p>{JSON.stringify(response)}</p>}
            <button onClick={logOut} className='logout-button'>Log Out</button>
        </>
        }
        </>
    ) 
}

export default Home

