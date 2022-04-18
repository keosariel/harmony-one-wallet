
import React from 'react'
import { useState, useEffect } from "react"
import { 
  BrowserRouter as Router,
  Routes,
  Route} from "react-router-dom";
import Home from "./components/home";
import Payment from "./components/payment";
import Dashboard from "./components/dashboard";
import Signup from "./components/signup";
import Login from "./components/login";

import {supabase} from "./supabase"


export default function App() {

    const [session, setSession] = useState(null);

    useEffect(() => {
      setSession(supabase.auth.session());
    }, []);


    return (
        <Router>
          <div>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<Dashboard session={ session }/>} />
              <Route path="/payment/:link_id" element={<Payment />} />
            </Routes>
          </div>
        </Router>
    );
}