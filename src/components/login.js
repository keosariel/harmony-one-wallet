import React, { useRef, useState, useEffect } from 'react'
import './styles.css';
import { Navigate } from "react-router-dom";
import { supabase } from "../supabase"

const Login = () => {
  const emailRef = useRef()
  const passwordRef = useRef()

  const [loginAlert, setLoginAlert] = useState({type: "d-none", msg: ""});

  const [session, setSession] = useState(null);

  useEffect(() => {
    setSession(supabase.auth.session());
  }, []);

  async function handleSubmit(e) {
    e.preventDefault()

    // Get email, username and password input values
    const email = emailRef.current.value.trim().toLowerCase()
    const password = passwordRef.current.value

    const { user, session, error } = await supabase.auth.signIn({
      email: email,
      password: password
    })

    console.log(user, error);
    if (error) {
      setLoginAlert({type: "err", msg: error.message});
    } else {
      setLoginAlert({type: "suc", msg: "Successfully Logged In."});
      setSession(supabase.auth.session());
    }
  }

  return (
    (!session ?
      <div className="container">
        <form className='form' onSubmit={handleSubmit}>
          <h3 class="ftitle">Welcome back!</h3>
          <div className={ "alert "+loginAlert.type }>
            <p>{loginAlert.msg}</p>
          </div>
          <label htmlFor="input-email">Email</label>
          <input id="input-email" type="email" ref={emailRef} placeholder="example@mail.com" />

          <label htmlFor="input-password">Password</label>
          <input id="input-password" type="password" ref={passwordRef} placeholder="You should know your password." />

          <br />

          <button type="submit">Login</button>
          <p>
            Don't have an account? <a href="/signup">Sign Up</a>
          </p>
        </form>
      </div>
      :
      <Navigate to="/dashboard" key={session.user.id} session={session} /> 
    )
  )
}

export default Login;