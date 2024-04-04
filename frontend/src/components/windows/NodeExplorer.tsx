import { useContext, useEffect, useMemo, useState} from 'react'

import TextField from '@mui/material/TextField';
import TuneIcon from '@mui/icons-material/Tune';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import ToggleButton from '@mui/material/ToggleButton';
import { styled } from '@mui/material/styles';

import NewNodes from './NewNodes';
import NodeDashboard from '../node_windows/NodeDashboard';
import { NodeClassesContext, NodesContext } from '../../context/session_context';

const NodesTabs = styled(Tabs)({
    borderRightWidth: 0,
    '& .MuiTabs-indicator': {
        display: "none",
    },
});

const NodeTab = styled(Tab)({
    borderRadius: 5,
    marginLeft: 10,
    marginRight: 10,
    marginTop: 2,
    marginBottom: 2,
    '&:hover': {
        backgroundColor: 'rgb(237, 231, 246)',
    },
    '&.Mui-selected': {
        backgroundColor: 'rgb(237, 231, 246)',
        color: 'rgb(103, 58, 183)'
    },
    '&.Mui-focusVisible': {
        backgroundColor: '#d1eaff',
    },
})

interface NodeExplorerViewProps {
    style: { [key: string]: any },
    defaultNode?: number
}

const NodeExplorer = (props: NodeExplorerViewProps) => {

    const [selectedNode, setSelectedNode] = useState(0)
    const [filtersShow, setFilterShow] = useState(false)
    const [classFilter, setClassFilter] = useState("")
    const [nameFilter, setNameFilter] = useState("")

    const nodes = useContext(NodesContext)
    const node_classes = useContext(NodeClassesContext)

    const { defaultNode } = props

    useEffect(() => {
        if (defaultNode) setSelectedNode(defaultNode)
    }, [defaultNode])

    const all_keys = useMemo(() => Object.keys(nodes || {}).map(Number), [nodes])

    const filtered_by_name = useMemo(() => {
        if (nameFilter) return all_keys.filter(key => nodes[key].name.includes(nameFilter))
        return all_keys
    }, [all_keys, nodes, nameFilter])

    const nodes_keys = useMemo(() => {
        if (classFilter) return filtered_by_name.filter(key => node_classes[nodes[key].node.class].name.includes(classFilter))
        return filtered_by_name
    }, [filtered_by_name, node_classes, classFilter, nodes])

    const tabs = <NodesTabs
        orientation="vertical"
        variant="scrollable"
        value={selectedNode}
        onChange={(event, key) => setSelectedNode(key)}
        indicatorColor="secondary"
        textColor="secondary"
        aria-label="Main app tabs"
        sx={{ height: "100%" }}
    >
        <Tab label={"NEW NODE"} value={-1} sx={{ color: "green" }} />
        {nodes_keys.map((key) => <NodeTab
            label={nodes[key].name}
            value={key}
        />)}
    </NodesTabs>

    const obj_view = selectedNode === -1 ? 
        <NewNodes onFinish={()=> setSelectedNode(0)}/>
            :
        <NodeDashboard
            node_id={selectedNode}
            name={nodes && nodes[selectedNode]?.name} 
            node={nodes && nodes[selectedNode]?.node}
        />

    return <div style={{ display: "flex", height: "100%", ...props.style}}>
        <div hidden={!filtersShow} 
            style={{ width: 200, height: "100%", backgroundColor: "rgb(238, 242, 246)", padding: 10, marginLeft: 10, borderRadius: 5 }}>
            <div style={{paddingBottom: 10}}> Filters: </div>
            <div>
                <TextField 
                    label={"By node class name"} size="small" 
                    value={classFilter}
                    onChange={(e) => setClassFilter(e.target.value)}
                />
            </div>
        </div>
        <div style={{ width: 250, height: "100%", display: "flex", flexDirection: "column", paddingLeft: 10, paddingRight: 10 }}>
            <div style={{ display: "flex", alignItems: "center"}}>
                <div style={{padding: 5}}>
                    <ToggleButton
                        value="showFilter"
                        selected={filtersShow}
                        size="small"
                        onClick={() => setFilterShow(!filtersShow)}
                        aria-label="toggle-filters">
                        <TuneIcon />
                    </ToggleButton>
                </div>
                <div style={{paddingRight: 5}}>
                    <TextField label={"Search"} size="small" value={nameFilter} onChange={(e) => setNameFilter(e.target.value)} />
                </div>
            </div>
            <div style={{flex: 1, overflow: "hidden"}}>
                {tabs}
            </div>
            
        </div>
        <div style={{ flex: 1, height: "100%"}}>
            {obj_view}
        </div>
    </div>
    
}

export default NodeExplorer;