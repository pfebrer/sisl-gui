import { FC, useState, useContext} from 'react'

import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';

import PythonApiContext, { PythonApiStatusContext } from '../../apis/context';
import { PyodidePythonApi, PythonApi, SocketPythonApi } from '../../apis/PythonApi';

interface BackendSettingsProps {}

interface StatusCodes {
    [key: number]: string
}

const BackendSettings: FC<BackendSettingsProps> = (props) => {

    const {pythonApi, setPythonApi} = useContext(PythonApiContext)
    const backendStatus = useContext(PythonApiStatusContext)

    const [apiSettings, setApiSettings] = useState({});

    const [selectedApiType, setSelectedApiType] = useState(pythonApi.type)

    const settings: any = {...pythonApi.apiSettings, ...apiSettings}

    const status_codes: StatusCodes = pythonApi.status_codes

    var form;

    if (pythonApi.type === "socket") {
        form = <div style={{paddingBottom: 20, paddingTop: 20}}>
            <TextField
            sx={{marginTop: 2}}
            label={"Server address"} 
            value={settings.apiAddress} 
            onChange={(e) => setApiSettings({apiAddress: e.target.value})}/>
        </div>
    }

    return (
        <div style={{padding: 20}}>
            <h1>Backend status</h1>
            <div>
                Current backend type: {pythonApi.type}
            </div>
            <div>
                Backend status: {status_codes[backendStatus]}
            </div>
            <div style={{paddingTop: 20, paddingBottom: 20}}>
            <div style={{display: "flex", alignItems: "center"}}>
            <TextField
                style={{width: 200, marginRight: 20}}
                id="select-api-type"
                select
                label="Backend type"
                value={selectedApiType}
                onChange={(e) => setSelectedApiType(e.target.value)}
                >
                {["socket", "pyodide"].map((option) => (
                    <MenuItem key={option} value={option}>
                    {option}
                    </MenuItem>
                ))}
                </TextField>
                <Button onClick={(e) => {
                    const api_class = {
                        "socket": SocketPythonApi,
                        "pyodide": PyodidePythonApi,
                        "none": PythonApi
                    }[selectedApiType]

                    if(api_class) setPythonApi(new api_class())
                }}>
                    Initialize new backend
                </Button>
            </div>
            <h1>Backend settings</h1>
            {form}
            <div>
            <Button onClick={() => pythonApi.setApiSettings(apiSettings)}>SET NEW SETTINGS</Button>
            </div>

            </div>
        </div>
    );
}

export default BackendSettings;