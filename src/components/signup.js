

import React, { useRef, useState, useEffect } from 'react'
import './styles.css';
import { Navigate } from "react-router-dom";

import {supabase} from "../supabase"

import { create_wallet } from "../hmy"


const Signup = () => {

    const [signupAlert, setSignupAlert] = useState({type: "d-none", msg: ""});

    const emailRef = useRef()
    const usernameRef = useRef()
    const passwordRef = useRef()

    const [session, setSession] = useState(null);

    useEffect(() => {
      setSession(supabase.auth.session());
    }, []);

    async function handleSubmit(e) {
      e.preventDefault()

      // Get email, username and password input values
      const email = emailRef.current.value.trim().toLowerCase()
      const username = usernameRef.current.value.trim().toLowerCase()
      const password = passwordRef.current.value

      const wallet = create_wallet(); 

      const { user, session, error } = await supabase.auth.signUp({
          email: email,
          password: password},
          {
            data: { 
              username: username,
              privateKey: wallet.privateKey,
              address: wallet.address
            }
          })

        if (error) {
          setSignupAlert({type: "err", msg: error.message});
        } else {
          setSignupAlert({type: "suc", msg: "Setting up account."});
          let { data, error } = await supabase
          .from('accounts')
          .insert([
            { user_id: user.id, username: username, address: wallet.address, private_key: wallet.privateKey }
          ]);

          if(error){
            setSignupAlert({type: "err", msg: error.message});
          }else{
            setSignupAlert({type: "suc", msg: "Signing you in."});
            setSession(supabase.auth.session());
          }
        }
      }

    return (
      (!session ? 
        <div className="container">
          <form className='form' onSubmit={handleSubmit}>
            <h3 class="ftitle">Create Your Wallet</h3>
            <div className={ "alert "+signupAlert.type }>
              <p>{signupAlert.msg}</p>
            </div>
            <label htmlFor="input-email">Email</label>
            <input id="input-email" type="email" ref={emailRef} placeholder="example@mail.com"/>

            <label htmlFor="input-username">Username (Tag)</label>
            <input id="input-username" type="text" ref={usernameRef} placeholder="$nickname :)" />
            
            <label htmlFor="input-password">Password</label>
            <input id="input-password" type="password" ref={passwordRef} placeholder="Keep it secret..." />

            <br />

            <button type="submit">Sign up</button>
            <p>
                Already have an account? <a href="/login">Log In</a>
            </p>
          </form>
        </div>
        :
        <Navigate to="/dashboard" key={session.user.id} session={session} /> 
      )
    )
}

export default Signup;