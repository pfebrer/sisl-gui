import { 
    XYPosition,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { useContext, useMemo, useState, useEffect} from 'react';

import { Node, Nodes } from '../../interfaces';
import PythonApiContext from '../../apis/context';
import { Accordion, AccordionDetails, AccordionSummary, Button, List, ListItemButton, ListItemText, ToggleButton, ToggleButtonGroup, Tooltip, Typography } from '@mui/material';
import { ArrowBack, ArrowForward, ExpandMore, SwapHoriz, Visibility, VisibilityOff } from '@mui/icons-material';
import { NodeClassesRegistryContext, NodesContext } from '../../context/session_context';
import { TooltipsLevelContext } from '../../context/tooltips';


interface TopControlsBarProps {
    nodes: Nodes,
    selectedNodes: number[],
    showConstants: boolean,
    onShowConstantsChange: (show: boolean) => void,
    onHideSelected: () => void,
    onHideNodes: (nodes: number[]) => void,
    onShowNodes: (nodes: number[]) => void,

    style?: React.CSSProperties,
}

export const TopControlsBar = (props: TopControlsBarProps) => {

    const [nodeConnectionsToggles, setNodeConnectionsToggles] = useState({"backward": false, "connected": false, "forward": false})

    const {pythonApi} = useContext(PythonApiContext)

    const {tooltipsLevel} = useContext(TooltipsLevelContext)

    const { 
        showConstants,
        onShowConstantsChange,
        selectedNodes,
        nodes,
        onHideSelected,
        onHideNodes,
        onShowNodes,
        style
    } = props

    useEffect(() => {
        setNodeConnectionsToggles({"backward": false, "connected": false, "forward": false})
    }, [selectedNodes])

    const handleConnectionToggleChange = (event: any, newValues: string[]) => {

        Object.keys(nodeConnectionsToggles).forEach((key) => {

            const current = nodeConnectionsToggles[key as "backward" | "connected" | "forward"]
            if (newValues.includes(key) !== current) {
                let method = pythonApi.getBackwardNodes
                if (key === "backward") method = pythonApi.getBackwardNodes
                if (key === "connected") method = pythonApi.getConnectedNodes
                if (key === "forward") method = pythonApi.getForwardNodes

                method(selectedNodes, true).then((nodes) => {

                    if (!(nodes as unknown as number[] | undefined)) return 
                    const linked_nodes = nodes as unknown as number[]

                    if (current) {
                        onHideNodes(linked_nodes)
                    } else {
                        onShowNodes(linked_nodes)
                    }
        
                    setNodeConnectionsToggles({...nodeConnectionsToggles, [key]: !current })
                    
                })
            }
        })
    }

    const tooltipTitle = useMemo(() => {
        if(tooltipsLevel !== "beginner") return ""

        if (selectedNodes.length === 0 || !selectedNodes || nodes[selectedNodes[0]] === undefined) {
            return <div style={{textAlign: "center"}}>
                <div>I am the bar that acts on selected nodes.</div>
                <div>Currently there is nothing I can do because you have not selected any node.</div>
                <div>Click on a node to select it or shift + drag to select multiple nodes.</div>
            </div>
        } else if (selectedNodes.length === 1) {
            return <div style={{textAlign: "center"}}>
                <div>I am the bar that acts on selected nodes.</div>
                <div>You currently have one node selected: {nodes[selectedNodes[0]].name} </div>
                <div>Everything that you do here will apply only to this node.</div>
            </div>
        } else {
            return <div style={{textAlign: "center"}}>
                <div>I am the bar that acts on selected nodes.</div>
                <div>You currently have {selectedNodes.length} nodes selected. </div>
                <div>Everything that you do here will apply to all those nodes.</div>
            </div>
        }
    }, [selectedNodes, tooltipsLevel, nodes])

    return <Tooltip title={tooltipTitle} arrow>
    <div style={{display: "flex", alignItems: "center", ...style}}>
        <div style={{background: "#d1e9ff", borderRadius: 10, padding: 10}}>
            <Tooltip title={tooltipsLevel !== "none"  && `${showConstants ? "Hide" : "Show"} constants`} arrow>
            <ToggleButton
                style={{background: showConstants ? "#DCDCFD" :"lavender", color: "purple"}}
                selected={showConstants} size="small" value="show_constants" aria-label="show_constants" onChange={() => onShowConstantsChange(!showConstants)}>
                {showConstants ? <Visibility fontSize='small'/> : <VisibilityOff fontSize='small'/>}
            </ToggleButton>
            </Tooltip>
        </div>
        <div style={{display: "flex", marginLeft: 10, marginRight: 10, height: "100%", flex: 1, background: "#d1e9ff", borderRadius: 10, alignItems: "center"}}>
            <div style={{display: "flex", alignItems: "center", height: "100%"}}>
                <div style={{minWidth: 200, paddingLeft: 10}}>
                {
                    selectedNodes.length === 0 || ! nodes[selectedNodes[0]] ? 
                    <Typography align='center'>(select a node)</Typography>
                    :
                    selectedNodes.length > 1 ? 
                    <Typography align='center'>Selected nodes: <b>{selectedNodes.length}</b></Typography>
                    : 
                    <Typography align='center'>Selected node: <b>{nodes[selectedNodes[0]].name}</b></Typography>
                }
                </div>
                <div style={{marginLeft: 15, marginRight: 15, width: 3, height: "60%", background: "whitesmoke"}}/>
                <ToggleButtonGroup
                    exclusive={false}
                    value={Object.keys(nodeConnectionsToggles).filter((key) => nodeConnectionsToggles[(key as "backward" | "connected" | "forward")])}
                    onChange={handleConnectionToggleChange}
                    aria-label="connected nodes"
                    size="small"
                    disabled={selectedNodes.length === 0}
                    >
                    <Tooltip title={tooltipsLevel !== "none"  && `${nodeConnectionsToggles["backward"] ? "Hide" : "Show"} full tree from inputs`} arrow>
                    <ToggleButton size="small" value="backward" aria-label="backward">
                        <ArrowBack fontSize='small'/>
                    </ToggleButton>
                    </Tooltip>
                    <Tooltip title={tooltipsLevel !== "none"  && `${nodeConnectionsToggles["connected"] ? "Hide" : "Show"} all connected nodes`} arrow>
                    <ToggleButton value="connected" aria-label="connected">
                        <SwapHoriz fontSize='small' />
                    </ToggleButton>
                    </Tooltip>
                    <Tooltip title={tooltipsLevel !== "none"  && `${nodeConnectionsToggles["forward"] ? "Hide" : "Show"} full tree from outputs`} arrow>
                    <ToggleButton value="forward" aria-label="forward">
                        <ArrowForward fontSize='small' />
                    </ToggleButton>
                    </Tooltip>
                    </ToggleButtonGroup>
                    <Tooltip title={tooltipsLevel !== "none"  && `Hide`} arrow>
                    <ToggleButton
                        disabled={selectedNodes.length === 0}
                        style={{margin: 5}}
                        selected={false} size="small" value="hide-selected" aria-label="hide-selected" onChange={onHideSelected}>
                        {showConstants ? <Visibility fontSize='small'/> : <VisibilityOff fontSize='small'/>}
                    </ToggleButton>
                    </Tooltip>
            </div>
        </div>
    </div>
    </Tooltip>
}

interface NewNodeFromOutput {
    label: string,
    node_cls_id: number,
    nodeToConnect: number,
    connectInto: string,
    position?: XYPosition,
}

interface PossibleNodesProps {
    node_id: number | null,
    node_name: string | null,
    onNodeClick?: (node: NewNodeFromOutput) => void,
}

export const PossibleNodes = (props: PossibleNodesProps) => {

    const nodes = useContext(NodesContext)
    const { node_classes, types_registry } = useContext(NodeClassesRegistryContext)

    const [typehintId, setTypehintId] = useState<number | undefined>(undefined)
    // const [link, setLink] = useState<"input" | "output" | undefined>("output")

    const [possibleNodes, setPossibleNodes] = useState<NewNodeFromOutput[]>([])

    const { node_id, node_name } = props

    useEffect(() => {
        if (!node_id || !node_name) return setTypehintId(undefined)

        const node = nodes[node_id]
        if (!node) return setTypehintId(undefined)

        const typehint = node.node.output_class_id || node_classes[node.node.class]?.return_typehint

        if (typehint) setTypehintId(typehint)
    }, [node_id, node_classes, nodes, node_name])

    useEffect(() => {

        if(node_id && typehintId && types_registry[typehintId]){
            const possibleNodesIds = types_registry[typehintId].first_arg

            const valid_classes = Object.keys(node_classes)

            setPossibleNodes(possibleNodesIds.filter((node_cls_id) => valid_classes.includes(String(node_cls_id))).map((node_cls_id: number) => {
                return {
                    label: node_classes[node_cls_id].name, 
                    node_cls_id: node_cls_id, 
                    nodeToConnect: node_id, 
                    connectInto: Object.values(node_classes[node_cls_id].parameters)[0].name,
                    // position: screenToFlowPosition({
                    //     x: (e as MouseEvent).clientX || 3,
                    //     y: (e as MouseEvent).clientY || 3,
                    // })
                }
            }))
        } else {
            setPossibleNodes([])
        }
        

    }, [typehintId, types_registry, node_id, node_classes])

    var modifiers: NewNodeFromOutput[] = []
    var others: NewNodeFromOutput[] = []
    if (typehintId){
        const node_cls_types_registry = types_registry[typehintId]
        modifiers = possibleNodes.filter(node => node_cls_types_registry.modifiers.includes(node.node_cls_id))
        others = possibleNodes.filter(node => !node_cls_types_registry.modifiers.includes(node.node_cls_id))
    } else {
        modifiers = []
        others = possibleNodes
    }
    
    modifiers = modifiers.sort((a, b) => a.label.localeCompare(b.label))
    others = others.sort((a, b) => a.label.localeCompare(b.label))

    // Sort nodes by label
    //const nodesList = possibleNodes.sort((a, b) => a.label.localeCompare(b.label))
    return <div style={{width: 250, flex: 1, display: "flex", flexDirection: "column"}}>
        <Typography variant="h6" align='center'>New connection</Typography>
        <Typography align="center">({node_name || "drop an output edge"})</Typography>
        <div style={{overflowY: "scroll", flex: 1, width: "100%", padding: 10}} className='no-scrollbar'>
        <Accordion>
            <AccordionSummary
                expandIcon={<ExpandMore />}
                sx={{backgroundColor: "lightsalmon"}}
                >
                Modifiers
            </AccordionSummary>
            <AccordionDetails style={{padding: 0}}>
            <List
                style={{padding: 0}}>
                {modifiers.map((node, i) => {
                    return <ListItemButton
                        style={{borderBottom: "1px #ccc solid"}}
                        key={i}
                        selected={false}
                        onClick={() => {props.onNodeClick && props.onNodeClick(node)}}
                    >
                        <ListItemText primary={node.label} />
                    </ListItemButton>
                })}
                
            </List>
            </AccordionDetails>
        </Accordion>
        <Accordion>
            <AccordionSummary
                expandIcon={<ExpandMore />}
                sx={{backgroundColor: "lightblue"}}
                >
                Others
            </AccordionSummary>
            <AccordionDetails>
            <List>
                {others.map((node, i) => {
                    return <ListItemButton
                        style={{borderBottom: "1px #ccc solid"}}
                        key={i}
                        selected={false}
                        onClick={() => {props.onNodeClick && props.onNodeClick(node)}}
                    >
                        <ListItemText primary={node.label} />
                    </ListItemButton>
                })}
                
            </List>
            </AccordionDetails>
        </Accordion>
        </div>
    </div>
}

interface NodesSideBarProps {
    nodes: {[key: number]: {node: Node, name: string}},
    visibleNodes: number[],
    outputNodeId: number | null,
    onRemoveNodeId: () => void,
    newNodePosition: XYPosition | undefined,
    onExistingNodeClick: (node_id: number) => void,
    onConnectedNodeClick: (node_id: number, nodeToConnect: number, connectInto: string) => void,

    style?: React.CSSProperties,
}

export const NewNodesSideBar = (props: NodesSideBarProps) => {

    const { 
        nodes, 
        visibleNodes,
        outputNodeId,
        onRemoveNodeId,
        onExistingNodeClick,
        onConnectedNodeClick,
        style
    } = props

    const { node_classes } = useContext(NodeClassesRegistryContext)

    const existing_constants = Object.keys(nodes).map(Number).filter((node_id) => nodes[node_id] && !visibleNodes.includes(node_id) && node_classes[nodes[node_id].node.class].name === "ConstantNode")
    const existing_nodes = Object.keys(nodes).map(Number).filter((node_id) => nodes[node_id] && !visibleNodes.includes(node_id) && node_classes[nodes[node_id].node.class].name !== "ConstantNode")

    return <div style={{ paddingBottom: 20, ...style}}>
            <div style={{paddingTop: 5, paddingLeft: 5}}>
            {outputNodeId && <Button 
                style={{color: "black"}}
                startIcon={<ArrowBack />}
                onClick={() => onRemoveNodeId()}>BACK TO NODES</Button>}
            </div>
            <div style={{display: "flex", paddingTop: 10}}>
            <div style={{flex: 1, display: outputNodeId ? "none": "flex", flexDirection: "column"}}>
                <Typography variant="h6" align='center'>Existing nodes</Typography>
                <Typography align="center">(click to add to flow)</Typography>
                <div className="no-scrollbar" style={{overflowY: "scroll", width: "100%", flex: 1, padding: 10}}>
                
                <Accordion>
                    <AccordionSummary
                        expandIcon={<ExpandMore />}
                        sx={{backgroundColor: "lavender"}}
                        >
                        Constants
                    </AccordionSummary>
                    <AccordionDetails style={{padding: 0}}>
                    <List>
                    {existing_constants.map((node_id) => {
                        const {name} = nodes[node_id]

                        return <ListItemButton 
                            style={{borderBottom: "1px #ccc solid"}}
                            key={node_id} onClick={() => onExistingNodeClick(node_id)}>
                            <ListItemText primary={name} />
                        </ListItemButton>
                    })}
                    </List>
                    </AccordionDetails>
                </Accordion>
                <Accordion>
                    <AccordionSummary
                        expandIcon={<ExpandMore />}
                        sx={{backgroundColor: "lightblue"}}
                        >
                        Nodes
                    </AccordionSummary>
                    <AccordionDetails style={{padding: 0}}>
                    <List>
                    {existing_nodes.map((node_id) => {
                        const {name} = nodes[node_id]

                        return <ListItemButton 
                            style={{borderBottom: "1px #ccc solid"}}
                            key={node_id} onClick={() => onExistingNodeClick(node_id)}>
                            <ListItemText primary={name} />
                        </ListItemButton>
                    })}
                    </List>
                    </AccordionDetails>
                </Accordion>
                </div>
            </div>
            {outputNodeId && <PossibleNodes
                node_id={outputNodeId}
                node_name={outputNodeId && nodes[outputNodeId] ? nodes[outputNodeId].name : null}
                onNodeClick={(node) => onConnectedNodeClick(node.node_cls_id, node.nodeToConnect, node.connectInto)}/>}
        </div>
    </div>
}