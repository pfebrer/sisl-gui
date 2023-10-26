import { useContext, useState} from "react";

import Button from "@mui/material/Button"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"

import NotConnected from "../loading/NotConnected"
import PythonApiContext, { PythonApiStatusContext } from '../../apis/context';
import { PyodidePythonApi, PythonApi, SocketPythonApi } from '../../apis/PythonApi';
import { TextField, Typography } from "@mui/material";

interface NoBackendWindowProps {
    style?: React.CSSProperties,
    goToBackendSettings: () => void
}

interface StatusCodes {
    [key: number]: string
}

const NoBackendWindow = (props: NoBackendWindowProps) => {

    const {pythonApi, setPythonApi} = useContext(PythonApiContext)
    const backendStatus = useContext(PythonApiStatusContext)

    const [serverAddressValue, setServerAddressValue] = useState(SocketPythonApi.defaultApiSettings.apiAddress)

    const setApi = (type: string, settings: Object) => {
        const api_class = {
            "socket": SocketPythonApi,
            "pyodide": PyodidePythonApi,
            "none": PythonApi
        }[type]

        if(api_class) setPythonApi(new api_class(settings))
    }

    const status_codes: StatusCodes = pythonApi.status_codes

    if (pythonApi.type === "none") {
        return <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", ...props.style}}>
            <div style={{ textAlign: "center"}}>
                <Typography variant="h2" component="h2">
                    Welcome to the sisl graphical interface!
                </Typography>
                <Typography variant="h4" component="h4">
                    Pick a backend to start.
                </Typography>
            </div>
            <div style={{padding: 30, paddingTop: 50, display: "flex"}}>
                <div style={{flex: 1, display: "flex", justifyContent: "center", alignItems: "flex-start"}}>
                    <Card variant="outlined" style={{width: "70%"}}>
                        <CardContent style={{ display: "flex", flexDirection: "column",  alignItems: "center"}}>
                        <Button size="large" variant="outlined" onClick={() => setApi("pyodide", {})}> Initialize pyodide</Button>
                        <div style={{padding: 20, textAlign: "center"}}>
                            <Typography variant="h6">
                                Just have fun!
                            </Typography>
                            <Typography>
                                Pyodide runs python in the browser. In this way, you don't have to worry about setting up your python environment.
                            </Typography>
                        </div>
                        <Typography>
                            It takes some time to load pyodide (around 30s).
                        </Typography>
                        </CardContent>
                        
                    </Card>
                    
                </div>
                <div style={{flex: 1, display: "flex", justifyContent: "center", alignItems: "center"}}>
                <Card variant="outlined" style={{width: "70%"}}>
                    <CardContent style={{ display: "flex", flexDirection: "column",  alignItems: "center"}}>
                    <Button size="large" variant="outlined" onClick={() => setApi("socket", {apiAddress: serverAddressValue || undefined})}> Connect to a server</Button>
                    <div style={{padding: 20, textAlign: "center"}}>
                        <Typography variant="h6">
                            Be faster.
                        </Typography>
                        <Typography>
                            Connect the GUI to a server.
                        </Typography>
                    </div>
                    <TextField label="Server address" variant="outlined" size="small" fullWidth value={serverAddressValue} onChange={(e) => setServerAddressValue(e.target.value)}/>
                    <div style={{textAlign: "center", paddingTop: 20}}>
                        <Typography>
                            If you want to launch the server yourself you need a python environment.
                        </Typography>
                        <Typography>
                            Install sisl_gui with: <code>pip install sisl_gui</code>
                        </Typography>
                        <Typography>
                            And launch the server with: <code>sisl-gui --no-frontend</code>
                        </Typography>
                    </div>
                    </CardContent>
                    
                </Card>
                   
                </div>
            </div>
        </div>
    } else {
        return <div style={{ ...props.style, height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ textAlign: "center"}}>
                <Typography variant="h2" component="h2">
                    The backend is loading...
                </Typography>
                <Typography variant="h4" component="h4">
                    Meanwhile you can have fun with these two moving cubes.
                </Typography>
            </div>
            <div style={{height: "30%"}}>
                <NotConnected camera={{ position: [0, 0, 5] }} />
            </div>
            <Typography>
                Current backend type: {pythonApi.type}
            </Typography>
            <Typography>
                Backend status: {status_codes[backendStatus]}
            </Typography>
            <Button variant="outlined" onClick={props.goToBackendSettings} style={{margin: 50}}> Tune backend </Button>
        </div>
    }
}

export default NoBackendWindow
