import { useContext, useEffect, useState } from 'react'
import type { Node, NodeClass } from '../../interfaces'

import LogsWindow from '../windows/LogsWindow'
import PythonApiContext from '../../apis/context'
import NodeTerminal from './NodeTerminal'

interface NodePythonScriptProps {
    node: Node,
    node_class?: NodeClass,
    divProps?: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>,
    style?: React.CSSProperties
}

const NodePythonScript = (props: NodePythonScriptProps) => {

    const [script, setScript] = useState<string>("")

    const { node, node_class, ...other_props } = props

    const { pythonApi } = useContext(PythonApiContext)

    useEffect(() => {
        pythonApi.nodeToPythonScript(node.id).then((script) => {
            setScript(script as unknown as string)
        })
    }, [node.id, pythonApi])

    return <LogsWindow logs={script} language="python" {...other_props} />
}

export default NodePythonScript