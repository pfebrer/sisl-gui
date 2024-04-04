import React, { useEffect } from 'react';
//import './App.css';
//import "./styles/main.scss";

import MainPage from './pages/MainPage';

import { PythonApi } from './apis/PythonApi';
import PythonApiContext, { PythonApiStatusContext } from './apis/context';
import { SessionLastUpdatesContext, SessionSynchronizer } from './context/session_context';
import { TooltipsLevel, TooltipsLevelContext } from './context/tooltips';
import { SessionLastUpdates } from './interfaces';

function App() {

    const [ pythonApi, setPythonApi ] = React.useState<PythonApi>(new PythonApi())
    const [ pythonApiStatus, setPythonApiStatus ] = React.useState<PythonApi["status"]>(pythonApi.status)

    const [lastUpdates, setLastUpdates] = React.useState<SessionLastUpdates>({nodes: 0., flows: 0., node_classes: 0.})

    const [tooltipsLevel, setTooltipsLevel] = React.useState<TooltipsLevel>("normal")

    useEffect(() => {
        pythonApi.onStatusChange = (status) => {
            setPythonApiStatus(status)
        }
        pythonApi.onReceiveLastUpdate((updates: any) => {
            setLastUpdates(updates)
        })
    }, [pythonApi])

    return (
        <>
            <PythonApiStatusContext.Provider value={pythonApiStatus}>
            <PythonApiContext.Provider value={{pythonApi, setPythonApi}}>
                <SessionLastUpdatesContext.Provider value={lastUpdates}>
                <SessionSynchronizer>
                <TooltipsLevelContext.Provider value={{tooltipsLevel, setTooltipsLevel}}>
                <div className="App" style={{display: "flex", flexDirection: "column"}}>
                <div className = "appContent" style={{height: "100vh"}}>
                    <MainPage/>
                </div>   
                </div>
                </TooltipsLevelContext.Provider>
                </SessionSynchronizer>
                </SessionLastUpdatesContext.Provider>
            </PythonApiContext.Provider>
            </PythonApiStatusContext.Provider>
        </>
    );
}

export default App;
