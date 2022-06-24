import { useCookies} from 'react-cookie';
import {useEffect, useState } from 'react'; 
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link
} from "react-router-dom";
import Login from './Login';
import Internal from './Internal';
import TodoList from './TodoList';
import {appStateInterface} from './Interfaces'

function App() {

  const [cookie] = useCookies(['username']);
  const [appState, setAppState] = useState<appStateInterface>(window.localStorage.state? JSON.parse(window.localStorage.state) : {allLists : {}});

  return (
    <> 
    <Router>  
     <Routes>
      <Route path="/" element={cookie.username ? <Internal appState={appState} setAppState={setAppState}/> 
        : <Login setAppState={setAppState}/>}> </Route>
      <Route path="/*" element={<TodoList setAppState={setAppState} appState={appState}/>}>

      </Route>
     </Routes>
    </Router>
    </>
  );
}
export default App;
