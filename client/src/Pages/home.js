import React from 'react'
import {Link} from 'react-router-dom'
import { useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";

function Home(){

    const [cookies, setCookie, removeCookie] = useCookies(["user"]);
    const navigate = useNavigate()

    function logOut(){
        removeCookie("user", { path: '/'});
        navigate("/login")
    }

    useEffect(() => {
        if (!cookies.user) {
          navigate("/login");
          return;
        }
        navigate("/home/welcome")
      }, [cookies]);


    return(
        <span className = "home-container">
            <p>This is the home</p>
            <button onClick={logOut} className='logout-button'>Log Out</button>
        </span>
    ) 
}

export default Home