import type { NodeClass, Node } from '../../interfaces'

interface NodeDocsProps {
    node: Node,
    node_class: NodeClass,
    style?: React.CSSProperties
}

const NodeDocs = (props: NodeDocsProps) => {

    return <div className="no-scrollbar" style={{ height: "100%", width: "100%", overflowY: "scroll", ...props.style }}>
        <pre>{props.node_class?.doc || "No documentation"}</pre>
    </div>
}

export default NodeDocs