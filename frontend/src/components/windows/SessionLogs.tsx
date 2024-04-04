import LogsWindow from './LogsWindow';
import { useContext, useEffect, useState } from 'react';
import PythonApiContext from '../../apis/context';

const SessionLogs = () => {
    const [session_logs, setSessionLogs] = useState<string>("")
    
    const {pythonApi} = useContext(PythonApiContext)

    useEffect(() => {
        pythonApi.getSessionLogs().then((logs: any) => logs && setSessionLogs(logs))
    }, [pythonApi])

    return <LogsWindow logs={session_logs}/>
}

export default SessionLogs