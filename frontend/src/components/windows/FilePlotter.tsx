import { useContext, useRef, useState } from "react"
import { useSelector } from 'react-redux'

import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import DeleteIcon from '@mui/icons-material/Delete';

import PythonApiContext from "../../apis/context"
import { Button, FormControl, IconButton, InputLabel, List, ListItem, MenuItem, Paper, Select, TextField, Typography } from "@mui/material"
import NodeDashboard from "../node_windows/NodeDashboard";

import type { RootState } from "../../App";
import EllipsisLoader from "../loading/EllipsisLoader";

interface FilePlotterProps {

}

const FilePlotter = (props: FilePlotterProps) => {

    const {pythonApi} = useContext(PythonApiContext)

    const [plotOptions, setPlotOptions] = useState<string[]>([])
    const [selectedPlotMethod, setSelectedPlotMethod] = useState("")
    const [newPlotName, setNewPlotName] = useState("")
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [currentNodeID, setCurrentNodeID] = useState<number | null>(null)
    const [loadingPlot, setLoadingPlot] = useState(false)

    const fileInputRef = useRef<HTMLInputElement>(null)
    const plotMethodSelectorRef = useRef<HTMLSelectElement>(null)

    const nodes = useSelector((state: RootState) => state.session.nodes)

    const node_id = currentNodeID || 0
    const {node, name: nodeName} = nodes[node_id] || {node: undefined, name: undefined}

    const onFileUpload = (e: any) => {

        const justUploadedFiles = e.target.files

        const files = [...uploadedFiles]

        // Loop through files
        for (let i = 0; i < justUploadedFiles.length; i++) {
            files.push(justUploadedFiles[i])
        }

        setUploadedFiles(files)

        if (!selectedFile) onFileSelect(files[files.length - 1])

    }

    const onFileSelect = (file: File) => {
            
        setSelectedFile(file)

        updatePlotOptions(file.name)
    }

    const removeFile = (file: File) => {
        const files = uploadedFiles.filter(f => f !== file)
        setUploadedFiles(files)
    }

    const updatePlotOptions = async (filename: string) => {

        const options = await pythonApi.getFilePlotOptions(filename) as unknown as string[]

        setPlotOptions(options)
        setSelectedPlotMethod(options[0])

    }

    const plotFile = () => {

        const file = selectedFile

        if(!file) return

        const name = newPlotName || (file.name + (selectedPlotMethod ? ` - ${selectedPlotMethod}` : ""))

        const additionalFiles = uploadedFiles.filter(f => f !== file)

        setLoadingPlot(true)

        pythonApi.plotUploadedFile(file, selectedPlotMethod || null, name, additionalFiles).then((node_id) => {
            console.warn("Generated plot", node_id)
            console.warn(Object.keys(nodes))
            setLoadingPlot(false)
            setCurrentNodeID(node_id as unknown as number)
        }).catch((e) => {
            setLoadingPlot(false)
            console.error("Error generating plot", e)
        })
        
    }

    const clickFileInput = () => {
        fileInputRef.current?.click()
    }

    const handleDrop = (e: any) => {
        // Prevent default behavior (Prevent file from being opened)
        e.preventDefault();

        const files = [...uploadedFiles]

        if (e.dataTransfer.items) {
            // Use DataTransferItemList interface to access the file(s)
            [...e.dataTransfer.items].forEach((item, i) => {
            // If dropped items aren't files, reject them
            if (item.kind === "file") {
                files.push(item.getAsFile())
            }
            });
        } else {
            // Use DataTransfer interface to access the file(s)
            [...e.dataTransfer.files].forEach((file, i) => {
                files.push(file)
            });
        }

        setUploadedFiles(files)
        if (!selectedFile) onFileSelect(files[files.length - 1])

    }


    return <div id="content" style={{ display: "flex", height: "100%"}}>

        <div style={{ flex: 1, padding: 20}}>
            
            <List style={{display: "flex", flexDirection: "column", height: "100%"}} component="nav" aria-label="mailbox folders">
                <ListItem divider style={{flex: 1}}>
                    <div style={{width: "100%", height: "100%", display: "flex", flexDirection: "column"}}>
                    <Typography style={{marginTop: 10, marginBottom: 10}}><b>Step 1:</b> Upload files and select the main one.</Typography>
                    <div onDrop={handleDrop} onDragOver={(e) => e.preventDefault() }
                        style={{flex: 1, padding: 10, marginBottom: 10, marginTop: 10, borderWidth: 3, borderRadius: 10, borderColor: "rgb(218, 222, 226)", borderStyle: "dashed", backgroundColor: "rgb(238, 242, 246)"}} > 
                        <div style={{display: "flex", justifyContent: "center"}}>
                            <Button onClick={clickFileInput}>Drag files or click here to upload</Button>
                        </div>
                        <div>
                        <ToggleButtonGroup
                            value={selectedFile}
                            exclusive
                            onChange={(e, value) => onFileSelect(value)}
                            aria-label="select file"
                            style={{display: "flex", flexFlow: "row wrap"}}
                            >
                                {uploadedFiles.map(up_file => (
                                    <ToggleButton style={{backgroundColor: up_file === selectedFile? "" : "white", border: "solid 0px", borderRadius: 2, margin: 5, padding: 0}} value={up_file} aria-label="left aligned">
                                        <Paper style={{backgroundColor: "inherit", padding: 5, paddingRight: 15, paddingLeft: 10, display: "flex", alignItems: "center"}}>
                                        <IconButton
                                            style={{marginRight: 5}} 
                                        size="small" color="error" aria-label="delete" onClick={() => removeFile(up_file)}>
                                            <DeleteIcon fontSize="inherit" />
                                        </IconButton>
                                        <div>{up_file.name}</div>
                                        </Paper>
                                    </ToggleButton>)
                                    
                                )}
                            </ToggleButtonGroup>
                        </div>
                    </div>
                    <input style={{display: "none"}} multiple id="file-selector" name="file-selector" type="file" ref={fileInputRef} className="sr-only" onChange={onFileUpload}/>
                    </div>
                </ListItem>
                <ListItem divider>
                    <div style={{width: "100%"}}>
                        <Typography style={{marginTop: 10, marginBottom: 10}}>
                            <b>Step 2:</b> Pick the plotting method.
                        </Typography>
                        <FormControl style={{marginTop: 10, marginBottom: 10}} fullWidth>
                        <InputLabel id="demo-simple-select-label">Plot method</InputLabel>
                        <Select
                            ref={plotMethodSelectorRef}
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={selectedPlotMethod}
                            label="Plot method"
                            onChange={(e) => setSelectedPlotMethod(e.target.value)}
                        >
                            {plotOptions.map(option => <MenuItem value={option}>{option}</MenuItem>)}
                        </Select>
                        </FormControl>
                    </div>
                </ListItem>
                <ListItem>
                    <div style={{width: "100%"}}>
                        <Typography style={{marginTop: 10, marginBottom: 10}} >
                            <b>Step 3:</b> Give the new plot a name.
                        </Typography>
                        <TextField 
                            style={{marginTop: 10, marginBottom: 10}}
                            fullWidth 
                            size="small" 
                            value={newPlotName} 
                            onChange={(e) => setNewPlotName(e.target.value)} 
                            label="Plot name"/>
                    </div>
                </ListItem>
                <ListItem>
                    <div style={{width: "100%"}}>
                    <Button fullWidth variant="contained" onClick={plotFile}>Generate plot</Button>
                    </div>
                </ListItem>
            </List>

        </div>
        <div style={{flex: 1, backgroundColor: "rgb(238, 242, 246)", display: "flex", flexDirection: "column"}}>
            {loadingPlot && <div style={{display: "flex", alignItems: "center", padding: 10, justifyContent: "center"}}>
                <Typography variant="h6" style={{paddingLeft: 10}}>The backend is computing the new plot...</Typography>
                <EllipsisLoader style={{marginLeft: 50}} dotStyle={{backgroundColor: "rgb(182, 213, 245)"}}/>
            </div>}
            <div style={{flex: 1}}>
                <NodeDashboard node={node} name={nodeName} node_id={node_id} defaultWindows={["Output"]}/>
            </div>
        </div>

    </div>
}

export default FilePlotter;