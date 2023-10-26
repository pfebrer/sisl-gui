import { useSelector } from 'react-redux'

import { RootState } from '../../App'
import LogsWindow from './LogsWindow';

type Props = {}

const SessionLogs = (props: Props) => {
    const session_logs = useSelector((state: RootState) => state.session.logs)
    return <LogsWindow logs={session_logs}/>
}

export default SessionLogs