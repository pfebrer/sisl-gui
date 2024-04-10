import {useState, useContext} from 'react'

import Box from '@mui/material/Box';
import ToggleButton from '@mui/material/ToggleButton'

import Button from '@mui/material/Button';

import PythonApiContext from '../../apis/context';

import type { NodeClass, Node } from '../../interfaces'
import { ElectricalServices, Hub } from '@mui/icons-material';

import Field from "../input_fields"
import type { FieldType } from '../input_fields'
import { NodeClassesRegistryContext } from '../../context/session_context';
import { Tooltip, Typography } from '@mui/material';

interface NodeInputsProps {
    node?: Node,
    node_class: NodeClass,
    inputs?: {[key: string]: any},
    onChange?: (changed_inputs: {[key: string]: any}) => void,
    inputContainerStyle?: React.CSSProperties,
    inputsMode?: { [key: string]: string },
    onChangeInputsMode?: (changed_inputs: {[key: string]: string}) => void,
    fieldprops?: { [key: string]: any },
    className?: string,
    style?: React.CSSProperties
}

const NodeInputs = (props: NodeInputsProps) => {

    const propsInputs = { ...props.node?.inputs, ...props.inputs}
    const propsInputsMode = { ...props.node?.inputs_mode, ...props.inputsMode}

    const {pythonApi} = useContext(PythonApiContext)
    const { typehints } = useContext(NodeClassesRegistryContext)

    const [stateInputs, setStateInputs] = useState(propsInputs || {})
    const [stateInputsMode, setStateInputsMode] = useState<{[key: string]: string}>({})
    const [showJsonInput, setShowJsonInput] = useState(false)

    const updateStateInputs = (changed_inputs: {[key: string]: any}) => setStateInputs({...stateInputs, ...changed_inputs})

    const inputs = propsInputs || stateInputs
    const onChange = props.onChange || updateStateInputs

    const inputsMode = propsInputsMode || stateInputsMode
    const onChangeInputsMode = props.onChangeInputsMode || setStateInputsMode

    const handleModeChange = (key: string, mode: string) => {
        
        onChange({ [key]: "" })
        onChangeInputsMode({ ...inputsMode, [key]: mode})
    }

    const node_parameters = props.node_class.parameters
    var input_keys = Object.keys(props.node_class.parameters)

    const getInputType = (key: string): FieldType => { 
        const typehint = node_parameters[key].typehint
        const param_type = typehint ? typehints[typehint].input_type : "json"

        var inputType = inputsMode[key] || param_type

        if (inputType) inputType = inputType.toLowerCase()
        if (!inputType || !["text", "number", "select", "node", "bool", "file", "json"].includes(inputType)) inputType = "json"

        return inputType as FieldType
    }

    const getFieldParams = (key: string) => {
        const typehint = node_parameters[key].typehint
        return typehint && typehints[typehint].field_params
    }

    return (
        <div className={props.className} style={props.style}>
            <Box
                component="form"
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                {input_keys.map((key) => (
                    <div key={key}>
                    <div style={{ paddingTop: 10, paddingBottom: 10, display: "flex", ...props.inputContainerStyle }}>
                        <ToggleButton
                            value="check"
                            size="small"
                            selected={inputsMode[key] === "NODE"}
                            onChange={() => handleModeChange(key, inputsMode[key] === "NODE" ? "" : "NODE")}
                            sx={{ marginRight: 1 }}>
                            <ElectricalServices />
                        </ToggleButton>
                        {/* <ToggleButton
                        value="check"
                        size="small"
                        selected={inputsMode[key] === "file"}
                        onChange={() => handleModeChange(key, inputsMode[key] === "file" ? "default" : "file")}
                        sx={{ marginRight: 1 }}>
                        <Tune />
                    </ToggleButton> */}
                        <Field
                            input_key={key}
                            value={inputs[key]}
                            //help={node_parameters[key].help}
                            defaultVal={node_parameters[key].default}
                            type={getInputType(key)}
                            kind={node_parameters[key].kind}
                            field_params={getFieldParams(key)}
                            onChange={(value: any) => onChange({ [key]: value })}
                            {...props.fieldprops?.[key]}
                        />
                        { inputsMode[key] === "NODE" ? null : <Button
                            onClick={() => pythonApi.nodeInputToNode(props.node?.id, key)}>
                            <Hub />
                        </Button>}
                    </div>
                    <div style={{paddingLeft: 50, paddingBottom: 10}}>
                        <Typography variant="caption" color="textSecondary">{node_parameters[key].help}</Typography>
                    </div>
                    
                    </div>
                ))}
                <ToggleButton
                    value="check"
                    size="small"
                    selected={showJsonInput}
                    onChange={() => setShowJsonInput(!showJsonInput)}
                    >
                    SHOW JSON INPUT
                </ToggleButton>
                <div hidden={!showJsonInput} style={{border: "dashed 1px black", padding: 10, borderTop: ""}}>
                    <pre>{JSON.stringify(inputs, null, 2)}</pre>
                </div>
            </Box>
        </div>
  )
}

export default NodeInputs