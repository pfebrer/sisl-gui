import { useState, useMemo, useContext } from 'react'
import * as React from 'react'

import Chip from '@mui/material/Chip'
import TextField from '@mui/material/TextField'

import { Button, Divider, FormControlLabel, Grid, Switch, ToggleButton, ToggleButtonGroup } from '@mui/material'
import { Expand, GridOnOutlined, AccountTreeOutlined } from '@mui/icons-material'
import { NodeClassesRegistryContext  } from '../../context/session_context'
import { NodeClass } from '../../interfaces'

interface NodeClassPickerProps {
    value?: number,
    onChange?: (value: number) => void
    style?: React.CSSProperties
}

const getModulesTree = (node_classes: { [node_class_id: number]: NodeClass }) => {

    const tree: any = {}

    if (!node_classes) return tree

    Object.keys(node_classes).map(Number).forEach((node_class_id) => {
        var loc = tree
        const path = node_classes[node_class_id].module.replace(/(^nodified_)/, "").split(".")
        
        path.forEach((k, i) => {

            if (!(k in loc)) loc[k] = {} 
            loc = loc[k]
            

            if (i === path.length - 1) {
                if (!("_node_classes" in loc)) loc["_node_classes"] = []
                loc['_node_classes'].push(node_class_id)
            } 
                
        })

    })

    return tree
}

interface NodeClassesGridProps {
    classes_ids: number[],
    node_classes: { [node_class_id: number]: { name: string } }
    filtered_out: { [node_class_id: number]: boolean }
    onNodeClassClick: (node_class_id: number) => void
    selectedNodeClass: number,
    showNonMatching: boolean,
}

const NodeClassesGrid = (props: NodeClassesGridProps) => {

    return <Grid container spacing={1} justifyContent={"flex-start"}>
    {props.classes_ids.map((node_class_id: number) => <Grid item xs={12} md={6} lg={6} xl={4}
            style={{display: props.showNonMatching || !props.filtered_out[node_class_id] ? undefined : "none"}}>
        <Chip
        style={{
            width: "100%",
            borderRadius: 3
        }}
        disabled={props.filtered_out[node_class_id]}
        label={props.node_classes[node_class_id].name} 
        variant={node_class_id === props.selectedNodeClass ? "filled" : "outlined"}
        onClick={() => props.onNodeClassClick(node_class_id)}/>
    </Grid>
    )}
    </Grid>
}


interface ModuleProps {
    module: string,
    tree: any,
    depth: number,
    node_classes: { [node_class_id: number]: { name: string } }
    filtered_out: { [node_class_id: number]: boolean }
    onNodeClassClick: (node_class_id: number) => void
    selectedNodeClass: number,
    showNonMatching: boolean,
}

const Module = (props: ModuleProps) => {

    const {depth, tree, module, ...other_props} = props

    const [open, setOpen] = useState(depth < 3)

    const contentDisplay = open ? undefined : "none"

    const maxDepth = 10
    const alpha = Math.min(depth / maxDepth * 0.2, 0.2)
    //const contrast = Math.min(255 * alpha * 2.5, 255)
    //const textColor = alpha < 0.3 ? "white" : "black"

    const backgroundColor = `rgba(0, 0, 0, ${alpha}`
    const textColor = "black"//`rgb(${contrast}, ${contrast}, ${contrast})`

    return <div style={{paddingLeft: 20, paddingRight: 20, paddingBottom: open ? 20: 0, backgroundColor: backgroundColor, }}>
        <div onClick={() => setOpen(!open)}>
            <Button style={{color: textColor}} startIcon={open ? <Expand /> : <Expand style={{transform: "rotate(90deg)"}}/>} >
                {props.module}
            </Button>
        </div>
        <div style={{display: contentDisplay}}>
            {"_node_classes" in tree && <NodeClassesGrid {...other_props} classes_ids={tree["_node_classes"]} />}
            {Object.keys(tree).filter(k => k !== "_node_classes").map((key) => <Module depth={depth + 1} module={key} tree={tree[key]} {...other_props} />)}
        </div>
    
    </div>

    
}

const NodeClassPicker = (props: NodeClassPickerProps) => {
    const [selectedNode, setSelectedNode] = useState(0)

    const [nameFilter, setNameFilter] = useState("")
    const [showNonMatching, setShowNonMatching] = useState(false)
    const [viewMode, setViewMode] = useState<"tree" | "list">("tree")

    const value = props.value || selectedNode
    const onChange = props.onChange || setSelectedNode

    const {node_classes}  = useContext(NodeClassesRegistryContext)

    const tree = useMemo(() => getModulesTree(node_classes), [node_classes])
 
    const all_ids = Object.keys(node_classes).map(Number)

    const filtered_out = useMemo(() => {
        if (!nameFilter) return {}
        
        return all_ids.filter(key => !node_classes[key].name.includes(nameFilter)).reduce((acc, key) => {
            acc[key] = true
            return acc
        }, {} as {[key: number]: boolean})

    }, [nameFilter, all_ids, node_classes])

    var viewContent;
    if (viewMode === "tree") {
        viewContent = Object.keys(tree).filter(k => k !== "_node_classes").map((key) => <Module 
            depth={1} 
            module={key} 
            tree={tree[key]} 
            node_classes={node_classes} 
            selectedNodeClass={value}
            onNodeClassClick={onChange}
            filtered_out={filtered_out}
            showNonMatching={showNonMatching}
        />)
    } else {
        viewContent = <NodeClassesGrid
            classes_ids={all_ids}
            node_classes={node_classes}
            selectedNodeClass={value}
            onNodeClassClick={onChange}
            filtered_out={filtered_out}
            showNonMatching={showNonMatching}
        />
    }

    return <div style={{display: "flex", flexDirection: "column", justifyContent: "space-between", ...props.style}}>
        <div style={{padding: 20, display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center"}}>
            <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(_, value) => setViewMode(value)}
                aria-label="text alignment"
                >
                <ToggleButton value="tree" aria-label="tree">
                    <AccountTreeOutlined/>
                </ToggleButton>
                <ToggleButton value="list" aria-label="list">
                    <GridOnOutlined/>
                </ToggleButton>
            </ToggleButtonGroup>

            <TextField label="Filter by name" value={nameFilter} size="small" onChange={(e) => setNameFilter(e.target.value)} />

            <FormControlLabel control={
                <Switch checked={!showNonMatching} onChange={() => setShowNonMatching(!showNonMatching)}/>
            } label="Hide non-matches" />
            
        </div>
        <Divider />
        <div style={{flex: 1, overflow: "hidden"}}>
            <Grid container spacing={1} justifyContent={"flex-start"} style={{height: "100%", overflow: "hidden"}}>
            <Grid item md={12} lg={7} style={{height: "100%"}}>
            <div
                style={{
                    overflowY: "scroll",
                    height: "100%",
                    paddingTop: 30, paddingBottom: 30, paddingLeft: 20, paddingRight: 20
                }}>
                {viewContent}
            </div>
            </Grid>
            <Grid item md={12} lg={5}>
            <div className="no-scrollbar" style={{padding: 20, overflowY: "scroll"}}>
                <pre style={{whiteSpace: "pre-wrap"}}>{node_classes[value]?.doc || "No documentation"}</pre>
            </div>
            </Grid>
            </Grid>
        </div>
        
    </div>

}

export default NodeClassPicker