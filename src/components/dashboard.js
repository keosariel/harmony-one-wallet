import React, { useState, useEffect, useRef } from 'react'
import { supabase } from "../supabase"
import { get_wallet_data } from "../hmy"
import copy from "copy-to-clipboard";  
import { send_money } from "../hmy"
import './styles.css';

const Dashboard = ({ session }) => {

    const reasonRef = useRef()
    const amountRef = useRef()

    const receiverRef = useRef()
    const sendAmountRef = useRef()

    const [linkAlert, setLinkAlert] = useState({type: "d-none", msg: ""});
    const [sendAlert, setSendAlert] = useState({type: "d-none", msg: ""});
    const [links, setLinks] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [username, setUsername] = useState(null);
    const [address, setAddress] = useState(null);
    const [balance, setBalance] = useState(0.0);
    const [userId, setUserId] = useState(null);
    const [paymentForm, setPaymentForm] = useState("d-none");
    const [sendForm, setSendForm] = useState("d-none");

    useEffect(() => {
      getProfile();
    }, [session]);

    async function getProfile() {
        const user = supabase.auth.user();
        if(user) {
            setUsername(user.user_metadata.username);
            setAddress(user.user_metadata.address);
            setUserId(user.id);
            getLinks(user.id);

            // TODO: convert to bech32 ONE address
            getTransactions(user.user_metadata.address);
            get_wallet_data(user.user_metadata.privateKey).then((data) => {
                setBalance(data.balance);
            })
        }
    }

    async function getLinks(userId) {
        let { data, error } = await supabase
            .from('links')
            .select('*')
            .eq('author_id', userId);

        if(!error) {
          setLinks(data.reverse());
        }
    }

    async function getTransactions(address) {
        let { data, error } = await supabase
            .from('transactions')
            .select('*')
            .or(`sender.eq.${address},receiver.eq.${address}`);

          if(!error){
            setTransactions(data.reverse());
          }
        }

    if(!session){
        session = supabase.auth.session();
    }

    function togglePayForm(){
      if(paymentForm == "d-none") {
        setLinkAlert({type: "d-none", msg: ""});
        setPaymentForm("d-block");
      }else{
        setPaymentForm("d-none");
      }
    }

    function toggleSendForm(){
      if(sendForm == "d-none") {
        setSendAlert({type: "d-none", msg: ""});
        setSendForm("d-block");
      }else{
        setSendForm("d-none");
      }
    }

    async function handleSignOut() {
      await supabase.auth.signOut();
      window.location.href = window.location.origin;
    }

    const copyToClipboard = (text) => {
        copy(text);
        alert(`You have copied "${text}"`);
    }

    async function handleSubmit(e) {
      e.preventDefault()

      // Get email, username and password input values
      let reason = reasonRef.current.value
      let amount = parseInt(amountRef.current.value);
      

      if(reason && amount) {
        // Adding link to database
        const { data, error } = await supabase
          .from('links')
          .insert([
            { amount: amount, to_address: address, author_id: userId, reason: reason }
          ]);

        if (error) {
          setLinkAlert({type: "err", msg: error.message});
        } else {
          setLinkAlert({type: "suc", msg: "Successfully Added Link!"});
          setPaymentForm("d-none");
          await getLinks(userId);
        }
      }else{
        setLinkAlert({type: "err", msg: "Fill all fields."});
      }
    }

    async function handleSendSubmit(e) {
      e.preventDefault()

      // Get email, username and password input values
      let receiver = receiverRef.current.value
      let amount = parseInt(sendAmountRef.current.value);
      

      if(receiver && amount) {
          const user = supabase.auth.user();
          let tag = receiver.slice(1,);
          let { data, error } = await supabase.from("accounts").select("*").eq("username", tag);

          if (!error) {
            if(data.length == 0){
              setSendAlert({type: "err", msg: `Unknown user "${tag}"`});
            }else{
              let to_address = data[0].address;
              setSendAlert({ type: "info", msg: "Sending..." });

              let [noerr, errmsg] = await send_money(user.user_metadata.address, to_address, amount, user.user_metadata.privateKey);

              if (noerr) {
                setSendAlert({ type: "suc", msg: "Money sent!" });
                const { data, error } = await supabase
                  .from('transactions')
                  .insert([
                    { amount: amount, sender: user.user_metadata.address, receiver: to_address }
                  ]);
        
                if (error) {
                  setSendAlert({ type: "err", msg: error.message });
                } else {
                  setSendAlert({ type: "suc", msg: "Successfully Added transaction!" });
                }
              } else {
                setSendAlert({ type: "err", msg: errmsg });
              }
            }
          } else {
            setSendAlert({type: "err", msg: error.message});
          }
      }else{
        setSendAlert({type: "err", msg: "Fill all fields."});
      }
    }

    function getPaymentLink(link) {
      return window.location.origin + `/payment/${link.public_id}`;
    }

  return (
    (!session ? 
      <div className='form'>
        <h1>Loading....</h1>
        <a href='/login'>Try to login again if it doesn't show up</a>
      </div>
      :
        <div className="container">
          <div class={'overlay ' + paymentForm}>
            <div class="form">
                <form onSubmit={handleSubmit}>
                  <div className='d-flex between'>
                    <h3 class="ftitle">Create payment link</h3>
                    <div><img src="/static/x.png" className='cpointer' onClick={togglePayForm} height={20}/></div>
                  </div>
                  <div className={ "alert "+linkAlert.type }>
                    <p>{linkAlert.msg}</p>
                  </div>
                  <div>
                      <label for="reason">Reason</label>
                      <input id="input-reason" type="text" ref={reasonRef} placeholder="Spotify"/>
                  </div>
                  <div>
                      <label for="amount">Amount in ONE</label>
                      <input id="input-amount" type="number" ref={amountRef}/>
                  </div>
                  <button type="submit">Create Link</button>
                </form>
            </div>
        </div>
        <div class={'overlay ' + sendForm}>
            <div class="form">
                <form onSubmit={handleSendSubmit}>
                  <div className='d-flex between'>
                    <h3 class="ftitle">Send ONE</h3>
                    <div><img src="/static/x.png" className='cpointer' onClick={toggleSendForm} height={20}/></div>
                  </div>
                  <div className={ "alert "+sendAlert.type }>
                    <p>{sendAlert.msg}</p>
                  </div>
                  <div>
                      <label for="reason">$Username</label>
                      <input id="input-reason" type="text" ref={receiverRef} placeholder="$Username or Address"/>
                  </div>
                  <div>
                      <label for="amount">Amount in ONE</label>
                      <input id="input-amount" type="number" ref={sendAmountRef}/>
                  </div>
                  <button type="submit">Send</button>
                </form>
            </div>
        </div>
        <div class="nav">
            <img src="static/logo.png" alt=""></img>
            <button onClick={handleSignOut}>Sign Out</button>
        </div>
        <main>
            <div class="cont">
                <div class="det">
                    <div id="username" onClick={() => copyToClipboard(username)}>
                        ${username}
                    </div>
                    <div id="addr" onClick={() => copyToClipboard(address)}>
                      {address}
                    </div>
                    <div id="balance">
                    {balance}&nbsp;ONE
                    </div>
                    <div id="actions">
                        <button onClick={toggleSendForm}>Send</button>
                        <button onClick={togglePayForm}>Recieve</button>
                    </div>
                </div>
                <div id="trans">
                    <div id="dummy">
                        No Transactions Yet!
                    </div>
                    <div class="table">
                        <div class="ttitle">
                            Recent Links
                        </div>
                        <div class="thead">
                            <div>Amount</div>
                            <div>Reason</div>
                            <div></div>
                        </div>
                        { links? links.map(
                          (link) =>
                            <div class="titem" key={link.id}>
                                <div>{link.amount} ONE</div>
                                <div>{link.reason}</div>
                                <div>
                                  <button onClick={() => copyToClipboard(getPaymentLink(link))}>Copy link</button>
                                </div>
                            </div>)
                          : <h3>No Links Yet!</h3>}
                        
                    </div>
                </div>
                <div id="trans">
                    <div id="dummy">
                        No Transactions Yet!
                    </div>
                    <div class="table">
                        <div class="ttitle">
                            Recent Transactions
                        </div>
                        <div class="thead">
                            <div>Address</div>
                            <div>Amount</div>
                            <div>Reason</div>
                        </div>
                        { transactions? transactions.map(
                          (transaction) =>
                            <div>
                                { transaction.sender ==  address? 
                                  <div class="titem" key={transaction.id}>
                                      <div><a href={"https://explorer.pops.one/address/"+transaction.receiver} target="_blank">{transaction.receiver}</a></div>
                                      <div class="down">-{transaction.amount} ONE</div>
                                      <div></div>
                                  </div>
                                  :
                                  <div class="titem" key={transaction.id}>
                                      <div><a href={"https://explorer.pops.one/address/"+transaction.sender} target="_blank">{transaction.sender}</a></div>
                                      <div class="up">+{transaction.amount} ONE</div>
                                      <div></div>
                                  </div>
                                }
                              </div> 
                          )
                          : <h3>No Transactions Yet!</h3> }
                    </div>
                </div>
            </div>
        </main>
    </div>
    )
  )
};


export default Dashboard;