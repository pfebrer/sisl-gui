import ReactFlow, { 
    Controls,
    ControlButton,
    Background, 
    Node as ReactFlowNode,
    useReactFlow,
    ReactFlowProvider,
    XYPosition,
    Viewport
} from 'reactflow';
import 'reactflow/dist/style.css';

import { useCallback, useContext, useMemo, useState, useRef, useEffect} from 'react';

import { Node } from '../../interfaces';
import PythonApiContext from '../../apis/context';
import { AccountTree } from '@mui/icons-material';
import { FlowNode, FlowConstantNode,  } from '../flow/Nodes';
import { FlowsContext, NodesContext, NodeClassesRegistryContext } from '../../context/session_context';
import { NodeDimensions, NodePositions } from '../flow/interfaces';
import { NewNodesSideBar, TopControlsBar } from '../flow/ControlBars';
import { dagreLayout } from '../flow/layout_utils';
import { Paper } from '@mui/material';

interface FlowProps {
    defaultViewport?: Viewport,
    nodes: {[key: number]: {node: Node, name: string}},
    flow_nodes: number[],
    nodePositions: NodePositions,
    nodeDimensions: NodeDimensions,
    nodeExpanded: {[key: string]: boolean},
    nodeOutputVisible: {[key: string]: boolean},
    selectedNodes?: number[],
    onNodeClick?: (node_id: number) => void,
    onNodeSelection?: (changes: {[key: string]: boolean}) => void,
    onNodeExpanded?: (changes: {[key: string]: boolean}) => void,
    onNodeOutputToggle?: (changes: {[key: string]: boolean}) => void,
    onNodeRemove?: (node_ids: number[]) => void,
    onOutputDrop?: (node_id: number, position: XYPosition, e?: MouseEvent | TouchEvent) => void,
    onInputDrop?: (node_id: number, input_key: string, position: XYPosition, e?: MouseEvent | TouchEvent) => void,
    onChangeNodePosition?: (changes: NodePositions, relayout?: boolean) => void,
    onEndNodePosition?: (dropped: number[]) => void,
    onChangeNodeDimensions?: (changes: NodeDimensions) => void,
    onEndNodeDimensions?: (changed: number[]) => void,
    onMoveEnd?: (viewport: Viewport) => void,
}

