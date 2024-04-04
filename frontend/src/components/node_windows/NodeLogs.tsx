import { useContext, useEffect, useState } from 'react'
import type { Node, NodeClass } from '../../interfaces'

import LogsWindow from '../windows/LogsWindow'
import PythonApiContext from '../../apis/context'

interface NodeLogsProps {
    node: Node,
    node_class?: NodeClass,
    divProps?: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>,
    style?: React.CSSProperties
}

const NodeLogs = (props: NodeLogsProps) => {

    const [logs, setLogs] = useState<string>("")

    const { node, node_class, ...other_props } = props

    const { pythonApi } = useContext(PythonApiContext)

    useEffect(() => {
        if (node.logs === undefined) {
            pythonApi.getNodeLogs(node.id).then((logs) => {
                setLogs(logs as unknown as string)
            })
        } else {
            setLogs(node.logs)
        }
    }, [node.last_log, node.id, node.logs, pythonApi])

    return <LogsWindow logs={logs} {...other_props} />
}

export default NodeLogs