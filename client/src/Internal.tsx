import {useCookies} from 'react-cookie';
import {appStateInterface} from './Interfaces';
import { useNavigate } from "react-router-dom";
import { Link } from 'react-router-dom';
import {useEffect, useState} from 'react';
import './Internal.css';

function Internal(props : {appState : appStateInterface, setAppState : (appState : appStateInterface) => void}) {
    const navigate = useNavigate(); 
    const [popup, setPopup] = useState(false);
    const [cookie, _, removeCookie] = useCookies(['username']);  

    const handleLogout = () => {
        fetch(`/${cookie.username}`, {
            method: 'POST', mode: 'cors',  headers: {'Content-Type': 'application/json'}, 
            body: JSON.stringify(props.appState)
        }).then(() => {
            removeCookie('username');
            delete window.localStorage['state'];
            props.setAppState({allLists: {}});
        })
    }

    const genUniqueId = () : string => {
        const dateStr = Date
          .now()
          .toString(36); // convert num to base 36 and stringify
      
        const randomStr = Math
          .random()
          .toString(36)
          .substring(2, 8); // start at index 2 to skip decimal point
      
        return `${dateStr}${randomStr}`;
      }

    const createList = () => {
        const name = (document.getElementById('listName') as HTMLInputElement).value;
        if (! /[^A-Za-z0-9]/.test(name)) {
            const listId = `${name}-${genUniqueId()}`; 
            let allListsUpd = props.appState.allLists; 
            allListsUpd[listId] = {owner: cookie.username, items: []}; 
            props.setAppState({...props.appState, allLists: allListsUpd});
            setPopup(false);
            navigate(`/${listId}`);
        }
         
    }

    return (
        <div className="get-started">
            <div> Welcome {cookie.username}</div>
            <div> {Object.keys(props.appState.allLists).length > 0 ? 
                `Here are your todo lists:` 
                : "Seems you haven't created any lists yet." }</div>
            {Object.keys(props.appState.allLists).map(listId => <Link className='listname' to={`${listId}`} > {listId.split('-')[0]} </Link> )}
            <button className="createnew-btn" onClick={()=>{setPopup(true);}}> Create new list </button> 
            <button className="logout-btn" onClick={()=>{handleLogout();}}> Log out </button> 
            {popup && <div className="modal" > <div className="modal_content"> <span onClick={()=>{setPopup(false);}} className="close">&times;</span> <form onSubmit={(e)=>{e.preventDefault(); createList();}}>
                <label className="createNew__fieldName">Give a name to your list (only digits and numbers):</label> <br></br>
                <input className="text" id="listName"></input> <br></br>
            </form> </div>  </div> 
            }
        </div>
    );
}

export default Internal; 