const Flow = (props: FlowProps) => {

    const { screenToFlowPosition } = useReactFlow();

    const {pythonApi} = useContext(PythonApiContext)
    const connectingInput = useRef<{node_id: number | null, input_name: string | null}>({node_id: null, input_name: null});

    const { node_classes } = useContext(NodeClassesRegistryContext)
    const nodes = props.nodes

    const {
        flow_nodes,
        selectedNodes,
        nodeDimensions,
        nodePositions,
        nodeExpanded,
        nodeOutputVisible,
        onEndNodePosition, 
        onChangeNodePosition, 
        onChangeNodeDimensions, 
        onEndNodeDimensions,
        onNodeRemove, 
        onNodeSelection, 
        onNodeExpanded,
        onNodeOutputToggle
    } = props

    const initialflowNodes: ReactFlowNode[] = useMemo(() => {

        return flow_nodes.map(node_id => {

            // if (!shouldShowNode(node, node_class)) return
            if (!nodes[node_id]) return null

            const {node, name} = nodes[node_id]
            const node_class = node_classes[node.class]

            if (!node_class) return null

            const expanded = nodeExpanded[node_id] || false
            const outputVisible = nodeOutputVisible[node_id] || false

            return {
                id: String(node_id),
                type: {"ConstantNode": "constant"}[node_class.name] || "custom" as string,
                position: nodePositions[node_id] || {x: 3, y: 3},
                width: nodeDimensions[node_id]?.width, //This is just so that reactflow doesn't hide the node
                height: nodeDimensions[node_id]?.height, //nodeDimensions[node_id]?.height || 20, //This is just so that reactflow doesn't hide the node
                style: nodeDimensions[node_id] || {},
                selected: (selectedNodes || []).includes(node_id),
                hidden: false,
                data: { 
                    name: name, 
                    node: node, 
                    node_class: node_class,
                    expanded: expanded,
                    outputVisible: outputVisible,
                    onExpand: () => onNodeExpanded && onNodeExpanded({[node_id]: !expanded}),
                    onOutputToggle: () => onNodeOutputToggle && onNodeOutputToggle({[node_id]: !outputVisible}),
                },
            }

        }).filter((node) => node !== null) as ReactFlowNode[]

    }, [flow_nodes, nodes, node_classes, onNodeExpanded, nodePositions, nodeDimensions, selectedNodes, nodeExpanded, nodeOutputVisible, onNodeOutputToggle])

    const initialflowEdges = useMemo(() => {

        const edges: any [] = []

        const styles = (node_input_id: number) => {

            if (!nodes[node_input_id]) return {}

            const node = nodes[node_input_id].node

            if (node_classes[node.class] && node_classes[node.class].name === "ConstantNode") return {stroke: 'purple', strokeWidth: 2}
            if (node.errored) return {stroke: '#FF0072', strokeWidth: 2}
            if (node.outdated) return {stroke: '#FFD300', strokeWidth: 2}
            else return {stroke: 'green', strokeWidth: 2}

        }
            
        flow_nodes.forEach(node_id => {

            if (!nodes[node_id]) return

            const {node} = nodes[node_id]
            const node_class = node_classes[node.class]

            Object.keys(node.inputs_mode).forEach((input_name, i) => {
                if (node.inputs_mode[input_name] === "NODE")
                    if(node_class.parameters[input_name].kind === "VAR_POSITIONAL") { 
                        node.inputs[input_name].forEach((input_node_id: number) => {
                            if (!flow_nodes.includes(input_node_id)) return 
                            edges.push({
                                id: `${input_node_id}$$${node_id}$$${input_name}`,
                                source: String(input_node_id),
                                target: String(node_id),
                                targetHandle: input_name,
                                style: styles(input_node_id)
                            })
                        })
                    } else {
                        if (!flow_nodes.includes(node.inputs[input_name])) return
                        edges.push({
                            id: `${node.inputs[input_name]}$$${node_id}$$${input_name}`,
                            source: String(node.inputs[input_name]),
                            target: String(node_id),
                            targetHandle: input_name,
                            style: styles(node.inputs[input_name])
                        })
                    }
            })
        })

        return edges

    }, [flow_nodes, nodes, node_classes])

    const onNodesChange = useCallback(
        (changes: any) => {
            if (changes[0].type === "position") {

                const dragged_positions = changes.reduce((acc: {[key: string]: XYPosition}, change: any) => {
                    if (change.type === "position" && change.position && change.dragging) acc[change.id] = change.position
                    return acc
                }, {})

                if (Object.keys(dragged_positions).length > 0) onChangeNodePosition && onChangeNodePosition(dragged_positions)

                const dropped_positions = changes.reduce((acc: number[], change: any) => {
                    if (change.type === "position" && change.dragging === false) acc.push(Number(change.id))
                    return acc
                }, [])

                if (dropped_positions.length > 0) onEndNodePosition && onEndNodePosition(dropped_positions)

            } else if (changes[0].type === "dimensions") {

                const all_dimensions = changes.reduce((acc: {[key: string]: {width: number, height: number}}, change: any) => {
                    if (change.type === "dimensions" && change.resizing !== false) acc[change.id] = change.dimensions
                    return acc
                }, {})

                if (Object.keys(all_dimensions).length > 0) onChangeNodeDimensions && onChangeNodeDimensions(all_dimensions)

                const finished_resizing = changes.reduce((acc: number[], change: any) => {
                    if (change.type === "dimensions" && change.resizing === false) acc.push(Number(change.id))
                    return acc
                }, [])

                if (finished_resizing.length > 0) onEndNodeDimensions && onEndNodeDimensions(finished_resizing)
            } else if (changes[0].type === "select") {

                const selected = changes.reduce((acc: {[key: string]: boolean}, change: any) => {
                    if (change.type === "select") acc[change.id] = change.selected
                    return acc
                }, {})

                onNodeSelection && onNodeSelection(selected)
            } else if (changes[0].type === "remove") {
                const toRemove = changes.filter((change: any) => change.type === "remove").map((change: any) => Number(change.id))
                onNodeRemove && onNodeRemove(toRemove)
            }
        },
        [onEndNodePosition, onChangeNodePosition, onChangeNodeDimensions, onNodeSelection, onNodeRemove, onEndNodeDimensions],
    );

    const onEdgesChange = useCallback(
        (changes: any) => {
            if (changes[0].type === "remove") {
                const [source_id, node_id, input_name] = changes[0].id.split("$$")
                const node = nodes[Number(node_id)].node
                const param = node_classes[node.class].parameters[input_name]

                if(param.kind === "VAR_POSITIONAL" && node.inputs[param.name].length > 1) {
                    const newVal = node.inputs[param.name].filter((id: number) => id !== Number(source_id))
                    pythonApi.updateNodeInputs(Number(node_id), {[input_name]: newVal}, {[input_name]: "NODE"})
                } else {
                    pythonApi.resetNodeInputs(Number(node_id), [input_name])
                }
                
            }

        }, [node_classes, nodes, pythonApi]
    );
    const onConnect = useCallback((params: any) => {

        const { source, target, targetHandle } = params;

        const node = nodes[Number(target)].node
        const param = node_classes[node.class].parameters[targetHandle]

        var newVal;

        if (! param){
            newVal = Number(source)
            return pythonApi.updateNodeInputs(Number(target), {obj: newVal}, {obj: "NODE"})
        } else if(param.kind === "VAR_POSITIONAL") {
            if(node.inputs[param.name] && node.inputs_mode[param.name] === "NODE") {
                newVal = [...node.inputs[param.name], Number(source)]
            } else {
                newVal = [Number(source)]
            }
        } else {
            newVal = Number(source)
        }

        pythonApi.updateNodeInputs(Number(target), {[targetHandle]: newVal}, {[targetHandle]: "NODE"})

    }, [nodes, node_classes, pythonApi]);

    const onConnectStart = useCallback((e: any, params: any) => {
        connectingInput.current = {node_id: Number(params.nodeId), input_name: params.handleId}
    }, []);

    const onInputDrop = props.onInputDrop
    const onOutputDrop = props.onOutputDrop

    const onConnectEnd = useCallback((e: MouseEvent | TouchEvent) => {

        const position = screenToFlowPosition(
            { x: (e as MouseEvent).clientX || 3, y: (e as MouseEvent).clientY || 3 }
        )

        const connectedInput = {...connectingInput.current}
        if (connectedInput.node_id === null || connectedInput.input_name === null) return
        connectingInput.current = {node_id: null, input_name: null}

        const targetIsPane = e.target && e.target instanceof HTMLElement && e.target.classList.contains("react-flow__pane")

        if (targetIsPane) {
            if (connectedInput.input_name ===  "output") {
                onOutputDrop && onOutputDrop(connectedInput.node_id, position)
            } else {
                onInputDrop && onInputDrop(connectedInput.node_id, connectedInput.input_name, position)
            }
        }
        
    }, [screenToFlowPosition, onOutputDrop, onInputDrop]);

    const nodeTypes = useMemo(() => ({ custom: FlowNode, constant: FlowConstantNode, }), []);

    const handleLayoutClick = () => {
        props.onChangeNodePosition && props.onChangeNodePosition(dagreLayout(initialflowNodes, initialflowEdges, {direction: "LR"}), true)
    }

    return (
        <div style={{ flex: 1 }}>
            <ReactFlow
                defaultViewport={props.defaultViewport}
                nodes={initialflowNodes}
                edges={initialflowEdges}
                onNodesChange={onNodesChange} 
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onConnectEnd={onConnectEnd}
                onConnectStart={onConnectStart}
                nodeTypes={nodeTypes}
                onMoveEnd={(_, data) => props.onMoveEnd && props.onMoveEnd(data)}
                >
                    <Background />
                    <Controls>
                    <ControlButton onClick={handleLayoutClick} title='Layout tree'>
                        <AccountTree/>
                    </ControlButton>
                    </Controls>
            </ReactFlow>
        </div>
    );
}

