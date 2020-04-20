import React from 'react';
import './App.css';
import './materialize.min.css'
import Oks from './apis/Socket'

//--Redux
import getStoreAndPersistor from './redux/store'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import Plots from './pages/Plots'

const {store, persistor} = getStoreAndPersistor()

function App() {
  return (
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        <div className="App" style={{display: "flex", flexDirection: "column"}}>
          <div className = "appContent" style={{height: "100vh"}}>
            <Plots/>
          </div>   
        </div>
      </PersistGate>
    </Provider>
  );
}

export default App;
