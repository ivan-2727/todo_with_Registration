import React, { useState } from 'react';
import './App.css';
import {useCookies} from 'react-cookie';
import { loginStateInterface, appStateInterface} from './Interfaces';
import './Login.css';

function Login(props : {setAppState : (appState : appStateInterface) => void}) {

  const [cookie, setCookie] = useCookies(['username']);
  const [state, setState] = useState <loginStateInterface> ({
    userAlreadyExists : false,
    wrongLogin : false,
    successfulRegistration: false,
    error : ''
  });

  const handleRegistration = () => {
    const usernameField = document.getElementById('username') as HTMLInputElement;
    const passwordField = document.getElementById('password') as HTMLInputElement;
    const username = usernameField.value;
    const password = passwordField.value;
    fetch(`/register`, {
        method: 'POST', mode: 'cors',  headers: {'Content-Type': 'application/json'}, 
        body: JSON.stringify({username: username, password: password})
      }).then(res => res.json())
        .then(res => {
          if (!res.error) {
            if (res.result == 0) setState({...state, successfulRegistration: false, userAlreadyExists: true}); 
            else {
              setState({...state, successfulRegistration: true, userAlreadyExists: false}); 
              usernameField.value = "";
              passwordField.value = ""; 
            }
          }
          else setState({...state, error : `Problem on server, code ${res.error}`}); 
        })
        .catch((e) => {setState({...state, error : `Error: ${e.name} ${e.message}`}); });
  };

  const handleLogin = () => {
    const username = (document.getElementById('username') as HTMLInputElement)?.value;
    const password = (document.getElementById('password') as HTMLInputElement)?.value;
    fetch(`/login`, {
        method: 'POST', mode: 'cors',  headers: {'Content-Type': 'application/json'}, 
        body: JSON.stringify({username: username, password: password})
      }).then(res => res.json())
        .then(res => {
          if (res.result === 0) setState({...state, wrongLogin: true}); 
          else {
            setCookie('username', username); 
            props.setAppState({allLists : res});
          }
        })
        .catch((e) => {setState({...state, error : `Error: ${e.name} ${e.message}`}); });
  };
  
 
  return (
    <div className="container"> 
    <div className="get-started"> 
      <form>
        <input className="login-form" type="text" placeholder="Username" id="username" onKeyDown={()=>{setState({...state, userAlreadyExists: false, wrongLogin: false, error : null as unknown as string})}} /> 
        <input className="login-form" type="password" placeholder="Password" id="password" onKeyDown={()=>{setState({...state, userAlreadyExists: false, wrongLogin: false, error : null as unknown as string})}}/> 
        <button className="login-btn" onClick={(e) => {e.preventDefault(); handleRegistration();}} >Register </button>
        <button className="login-btn" onClick={(e) => {e.preventDefault(); handleLogin();}}>Log in </button> 
        {state.userAlreadyExists && <div> User already exists </div>}
        {state.wrongLogin && <div> Wrong login or password </div>}
        {state.error && <div> {state.error} </div>}
        {state.successfulRegistration && <div> Successful registration! Now you can login. </div>}
      </form>
    
    </div>
    </div>
  );
}
export default Login;