interface FlowState {
    visibleNodes: number[],
    nodePositions: {[key: string]: XYPosition},
    nodeDimensions: {[key: string]: {width: number, height: number}},
    nodeExpanded: {[key: string]: boolean},
    nodeOutputVisible: {[key: string]: boolean},
    fixedPositions: {[key: string]: XYPosition},
    fixedDimensions: {[key: string]: {width: number, height: number}},
}

const FlowWindow = () => {
    const [selectedNodes, setSelectedNodes] = useState<number[]>([])
    const [outputNodeId, setOutputNodeId] = useState<number | null>(null)
    const [newNodePosition, setNewNodePosition] = useState<XYPosition | undefined>(undefined)

    const {pythonApi} = useContext(PythonApiContext)

    // Top toolbar
    const [showConstants, setShowConstants] = useState(true)

    // React flow control
    const [flowState, setFlowState] = useState<FlowState>({
        visibleNodes: [],
        nodePositions: {},
        nodeDimensions: {},
        nodeExpanded: {},
        nodeOutputVisible: {},
        fixedPositions: {},
        fixedDimensions: {},
    })
    const [viewport, setViewport] = useState<Viewport | undefined>(undefined)

    const { visibleNodes, nodePositions, nodeDimensions, nodeExpanded, nodeOutputVisible, fixedPositions, fixedDimensions } = flowState

    const setVisibleNodes = (func: (nodes: number[]) => number[]) => setFlowState((state) => ({...state, visibleNodes: func(state.visibleNodes)}))
    const setNodePositions = (func: (positions: NodePositions) => NodePositions) => setFlowState((state) => ({...state, nodePositions: func(state.nodePositions)}))
    const setNodeDimensions = (func: (dimensions: NodeDimensions) => NodeDimensions) => setFlowState((state) => ({...state, nodeDimensions: func(state.nodeDimensions)}))
    const setNodeExpanded = (func: (expanded: {[key: string]: boolean}) => {[key: string]: boolean}) => setFlowState((state) => ({...state, nodeExpanded: func(state.nodeExpanded)}))
    const setNodeOutputVisible = (func: (output_visible: {[key: string]: boolean}) => {[key: string]: boolean}) => setFlowState((state) => ({...state, nodeOutputVisible: func(state.nodeOutputVisible)}))
    const setFixedPositions = (positions: NodePositions) => setFlowState((state) => ({...state, fixedPositions: positions}))
    const setFixedDimensions = (dimensions: NodeDimensions) => setFlowState((state) => ({...state, fixedDimensions: dimensions}))

    const { node_classes } = useContext(NodeClassesRegistryContext)
    const nodes = useContext(NodesContext)
    const { flows, setFlows, flowsFromServer } = useContext(FlowsContext)

    const [synced, setSynced] = useState(false)
    const [initialized, setInitialized] = useState(false)

    // Function to set unknown heights for some nodes. This is needed
    // when we expand/collapse the node, so that we tell react-flow
    // that the height must be recalculated.
    const setUnknownHeights = useCallback((node_ids?: string[]) => {

        setNodeDimensions((nds) => {

            node_ids = node_ids || Object.keys(nds)

            const unknown_heights = node_ids.reduce((acc: any, key) => {
                if (nds[key] && nds[key].height) acc[key] = {height: undefined, width: nds[key].width}
                return acc
            }, {})
            
            return {...nds, ...unknown_heights}
        })
    }, [])


    // --------------------------------------------------
    //    FUNCTIONS TO SYNC THE STATE WITH THE SERVER
    // --------------------------------------------------
    const syncFromServer = useCallback(() => {
        if (initialized && !flowsFromServer) return
        if (!flows) return

        if (nodes && flows["0"]) {

            const dimensions = flows["0"].dimensions || {}
            setFlowState({
                visibleNodes: flows["0"].nodes || [],
                nodePositions: flows["0"].positions || {},
                nodeDimensions: flows["0"].dimensions || {},
                nodeExpanded: flows["0"].expanded || {},
                nodeOutputVisible: flows["0"].output_visible || {},
                fixedPositions: flows["0"].positions || {},
                fixedDimensions: Object.keys(dimensions).reduce((acc: {[key: string]: {width: number, height: number}}, key: string) => {
                    acc[key] = {width: dimensions[key].width, height: undefined as unknown as number}
                    return acc
                }, {}),
            })
            setViewport(flows["0"].viewport || {x: 0, y: 0, zoom: 1})
        }
        
        setInitialized(true)
        setSynced(true)

    }, [flows, flowsFromServer, nodes, initialized])

    const syncToServer = useCallback(() => {
        setFlows(
            {"0": {nodes: visibleNodes, positions: fixedPositions, dimensions: fixedDimensions, expanded: nodeExpanded, output_visible: nodeOutputVisible, viewport: viewport}}
        )
    }, [setFlows, visibleNodes, fixedPositions, fixedDimensions, nodeExpanded, nodeOutputVisible, viewport])

    useEffect(() => {
        syncFromServer()
    }, [syncFromServer])

    useEffect(() => {
        if (initialized && !synced) syncToServer()
    }, [syncToServer, synced, initialized])

    // Nodes that will actually show in the flow pane
    const flow_nodes = useMemo(() => {
        if (showConstants) return visibleNodes
        return visibleNodes.filter((node_id) => nodes[node_id] && node_classes[nodes[node_id].node.class].name !== "ConstantNode")
    }, [visibleNodes, showConstants, nodes, node_classes])

    
    // ----------------------------------------------
    //      HANDLERS FOR THE SIDE CONTROL BAR
    // ----------------------------------------------

    const initConnectedNode = useCallback((node_class_id: number, nodeToConnect: number, connectInto: string) => {

        const node_class = node_classes[node_class_id]
        if (!node_class) return
        const parameter = node_class.parameters[connectInto]
        if (!parameter) return

        const inputValue = parameter.kind === "VAR_POSITIONAL" ? [nodeToConnect] : nodeToConnect

        pythonApi.initNode(node_class_id, {[connectInto]: inputValue}, {[connectInto]: "NODE"}).then((new_node) => {

            setOutputNodeId(null)
            setFlowState((state) => ({
                ...state,
                visibleNodes: [...state.visibleNodes, (new_node as unknown as Node).id],
                nodePositions: {...state.nodePositions, [(new_node as unknown as Node).id]: newNodePosition || {x: 3, y: 3}},
                fixedPositions: {...state.fixedPositions, [(new_node as unknown as Node).id]: newNodePosition || {x: 3, y: 3}},
            }))
            setSynced(false)
        })
    }, [newNodePosition, pythonApi, node_classes])

    const handleExistingNodeClick = useCallback((node_id: number) => {
        setVisibleNodes((nodes) => [...nodes, node_id])
        setSynced(false)
    }, [])

    // ----------------------------------------------
    //        HANDLERS FOR THE TOP CONTROL BAR
    // ----------------------------------------------

    const handleHideSelected = useCallback(() => {
        setVisibleNodes((nds) => nds.filter((id) => !selectedNodes.includes(id)))
        setSelectedNodes([])
        setSynced(false)
    }, [selectedNodes])

    const handleHideNodes = useCallback((nodes: number[]) => {
        setVisibleNodes((nds) => nds.filter((id) => !nodes.includes(id)))
        setSynced(false)
    }, [])

    const handleShowNodes = useCallback((nodes: number[]) => {
        setVisibleNodes((nds) => [...nds, ...nodes.filter((id) => !nds.includes(id))])
        setSynced(false)
    }, [])

    // ----------------------------------------------
    //        HANDLERS FOR THE FLOW PANE
    // ----------------------------------------------

    const handleOutputDrop = useCallback((node_id: number, position: XYPosition, e?: MouseEvent | TouchEvent) => {
        setOutputNodeId(node_id)
        setNewNodePosition(position)
        setSynced(false)
    }, [])

    const handleInputDrop = useCallback((node_id: number, input_key: string, position: XYPosition, e?: MouseEvent | TouchEvent) => {
        pythonApi.nodeInputToNode(node_id, input_key).then((new_node) => {
            setFlowState((state) => ({
                ...state,
                visibleNodes: [...state.visibleNodes, (new_node as unknown as Node).id],
                nodePositions: {...state.nodePositions, [(new_node as unknown as Node).id]: position},
                fixedPositions: {...state.fixedPositions, [(new_node as unknown as Node).id]: position},
            }))
            setSynced(false)
        })
    }, [pythonApi])

    const handleNodeRemove = useCallback((node_ids: number[]) => {
        node_ids.forEach((node_id) => {
            if (!nodes[node_id]) return

            pythonApi.removeNode(node_id).then(() => {
                setVisibleNodes((nds) => nds.filter((id) => id !== node_id))
                setSelectedNodes((nds) => nds.filter((id) => id !== node_id))
                setSynced(false)
            })
        })
    }, [nodes, pythonApi])

    const handleNodeSelection = useCallback((changes: {[key: string]: boolean}) => {
        const newlyselectedNodes = Object.keys(changes).filter((key) => changes[key]).map(Number)
        const newlyunSelectedNodes = Object.keys(changes).filter((key) => !changes[key]).map(Number)

        setSelectedNodes((nds) => {
            return [...nds.filter((id) => !newlyunSelectedNodes.includes(id)), ...newlyselectedNodes]
        })
    }, [])

    const handleChangeNodePosition = useCallback((changes: NodePositions, relayout?: boolean) => {


        if (relayout){
            setFlowState((state) => ({...state, nodePositions: {...state.nodePositions, ...changes}, fixedPositions: {...state.nodePositions, ...changes}}))
            setSynced(false)
        } else {
            setNodePositions((nds) => ({...nds, ...changes}))
        }
        
    }, [])

    const handleEndNodePosition = useCallback((dropped: number[]) => {
        setFixedPositions(nodePositions)
        setSynced(false)
    }, [nodePositions])

    const handleEndNodeDimensions = useCallback((changed: number[]) => {
        setFixedDimensions(nodeDimensions)
        setSynced(false)
    }, [nodeDimensions])

    const handleNodeExpanded = useCallback((changes: any) => {
        setNodeExpanded((nds) => ({...nds, ...changes}))
        setSynced(false)
        setUnknownHeights(Object.keys(changes))
        
    }, [setUnknownHeights])

    const handleNodeOutputToggle = useCallback((changes: any) => {
        setNodeOutputVisible((nds) => ({...nds, ...changes}))
        setSynced(false)
        setUnknownHeights(Object.keys(changes))
    }, [setUnknownHeights])

    const handleViewPortChange = useCallback((viewport: Viewport) => {
        setViewport(viewport)
        setSynced(false)
    }, [])

    return <div style={{display: "flex", height: "100%"}}>
        <Paper sx={{margin: 1, boxSizing: "border-box"}} elevation={4}>
        <NewNodesSideBar
            style={{
                backgroundColor: "whitesmoke",
                marginTop: 0,
                minWidth: 300,
                height: "100%"
            }}
            nodes={nodes}
            visibleNodes={visibleNodes}
            outputNodeId={outputNodeId}
            onRemoveNodeId={() => setOutputNodeId(null)}
            newNodePosition={newNodePosition}
            onExistingNodeClick={handleExistingNodeClick}
            onConnectedNodeClick={initConnectedNode}
        />
        </Paper>
        <div style={{flex: 1, height: "100%", display: "flex", flexDirection: "column"}}>
            <TopControlsBar 
                nodes={nodes}
                selectedNodes={selectedNodes}
                showConstants={showConstants}
                onShowConstantsChange={setShowConstants}
                onHideSelected={handleHideSelected}
                onHideNodes={handleHideNodes}
                onShowNodes={handleShowNodes}
            />
            <ReactFlowProvider>
            {initialized && <Flow
                defaultViewport={viewport}
                nodes={nodes}
                flow_nodes={flow_nodes}
                nodePositions={nodePositions}
                onChangeNodePosition={handleChangeNodePosition}
                onEndNodePosition={handleEndNodePosition}
                nodeDimensions={nodeDimensions}
                onChangeNodeDimensions={(changes) => setNodeDimensions((nds) => ({...nds, ...changes}))}
                onEndNodeDimensions={handleEndNodeDimensions}
                nodeOutputVisible={nodeOutputVisible}
                onNodeOutputToggle={handleNodeOutputToggle}
                selectedNodes={selectedNodes}
                onNodeSelection={handleNodeSelection}
                nodeExpanded={nodeExpanded}
                onNodeExpanded={handleNodeExpanded}
                onNodeRemove={handleNodeRemove}
                onOutputDrop={handleOutputDrop}
                onInputDrop={handleInputDrop}
                onMoveEnd={handleViewPortChange}
                />}
            </ReactFlowProvider>
        </div>
        
    </div>
}

export default FlowWindow;