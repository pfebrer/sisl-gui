import { 
    Handle,
    Position,
    NodeProps,
    NodeResizer,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { ReactNode, useContext, useMemo, useState, } from 'react';

import { Node, NodeClass } from '../../interfaces';
import PythonApiContext from '../../apis/context';
import { IconButton, InputBase, MenuItem, TextField, Tooltip, Typography } from '@mui/material';
import NodeOutput from '../node_windows/NodeOutput';
import { DisplaySettings, KeyboardArrowDown, KeyboardArrowRight, PlayArrow, Preview } from '@mui/icons-material';
import NodeField from '../input_fields/node_field';
import { TooltipsLevelContext } from '../../context/tooltips';
import { NavigatorContext } from '../../context/main_nav';
import { NodeClassesRegistryContext } from '../../context/session_context';

const input_beginner_tooltips = {
    "collapsed": <div>
        <div>These are all inputs.</div>
        <div>However, while the node is collapsed, you can not.</div>
        <div>connect them nor drop them.</div>
        <div>Expand the node to play with inputs</div>
    </div>,
    "connected": <div>
        <div>I am connected to another node.</div>
        <div>But you can still connect me or drop me.</div>
    </div>,
    "regular": <div>
        <div>I am an input port.</div>
        <div>You can connect me to outputs of other nodes.</div>
        <div>You can also drop me to create a constant.</div>
    </div>
}

const output_beginner_tooltip = <div>
    <div>I am the output.</div>
    <div>Connect me to as many inputs as you want.</div>
    <div>You can also drop me to create a new node.</div>
</div>

const node_beginner_tooltip = {
    constant: <div>
        <div>I am a constant node.</div>
        <div>You can set my value by: </div>
        <div> - Selecting the type of value.</div>
        <div> - Expanding me.</div>
    </div>,
    normal: <div>
        <div>I am a node.</div>
        <div>I have inputs (on the left) and an output (on the right).</div>
        <div>My color shows my status:</div>
        <div> - Green: I am up to date.</div>
        <div> - Orange: I am outdated.</div>
        <div> - Red: I have an error.</div>
        <div>You can:</div>
        <div> - Select me by clicking me.</div>
        <div> - Expand me to see my inputs.</div>
        <div> - Drag me around (or use arrows to move me).</div>
        <div> - Change my width.</div>
        <div> - Double click on my name to change it.</div>
    </div>
}

const InputHandle = (props: any) => {

    const [selected, setSelected] = useState(false)
    const [tempValue, setTempValue] = useState(null)

    const {pythonApi} = useContext(PythonApiContext)
    const {tooltipsLevel} = useContext(TooltipsLevelContext)
    const { typehints } = useContext(NodeClassesRegistryContext)

    const {
        connected,
        collapsed,
        name
    } = props

    const typehint = props.param.typehint
    const inputType = props.connected ? "node" : typehint && typehints[typehint] ? typehints[typehint].input_type : "json"
    const field_params = props.connected ? "node" : typehint && typehints[typehint] && typehints[typehint].field_params

    var tooltip_title: string | ReactNode = ""
    if (tooltipsLevel === "beginner") {
        if (collapsed) tooltip_title = input_beginner_tooltips["collapsed"]
        else if (connected) tooltip_title =  input_beginner_tooltips["connected"]
        else tooltip_title = input_beginner_tooltips["regular"]
    }

    const collapsed_handle = useMemo(() => <div style={{position: "absolute", left:0, width:500}} >
            <Tooltip title={tooltip_title} arrow placement='left'>
            <Handle 
            type='target' id={name} position={Position.Left} isConnectable={false}
            style={{
                position: "absolute",
                left: -3, top: -4, width: 8, height: 8, backgroundColor: "lightblue", border: "1px solid indigo", borderRadius: 0, transform: "rotate(45deg)"}}/>
            </Tooltip>
        </div>
    , [tooltip_title, name])

    if (collapsed) {
        return collapsed_handle
    }

    var input_handle = <Handle 
            type='target' id={name} position={Position.Left} isConnectable
            style={{left: -5, top: 0, position: "relative", width: 8, height: 8, backgroundColor: props.connected ? "indigo" : "lightblue", border: "1px solid indigo", borderRadius: 0, transform: "rotate(45deg)"}}/>
    
    if (tooltipsLevel === "beginner") input_handle = <Tooltip placement="left" title={tooltip_title} arrow>{input_handle}</Tooltip>

    return <div style={{display: "flex", paddingBottom: 5, paddingTop: 5, alignItems: "center", width:"100%"}}>
        
        <div style={{position: "absolute"}}>
            {input_handle}
        </div>
        <div 
            onClick={() => setSelected(!selected)} 
            onBlur={(e) => pythonApi.updateNodeInputs(props.node.id, {[name]: tempValue === null ? props.value: tempValue})}
            style={{flex: 1}}>
            <Tooltip title={tooltipsLevel !== "none" && props.param.help} placement='left' enterDelay={1000} enterNextDelay={1000}>
                <div>
                <NodeField
                kind={props.param.kind}
                input_key={name} 
                type={ inputType}
                field_params={field_params}
                value={tempValue === null ? props.value: tempValue} 
                onChange={(v) => setTempValue(v)}/>
                </div>
            </Tooltip>
            {/* <TextField defaultValue={props.value} 
                size="small" 
                
            /> */}
            {/* {selected ? <Button onClick={() => pythonApi.nodeInputToNode(props.node.id, name)}>HEY</Button> : null} */}
        </div>
    </div>
}

interface FlowNodeData {
    name: string,
    node: Node,
    node_class: NodeClass,
    expanded?: boolean,
    outputVisible?: boolean,
    dimensions?: {height: number, width: number},
    onNodeClick?: (node_id: number) => void,
    onExpand: () => void,
    onOutputToggle: () => void
}

const FlowConstantNode = (props: NodeProps<FlowNodeData>) => {

    const {pythonApi} = useContext(PythonApiContext)

    const output_type = typeof props.data.node.output

    const [inputMode, setInputMode] = useState(output_type === "string" ? "text" : output_type === "number" ? "json" : "object")

    const [nameEditable, setNameEditable] = useState(false)
    const [temporalName, setTemporalName] = useState<string | undefined>(undefined)

    const { tooltipsLevel } = useContext(TooltipsLevelContext)

    const { data } = props 
    const showInputs = data.expanded

    const inputModes = [
        {value: "text", label: "text"},
        {value: "json", label: "json"},
        {value: "object", label: "object"}
    ]

    const update_value = (value: string) => {
        if (inputMode === "text") {
            pythonApi.updateNodeInputs(data.node.id, {value})
        } else {
            pythonApi.updateNodeInputs(data.node.id, {value: JSON.parse(value)})
        }
    }

    const value = inputMode === "text" ? 
        // <div>{data.node.output_repr?.type === "text" ? data.node.output_repr.data : data.node.output}</div>
        <TextField size="small" defaultValue={data.node.output} onBlur={(e) => update_value(e.target.value)}/>
        :
        inputMode === "json" ?
            <TextField size="small" defaultValue={JSON.stringify(data.node.output)} onBlur={(e) => update_value(e.target.value)}/>
            :
            <div>{data.node.output}</div>

    const tooltip_title = tooltipsLevel === "beginner" && node_beginner_tooltip["constant"]

    return <Tooltip title={tooltip_title} arrow placement='top'><div style={{
        backgroundColor: "lavender", 
        border: props.selected ? `4px purple solid` : `2px purple solid`, 
        borderRadius: 5,
        padding: 10,
        display: "flex", flexDirection: "column", 
        justifyContent: "center",
        overflow: "hidden"
        }}
        onDoubleClick={()=> setNameEditable(!nameEditable)}
        >
        <NodeResizer isVisible={true} minWidth={180} minHeight={200} lineStyle={{borderColor: "transparent"}} handleStyle={{backgroundColor: "transparent"}} />
        <div style={{display: "flex", alignItems: "center"}}>
            {/* <IconButton
            disableRipple
            style={{color: "black", textTransform: "none"}}
                onClick={() => setShowInputs(!showInputs)} >
                    {showInputs ? <KeyboardArrowDown/> : <KeyboardArrowRight />}
            </IconButton> */}
            { data.node.output_repr?.type !== "text" && <IconButton
                disableRipple
                style={{color: "black", textTransform: "none"}}
                    onClick={data.onExpand}>
                        {showInputs ? <KeyboardArrowDown/> : <KeyboardArrowRight />}
            </IconButton>
            }
            <div style={{flex: 1}}>
                <div style={{display: "flex", justifyContent: "space-between",  paddingBottom: 0}}>

                        {nameEditable ? <InputBase
                        className='nodrag'
                        autoFocus
                        sx={{borderBottom: "1px solid black", flex: 1}} 
                        value={temporalName === undefined ? data.name : temporalName} 
                        //inputProps={{ style: {textAlign: 'right'} }}
                        onChange={(e) => setTemporalName(e.target.value)}
                        onBlur={() => {setNameEditable(false); setTemporalName(undefined); pythonApi.renameNode(data.node.id, temporalName || data.name)}}
                    /> : <Typography fontWeight={"bold"}>{data.name}</Typography>}

                    <div className='nodrag' style={{paddingLeft: 20}}>
                        <TextField 
                        variant="standard"
                        InputProps={{
                            disableUnderline: true,
                        }}
                        select 
                        defaultValue={inputMode} 
                        size="small" 
                        onChange={(e) => setInputMode(e.target.value)}>
                        {inputModes.map((option) => (
                            <MenuItem key={`${data.node.id}-${data.name}-${option.value}`} value={option.value}>
                            {option.label}
                            </MenuItem>
                        ))}
                        </TextField>
                    </div>
                </div>
                
                <div className="nodrag" style={{display: "flex", justifyContent: "center"}}>
                    {value}
                </div>
            </div>
        </div>
        
        <div style={{position: "absolute", right:0}}>
            <Tooltip title={tooltipsLevel === "beginner" && output_beginner_tooltip} arrow placement="right">
            <Handle style={{display: "block", position: "absolute", width: 8, height: 8, right:-3, top: -4, transform: "rotate(45deg)", backgroundColor: "lightsalmon", border: "1px solid red", borderRadius: 0}} type="source" id="output" position={Position.Right} isConnectable/>
            </Tooltip>
        </div>

        {showInputs && <div style={{display: "flex", justifyContent: "center", alignItems: "center",  overflowY: "scroll"}}>
            <NodeOutput node={data.node} responsive={false} />
        </div>}
        {/* <TextField size='small'/> */}
        
    </div>
    </Tooltip>
    
}

// const FlowSingleDispatchNode = (props: NodeProps<FlowNodeData>) => {

//     const [dispatch, setDispatch] = useState("<class 'object'>")

//     const [selected, setSelected] = useState(false)
//     const [showInputs, setShowInputs] = useState(false)
//     const [showOutput, setShowOutput] = useState(false)

//     const {pythonApi} = useContext(PythonApiContext)

//     const node_classes = useSelector((state: RootState) => state.session.node_classes)

//     const { data } = props

//     const registry = data.node_class.registry || {}

//     const inputsView = Object.values(data.node_class.parameters).map(
//         (param, i) => <InputHandle i={i} name={param.name} collapsed={!showInputs} node={data.node} connected={Object.keys(props.data.node.inputs_mode).includes(param.name)}/> 
//     )

//     const borderColor = data.node.outdated ? data.node.errored ? "red" : "orange" : "green"
    
//     return <div style={{
//                 border:selected ? `4px ${borderColor} dash` : `2px ${borderColor} solid`, borderRadius: 5, overflow: "hidden", 
//             }}
//             // onClick={() => setSelected(!selected)}
//         > 
//         <div style={{display: "flex", justifyContent: "space-between",  paddingBottom: 0}}>
//             <Typography fontWeight={"bold"}>{data.name}</Typography>
//             <div className='nodrag' style={{paddingLeft: 20}}>
//                 <TextField 
//                 variant="standard"
//                 InputProps={{
//                     disableUnderline: true,
//                 }}
//                 select 
//                 defaultValue={dispatch} 
//                 size="small" 
//                 onChange={(e) => setDispatch(e.target.value)}>
//                 {Object.keys(registry).map((k) => (
//                     <MenuItem key={`${data.node.id}-${data.name}-${k}`} value={k}>
//                     {k}
//                     </MenuItem>
//                 ))}
//                 </TextField>
//             </div>
//         </div>
//         <FlowNode {...props} data={{...data, node_class: node_classes[registry[dispatch]]}}/>
//     </div>
    
// }

const FlowNode = (props: NodeProps<FlowNodeData>) => {
    
    const {pythonApi} = useContext(PythonApiContext)
    const {tooltipsLevel} = useContext(TooltipsLevelContext)

    const {seeNodeInExplorer} = useContext(NavigatorContext)

    const [nameEditable, setNameEditable] = useState(false)
    const [temporalName, setTemporalName] = useState<string | undefined>(undefined)

    const { data } = props
    const showInputs = data.expanded
    const showOutput = data.outputVisible

    const borderColor = data.node.outdated ? data.node.errored ? "red" : "orange" : "green"
    const selected = props.selected

    const inputsView = Object.values(data.node_class.parameters).map(
        (param, i) => <InputHandle i={i} param={param} value={data.node.inputs[param.name]} name={param.name} collapsed={!showInputs} node={data.node} connected={Object.keys(props.data.node.inputs_mode).includes(param.name)}/> 
    )

    const output_tooltip_title = tooltipsLevel === "beginner" && output_beginner_tooltip

    const node_tooltip_title = tooltipsLevel === "beginner" && node_beginner_tooltip["normal"]

    const node = <div style={{
            border:selected ? `4px ${borderColor} solid` : `2px ${borderColor} solid`, borderRadius: 5, overflow: "hidden", 
        }}
        onClick={() => data.onNodeClick && data.onNodeClick(data.node.id)}
        onDoubleClick={() => setNameEditable(!nameEditable)}
        > 
        <NodeResizer isVisible={true} minWidth={180} minHeight={200} lineStyle={{borderColor: "transparent"}} handleStyle={{backgroundColor: "transparent"}} />
        <div
            style={{ display: "flex",  backgroundColor: "#eee", alignItems: "center", borderBottom: "1px solid black", paddingRight: 20}}>
            <div style={{position: "absolute", right:0}}>
                <Tooltip title={output_tooltip_title} arrow placement="right">
                <Handle style={{display: "block", position: "absolute", width: 8, height: 8, right:-3, top: -4, transform: "rotate(45deg)", backgroundColor: "lightsalmon", border: "1px solid red", borderRadius: 0}} type="source" id="output" position={Position.Right} isConnectable/>
                </Tooltip>
            </div>
            <IconButton
            disableRipple
            style={{color: "black", textTransform: "none"}}
                onClick={data.onExpand} >
                    {showInputs ? <KeyboardArrowDown/> : <KeyboardArrowRight />}
            </IconButton>
            
            {nameEditable ? <InputBase
                className='nodrag'
                autoFocus
                sx={{borderBottom: "1px solid black", flex: 1}} 
                value={temporalName === undefined ? data.name : temporalName} 
                //inputProps={{ style: {textAlign: 'right'} }}
                onChange={(e) => setTemporalName(e.target.value)}
                onBlur={() => {setNameEditable(false); setTemporalName(undefined); pythonApi.renameNode(data.node.id, temporalName || data.name)}}
            /> : <Typography>{data.name}</Typography>}

            {showInputs ? null : inputsView}
            
        </div>
        <div>

            <div style={{background: "white"}} onClick={(e) => e.stopPropagation()}>
                {showInputs ? inputsView : null}
            </div>
            
            <div style={{backgroundColor: "#ccc", display: "flex", justifyContent: "center", paddingLeft: 10, paddingRight: 10}}>
                <Tooltip title={tooltipsLevel !== "none" && "Show in explorer"} arrow>
                <IconButton 
                    style={{color: "black"}}
                    onClick={() => seeNodeInExplorer(data.node.id)}
                    size="small" aria-label="full-node-dash" color="primary">
                    <DisplaySettings />
                </IconButton>
                </Tooltip>
                <Tooltip title={tooltipsLevel !== "none" && "Show output"} arrow>
                <IconButton 
                    style={{color: "black"}}
                    onClick={(e) => {e.stopPropagation(); data.onOutputToggle()}}
                    size="small" color="primary">
                    <Preview/>
                </IconButton>
                </Tooltip>
                <Tooltip title={tooltipsLevel !== "none" && "Compute node"} arrow>
                <IconButton 
                    style={{color: "black"}}
                    onClick={(e) => {e.stopPropagation(); pythonApi.computeNode(data.node.id)}}
                    size="small" color="primary">
                    <PlayArrow/>
                </IconButton>
                </Tooltip>
                
            </div>
            {showOutput && <div style={{display: "flex", justifyContent: "center", alignItems: "center", padding: 20, background: "white"}} className="nodrag nozoom">
            <NodeOutput node={data.node} responsive={false} />
            </div>}
            
        </div>
        </div>
    
    if (tooltipsLevel === "beginner") return <Tooltip title={node_tooltip_title} arrow placement='top'>{node}</Tooltip>
    else return node
}

export {FlowNode, FlowConstantNode}