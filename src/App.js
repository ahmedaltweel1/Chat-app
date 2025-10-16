import "./App.css";
import { useEffect, useState, useRef } from "react";
import {BrowserRouter,Routes,Route,Link} from 'react-router-dom'

import Userss from './componenet/specific'
import Appp from './componenet/Allconnection'
import Private from './componenet/private'

function App() {
 

  return (



    
  <BrowserRouter>
  
    <nav>
      <Link to='/'>Home</Link>
      <Link to='/all'>all</Link>
      <Link to='/specific'>users</Link>
      <Link to ></Link>
    </nav>

<Routes>
  <Route path='/' element={<Appp></Appp>}></Route>
  <Route path='/specific' element={<Userss></Userss>}></Route>
  <Route path='/' element={<Appp></Appp>}></Route>
  <Route path='/specifi/:username' element={<Private></Private>}></Route>
</Routes>

  </BrowserRouter>
  );
}

export default App;
