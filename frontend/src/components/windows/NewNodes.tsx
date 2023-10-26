import { FC, useState, useEffect, useContext } from 'react'
import * as React from 'react'
import { useSelector } from 'react-redux'

import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip'
import TextField from '@mui/material/TextField'

import NodeInputs from '../node_windows/NodeInputs';

import type { RootState } from '../../App'

import PythonApiContext from '../../apis/context';

interface NewNodesProps {
    onFinish: () => void
}

const NewNodes: FC<NewNodesProps> = (props) => {
    const steps = ["Pick node class", "Set inputs"]

    const [activeStep, setActiveStep] = useState(0);
    const [selectedNodeClass, setSelectedNodeClass] = useState(0)
    const [inputs, setInputs] = useState({})
    const [inputsMode, setInputsMode] = useState<{ [key: string]: string }>({})

    const session = useSelector((state: RootState) => state.session)

    const {pythonApi} = useContext(PythonApiContext) 

    useEffect(() => {setInputs({}); setInputsMode({})}, [selectedNodeClass])

    const createNode = () => {
        pythonApi.initNode(selectedNodeClass, inputs, inputsMode)
        props.onFinish()
    }

    const handleNext = () => {
        if (activeStep === steps.length - 1) createNode()
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handleReset = () => {
        setActiveStep(0);
    };

    const node_inputs_view = <div style={{flex: 1, overflow: "scroll", padding: 20}}>
        <NodeInputs
            className="no-scrollbar"
            inputs={inputs}
            onChange={(changed_inputs) => setInputs({ ...inputs, ...changed_inputs })}
            node_class={session.node_classes[selectedNodeClass]}
            inputsMode={inputsMode}
            onChangeInputsMode={(changed_inputs) => setInputsMode({ ...inputsMode, ...changed_inputs })}
        />
    </div>

    const view = activeStep === 0 ? 
        <NodeClassPicker style={{flex: 1, overflow: "hidden"}} value={selectedNodeClass} onChange={setSelectedNodeClass}/> 
            : 
        node_inputs_view

    return (
        <div style={{ 
            width: '100%', height: "100%", paddingTop: 20,
            display: "flex", flexDirection: "column", justifyContent: "space-between", 
            }}>
            <div style={{ width: '80%', marginLeft: "10%", marginRight: "10%", marginBottom: 20 }}>
                <Stepper activeStep={activeStep}>
                    {steps.map((label, index) => {
                        const stepProps: { completed?: boolean } = {};
                        const labelProps: {
                            optional?: React.ReactNode;
                        } = {};
                        return (
                            <Step key={label} {...stepProps}>
                                <StepLabel {...labelProps}>{label}</StepLabel>
                            </Step>
                        );
                    })}
                </Stepper>
            </div>
            {view}

            {activeStep === steps.length ? (
                <React.Fragment>
                    <Typography sx={{ mt: 2, mb: 1 }}>
                        All steps completed - you&apos;re finished
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
                        <Box sx={{ flex: '1 1 auto' }} />
                        <Button onClick={handleReset}>Reset</Button>
                    </Box>
                </React.Fragment>
            ) : (
                <React.Fragment>
                    <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
                        <Button
                            color="inherit"
                            disabled={activeStep === 0}
                            onClick={handleBack}
                            sx={{ mr: 1 }}
                        >
                            Back
                        </Button>
                        <Box sx={{ flex: '1 1 auto' }} />
                        <Button onClick={handleNext}>
                            {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
                        </Button>
                    </Box>
                </React.Fragment>
            )}
        </div>
    );
}

export default NewNodes;

interface NodeClassPickerProps {
    value?: number,
    onChange?: (value: number) => void
    style?: React.CSSProperties
}

const NodeClassPicker: FC<NodeClassPickerProps>= (props) => {

    const [nameFilter, setNameFilter] = useState("")
    const [selectedNode, setSelectedNode] = useState(0)

    const value = props.value || selectedNode
    const onChange = props.onChange || setSelectedNode

    const session = useSelector((state: RootState) => state.session)

    const node_classes = session.node_classes

    var classes_ids = Object.keys(node_classes).map(Number)

    if (nameFilter) {
        classes_ids = classes_ids.filter(key => session.node_classes[key].name.includes(nameFilter))
    }

    return (
        <div style={{display: "flex", flexDirection: "column", justifyContent: "space-between", ...props.style}}>
            <div style={{padding: 20, borderBottom: "solid gray 1px"}}>
                <TextField label="Search" value={nameFilter} size="small" onChange={(e) => setNameFilter(e.target.value)} />
            </div>
            <div className={"no-scrollbar"} style={{flex: 1, overflow: "scroll"}}>
                {classes_ids.map((class_id, index) => (
                    <Chip
                        key={index}
                        variant="outlined"
                        label={node_classes[class_id].name}
                        sx={{ margin: 2, backgroundColor: value === class_id ? "#ccc" : undefined }}
                        onClick={() => onChange(class_id)}
                    />
                ))}
            </div>
            <div className="no-scrollbar" style={{padding: 20, maxHeight: "50%", overflowY: "scroll"}}>
                <pre>{node_classes[value]?.doc || "No documentation"}</pre>
            </div>
        </div>
    )
}