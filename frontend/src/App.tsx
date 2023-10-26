import React, { useEffect } from 'react';
//import './App.css';
//import "./styles/main.scss";


//--Redux
import getStoreAndPersistor from './redux/store'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import MainPage from './pages/MainPage';

import PythonApiContext, { PythonApiStatusContext } from './apis/context';
import { PythonApi } from './apis/PythonApi';

const {store, persistor} = getStoreAndPersistor()

function App() {

    const [ pythonApi, setPythonApi ] = React.useState<PythonApi>(new PythonApi())
    const [ pythonApiStatus, setPythonApiStatus ] = React.useState<PythonApi["status"]>(pythonApi.status)

    useEffect(() => {
        pythonApi.onStatusChange = (status) => {
            setPythonApiStatus(status)
        }
    }, [pythonApi])

    return (
        <Provider store={store}>
        <PersistGate persistor={persistor}>
            <PythonApiStatusContext.Provider value={pythonApiStatus}>
            <PythonApiContext.Provider value={{pythonApi, setPythonApi}}>
            {/* <Syncronizer/> */}
            <div className="App" style={{display: "flex", flexDirection: "column"}}>
            <div className = "appContent" style={{height: "100vh"}}>
                <MainPage/>
            </div>   
            </div>
            </PythonApiContext.Provider>
            </PythonApiStatusContext.Provider>
        </PersistGate>
        </Provider>
    );
}

export type RootState = ReturnType<typeof store.getState>

export default App;
