

import Dagre from '@dagrejs/dagre';
import { NodePositions } from './interfaces';

const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));

export const dagreLayout = (nodes: any[], edges: any[], options: any) : NodePositions => {
    if (!nodes.length) return {};

    g.setGraph({ rankdir: options.direction });
    
    edges.forEach((edge: any) => g.setEdge(edge.source, edge.target));
    nodes.forEach((node: any) => g.setNode(node.id, node));
    
    Dagre.layout(g);

    return nodes.reduce((d: any, node: any) => {
        const { x, y } = g.node(node.id);
        d[node.id] = { x: x - node.width / 2, y: y - node.height / 2 };
        return d
    }, {})

}