import type { Node, NodeClass } from '../../interfaces'

import LogsWindow from '../windows/LogsWindow'

interface NodeLogsProps {
    node: Node,
    node_class?: NodeClass,
    divProps?: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>,
    style?: React.CSSProperties
}

const NodeLogs = (props: NodeLogsProps) => {

    const { node, node_class, ...other_props } = props

    return <LogsWindow logs={node.logs} {...other_props} />
}

export default NodeLogs