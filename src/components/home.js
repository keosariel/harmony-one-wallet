import React from 'react'
import { Link } from "react-router-dom";
import './styles.css';

const Home = () => {

    return (
      <div>
          <div className="nav">
            <img src="static/logo.png" alt=""></img>
            <a href="/login">
              <img src="static/person.png" alt=""></img>
            </a>
          </div>
          <main>
            <div className="m1">
              <strike className="add1">one1f80ewtdsn56gqg7seljky2l25elj92xsama2hu</strike>
              <h3>$username</h3>
              <p>Yup! that's basically it.</p>
              <p>Send and recieve effortlessly.</p>
              <a href='/signup' className='button'>Get Started</a>
            </div>
            <img id="cones" src="static/Cones.png" alt=""></img>
          </main>
      </div>
    );
};

export default Home;