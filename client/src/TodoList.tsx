import React, { useEffect, useState } from 'react';
import './TodoList.css';
import { itemInterface, appStateInterface} from './Interfaces';
import TodoCart from './TodoCart';
import {useNavigate} from 'react-router-dom';
import { useCookies} from 'react-cookie';

function TodoList(props : {appState : appStateInterface, setAppState : (appState : appStateInterface) => void}) {
    const navigate = useNavigate();
    const [popup, setPopup] = useState(false); 
    const [cookie] = useCookies(['username']);
    

    const listId = window.location.pathname.substring(1); 
    let wantUpdate = true;
    useEffect(() => {
        if (!cookie.username) window.location.pathname = "/";
        else if (!props.appState.allLists[listId]) {
            let allListsUpd = props.appState.allLists; 
            fetch(`/${listId}`).then(res => res.json()).then(res => {
              if (!res) window.location.pathname = "/";
              else {
                allListsUpd[listId] = res;
                props.setAppState({...props.appState, allLists: allListsUpd});
              }
            })
        }

        setInterval(() => {
          fetch(`/${listId}`).then(res => res.json()).then(res => {
            if (res && wantUpdate) {
              let allListsUpd = props.appState.allLists; 
              allListsUpd[listId] = res;
              props.setAppState({...props.appState, allLists: allListsUpd});
            }
          })
        }, 3000); 
    }, []); 

    const saveLocally = () => {
      window.localStorage.setItem('state', JSON.stringify(props.appState));
    }


    useEffect(()=>{
      saveLocally();
    })

    function handleDelete (toDelete : number) {
        wantUpdate = false; 
        let allListsUpd = props.appState.allLists; 
        allListsUpd[listId].items = allListsUpd[listId].items.filter(item => item.id != toDelete); 
        props.setAppState({...props.appState, allLists: allListsUpd});
        setTimeout(() => {
           saveByUsername(); saveByListId('POST');
        }, 300);  
        setTimeout(() => {
          wantUpdate = true;
       }, 2000);  
    }
    
      function handleChange (toChange : number) {
        wantUpdate = false; 
        let allListsUpd = props.appState.allLists; 
        allListsUpd[listId].items = allListsUpd[listId].items.map(item => {
            if (item.id !== toChange) return item;
            return {
              title: item.title,
              description: item.description,
              id: item.id,
              done: !item.done
            }
        })
        
        props.setAppState({...props.appState, allLists: allListsUpd});
        setTimeout(() => {
           saveByUsername(); saveByListId('POST');
        }, 300);
        setTimeout(() => {
          wantUpdate = true;
       }, 2000);  
      }

      function nextId(stateArr : itemInterface[]) {
        if (stateArr.length===0) return 0; 
        stateArr.sort((a,b) => a.id-b.id); 
        if (stateArr[0].id>0) return 0; 
        for (let i = 0; i < stateArr.length-1; i++) {
          if (stateArr[i+1].id-stateArr[i].id > 1) return stateArr[i].id+1;
        }
        return stateArr[stateArr.length-1].id+1; 
      }
      
    
      function handleSubmit (event : React.MouseEvent<HTMLFormElement>) {
        wantUpdate = false; 
        event.preventDefault(); 
        const title = (document.getElementById('txtTodoItemToAdd') as HTMLInputElement).value;
        const description = (document.getElementById('txtTodoItemToAdd_description') as HTMLInputElement).value;
    
        (document.getElementById('txtTodoItemToAdd') as HTMLInputElement).value = '';
        (document.getElementById('txtTodoItemToAdd_description') as HTMLInputElement).value = '';
        
        if (title.length > 0 || description.length > 0) {

            let allListsUpd = props.appState.allLists; 
            allListsUpd[listId].items = allListsUpd[listId].items.concat([{
            title: title,
            description: description,
            id: nextId(allListsUpd[listId].items),
            done: false     
           }
          ]);
           
          props.setAppState({...props.appState, allLists: allListsUpd});
        }

        setTimeout(() => {
          saveByUsername(); saveByListId('POST');
        }, 300);
        setTimeout(() => {
          wantUpdate = true;
       }, 2000);  
      }

      const saveByListId = (method : string) => {
        (!props.appState.allLists[listId].frozen || cookie.username == props.appState.allLists[listId].owner)
        fetch(`/saveByListId/${listId}`, {
          method: method, mode: 'cors',  headers: {'Content-Type': 'application/json'}, 
          body: JSON.stringify(props.appState.allLists[listId])
        })
      }

      const saveByUsername = () => {
        if ((!props.appState.allLists[listId].frozen || cookie.username == props.appState.allLists[listId].owner)) 
        fetch(`/saveByUsername/${cookie.username}`, {
            method: 'POST', mode: 'cors',  headers: {'Content-Type': 'application/json'}, 
            body: JSON.stringify(props.appState)
          })
      }


      const deleteList = () => {
        let allListsUpd = props.appState.allLists; 
        delete allListsUpd[listId]; 
        props.setAppState({...props.appState, allLists: allListsUpd});
        setTimeout(()=>{ 
            saveLocally();
            saveByUsername(); 
            saveByListId('DELETE');
          }, 100); 
        setPopup(false);
         
        navigate(-1); 
      }

      const makeFrozen = () => {
        let allListsUpd = props.appState.allLists; 
        allListsUpd[listId].frozen = true;
        props.setAppState({...props.appState, allLists: allListsUpd});
        saveByUsername(); saveByListId('POST');
      }

  return (
    
    <div> 
        <div className="listName">{listId.split('-')[0]}</div>

    <div>
    <fieldset className="frameForCreateNew"> 
      <legend className="frameForCreateNew__legend">Register new ToDo</legend>
      <form className="createNew" onSubmit={handleSubmit}>
        <label className="createNew__fieldName">Title:</label> <br></br>
        <input className="text" id="txtTodoItemToAdd"></input> <br></br>
        <label className="createNew__fieldName">Description:</label> <br></br>
        <input id="txtTodoItemToAdd_description"></input> <br></br>
        <input type="submit" value="Add" id="btnAddTodo"></input>
      </form> 
    </fieldset>
    </div>
    {props.appState.allLists[listId] &&
    <>
    <div id='todoList'>
     {props.appState.allLists[listId].items.map(
            item => 
            {if(item.done) return null;
            return <div key={item.id.toString()}> <TodoCart item={item} handleDelete={handleDelete} handleChange={handleChange}/> </div>}
            )
        }
        {props.appState.allLists[listId].items.map(
            item => 
            {if(item.done) return <div key={item.id.toString()}> <TodoCart item={item} handleDelete={handleDelete} handleChange={handleChange}/> </div>;
            return null;}
            )
        }
    </div> 

    
    <button onClick={()=>{saveLocally(); window.location.pathname="/"}}>Return to navigation</button>
    {(props.appState.allLists[listId].frozen && cookie.username != props.appState.allLists[listId].owner) && 
    <div>The list has been frozen by the owner. You can edit it locally, but it will not be saved to the server.</div>
    }
   {props.appState.allLists[listId].owner == cookie.username && <button onClick={()=>{makeFrozen();}}>Make frozen </button>} 
   { cookie.username == props.appState.allLists[listId].owner &&  <button onClick={()=>{setPopup(true);}}>Delete</button> } 
   {popup && <div>
                Are you sure?
                <button onClick={()=>{deleteList();}}>Yes, delete</button>
            </div>
    }
    </>
    
    }
    </div>

  );
}
export default TodoList;
