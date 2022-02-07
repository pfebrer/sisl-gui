import React from 'react';
import './App.css';
import "./styles/main.scss";


//--Redux
import getStoreAndPersistor from './redux/store'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import MainPage from './pages/MainPage';
import Syncronizer from './pages/Syncronizer';

const {store, persistor} = getStoreAndPersistor()

function App() {
  return (
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        <Syncronizer/>
        <div className="App" style={{display: "flex", flexDirection: "column"}}>
          <div className = "appContent" style={{height: "100vh"}}>
            <MainPage/>
          </div>   
        </div>
      </PersistGate>
    </Provider>
  );
}

export default App;
