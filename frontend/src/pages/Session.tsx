import { FC, useState } from 'react'
import PythonApi from "../apis/PythonApi"

//--Components
import ReactTooltip from "react-tooltip"
import SettingsContainer from "../components/settings/SettingsContainer"

//--Redux
import { connect } from 'react-redux'

import _ from "lodash"
import { SessionInterface } from '../interfaces'
import { Button, Toolbar } from '@material-ui/core'
import FilesInput from '../components/settings/inputFields/Files'
import NotConnected from '../components/loading/NotConnected'
import Methods from '../components/pythonMethods/Methods'

interface SessionSettingsProps {
    session: SessionInterface,
    style: {[key: string]: any},
}

const saveCurrentSession = (currentSession: SessionInterface) => {
    const path = prompt("Please provide the path to save the session.\n\nRoot directory:\n" + currentSession.settings.root_dir)
    if (!path) return 

    PythonApi.saveSession(path)
}

const loadSession = (acceptedFiles: File[]) => {
    const sessionFile = acceptedFiles[0]
    PythonApi.loadSessionFromFile(sessionFile)
}

const downloadSession = () => {
    PythonApi.getSessionFile((file:ArrayBuffer) => {
        var blob = new Blob([file]);
        const url = window.URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.setAttribute(
        'download',
        `newSession.session`,
        );

        link.click();
    })
}

const SessionSettings:FC<SessionSettingsProps> = props => {
    const [connected, setConnected] = useState(PythonApi && PythonApi.socket ? PythonApi.socket.connected : false)
    const [tabKey, setTabKey] = useState("settings")

    PythonApi.onConnect(() => {
        setConnected(true)
    })

    if (!connected) {
        return <div style={{...props.style, height:"100%", display:"flex", flexDirection: "column"}}>
            <div style={{ paddingTop: 100 }}>
                <div style={{ fontSize: "2.5em", fontWeight: "bold"}}>We are trying to connect to the sisl API.</div>
            </div>
            <NotConnected style={{flex: 1}} camera={{ position: [0, 0, 5] }}/>
            <div style={{ paddingBottom: 100, fontSize: "1.2em" }}> Meanwhile you can have fun with these two moving cubes. </div>
        </div>
    }

    if ( _.isEmpty(props.session) ) return null

    var component = null
    if (tabKey === "settings") {
        component = <div style={{padding: 20, flex: 1}} className="scrollView">
            <SettingsContainer
                className={`SISL_SETTING_SESSION SISL_SETTING_SESSIONCLASS_${props.session.sessionClass}`}
                settings={props.session.settings}
                params={props.session.params}
                paramGroups={props.session.paramGroups}
                submitSettings={PythonApi.updateSessionSettings}
                undoSettings={PythonApi.undoSessionSettings}/>
        </div>
    } else if (tabKey === "methods") {
        component = <div style={{padding: 20, flex: 1}} className="scrollView">
            <Methods 
                shortcuts={props.session.shortcuts}
                applyMethod={(key:string) => PythonApi.callSessionShortcut(key)}/>
        </div>
    }

    return (
        <div style={{...props.style, height: "100%", display: "flex", flexDirection: "column"}}>
            <Toolbar style={{backgroundColor: "#cccccc", justifyContent: "space-between"}}>
                <div>
                    <Button 
                        color="inherit"
                        style={{backgroundColor: tabKey === "settings" ? "whitesmoke" : undefined, marginRight: 10}} 
                        onClick={() => setTabKey("settings")}>SETTINGS</Button>
                    <Button 
                        color="inherit"
                        style={{backgroundColor: tabKey === "methods" ? "whitesmoke" : undefined}}
                        onClick={() => setTabKey("methods")}>METHODS</Button>
                </div>
                <div>
                    <Button color="inherit" data-tip="Download current session as a file" onClick={downloadSession}>DOWNLOAD</Button>
                    <Button color="inherit" data-tip="Save current session" onClick={() => saveCurrentSession(props.session)}>SAVE</Button>
                    <Button color="inherit" 
                        // data-tip="Load a saved session. You can drop a file here or click to browse your computer"
                    >
                        <FilesInput placeholder="LOAD" onChange={loadSession}/>
                    </Button>
                </div>
            </Toolbar>
            {component}
            <ReactTooltip multiline effect="solid" disable={props.session.settings ? !props.session.settings.showTooltips : false}/>
        </div>
        
    )
}

const mapStateToProps = (state: {[key: string]: any}) => ({
    session: state.session
})

export default connect(mapStateToProps)(SessionSettings);


