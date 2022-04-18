import React from 'react'
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react"
import { supabase } from "../supabase"
import { send_money } from "../hmy"

const ethers = require('ethers');

const Payment = () => {
  const { link_id } = useParams();

  const [pay, setPay] = useState(null);
  const [author, setAuthor] = useState(null);
  const [paymentAlert, setPaymentAlert] = useState({ type: "d-none", msg: "" });

  useEffect(() => {
    getPayData();
  }, []);

  async function getPayData() {
    let { data, error } = await supabase
      .from('links')
      .select('*')
      .eq('public_id', link_id);

    if (!error) {
      setPay(data[0]);
      await getAuthor(data[0]);
    }
  }

  async function getAuthor(pay) {
    let { data, error } = await supabase.from("accounts").select("*").eq("address", pay.to_address);
    if (!error) {
      setAuthor(data[0]);
    } else {
      console.log(error);
    }
  }

  async function transact() {
    const user = supabase.auth.user();
    if (user) {
      setPaymentAlert({ type: "info", msg: "Sending..." });
      let [noerr, errmsg] = await send_money(user.user_metadata.address, pay.to_address, pay.amount, user.user_metadata.privateKey);
      if (noerr) {
        setPaymentAlert({ type: "suc", msg: "Money sent!" });
        const { data, error } = await supabase
          .from('transactions')
          .insert([
            { amount: pay.amount, sender: user.user_metadata.address, receiver: pay.to_address }
          ]);

        if (error) {
          setPaymentAlert({ type: "err", msg: error.message });
        } else {
          setPaymentAlert({ type: "suc", msg: "Successfully Added transaction!" });
        }
      } else {
        setPaymentAlert({ type: "err", msg: errmsg });
      }

    } else {
      setPaymentAlert({ type: "err", msg: "Not authenticated." });
    }
  }

  // TODO: send with external wallet
  async function transactMetamask(){
    if(window.ethereum){
        
    }
  }

  return (
    <div class="form">
      {(!pay ?
        <h4>Loading Payment Details...</h4>
        :
        <div className='payments'>
          <div className={"alert " + paymentAlert.type}>
            <p>{paymentAlert.msg}</p>
          </div>
          <h4>Pay for {pay.reason}</h4>
          <p>to {`$${author ? author.username : ''}`} {pay.to_address}</p>
          <h2>{pay.amount} ONE</h2>
          <br /> 
          <button onClick={transact}>Send Money Now</button>
          {/* <button onClick={transactMetamask}>Pay with Metamask</button> */}
          <p>Note: This is not reversable.</p>
        </div>
      )}
    </div>
  );
};

export default Payment;