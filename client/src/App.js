import React from "react";
import {BrowserRouter, Routes, Route, Navigate} from 'react-router-dom'
import Login from './Pages/login.js';
import Home from './Pages/home.js';
import Register from "./Pages/register.js";
import { useState } from "react";
import { CookiesProvider, useCookies } from "react-cookie";

function App(){

    const [cookies, setCookie] = useCookies(["user"]);
    
    return(
        <BrowserRouter>
            <Routes>
                <Route path = '/register' element={<Register/>}></Route>
                
                <Route path = '/login' element={<Login/>}></Route>

                <Route path = '/home' element = {<Home/>}>
                </Route>
                <Route path = "*" element={cookies.user? <Navigate to = "/home"/>: <Navigate to = "/login"/> }></Route>
            </Routes>
        </BrowserRouter>
    )
}

export default App