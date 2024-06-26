import _ from "lodash"

import type { NodeClass, Node } from '../../interfaces'

import createPlotlyComponent from 'react-plotly.js/factory';
import Plotly from 'plotly.js-dist-min'

const Plot = createPlotlyComponent(Plotly);

interface NodeOutputProps {
    node: Node | undefined,
    node_class?: NodeClass,
    style?: React.CSSProperties
    responsive?: boolean
}

const NodeOutput = (props: NodeOutputProps) => {

    const { node } = props

    const empty_view = <div style={{
        width: "100%", height: "100%", display: "flex", flexDirection: "column",
        padding: 15, backgroundColor: "rgb(238, 242, 246)", borderTopLeftRadius: 5, borderTopRightRadius: 5,
        ...props.style
    }} />
    
    if (!node) return empty_view

    if (node.output_repr?.type === "plotlyfigure") {
        return <div style={{ width: "100%", height: "100%" }}><Plot
            style={{ width: "100%", height: "100%" }}
            data={_.cloneDeep(node.output_repr.data?.data || [])}
            layout={_.cloneDeep({ autosize: true, title: "", ...node.output_repr.data?.template?.layout, ...node.output_repr.data?.layout })}
            frames={node.output_repr.data?.frames}
            config={{ editable: true, responsive: props.responsive !== undefined ? props.responsive : true }}
        /></div>
    } else if (node.output_repr?.type === "html") {
        return <div
            style={{ padding: 10, height: "100%", width: "100%" }}
            dangerouslySetInnerHTML={{ __html: node.output_repr.data || "No output representation" }}
        />
    } else if (node.output_repr?.type === "text" || node.output_repr?.type === undefined) {
        return <div>{node.output_repr?.data || "No output representation"}</div>
    } else {
        return empty_view
    }
}

export default NodeOutput