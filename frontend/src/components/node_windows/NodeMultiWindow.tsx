import { useState} from 'react'

import Button from '@mui/material/Button';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { styled } from '@mui/material/styles';

import NodeInputs from './NodeInputs';
import NodeDocs from './NodeDocs';
import NodeLogs from './NodeLogs';
import NodeOutput from './NodeOutput';

import type { Node, NodeClass } from '../../interfaces';
import NodeTerminal from './NodeTerminal';

const StyledTabs = styled(Tabs)({
    borderBottom: '1px solid #e8e8e8',
    borderRight: '0px solid #e8e8e8',
    '& .MuiTabs-indicator': {
        backgroundColor: 'black',
    },
});

const StyledTab = styled(Tab)(
    ({ theme }) => ({
        color: '#ccc',
        '&:hover': {
            color: 'gray',
            opacity: 1,
        },
        '&.Mui-selected': {
            color: 'black',
            fontWeight: theme.typography.fontWeightMedium,
        },
        '&.Mui-focusVisible': {
            backgroundColor: '#d1eaff',
        },
    }),
);

interface TabPanelProps {
    children?: React.ReactNode;
    sel_key: string;
    tab_key: string;
}

function TabPanel(props: TabPanelProps) {
    const { children, tab_key, sel_key, ...other } = props;

    return (
        <div
            style={{width: "100%", height: "100%"}}
            role="tabpanel"
            hidden={tab_key !== sel_key}
            {...other}
        >
            {tab_key === sel_key && children}
        </div>
    );
}

interface NodeMultiWindowProps {
    node: Node,
    node_class: NodeClass,
    modes?: { [key: string]: React.ReactNode },
    modes_props?: { [key: string]: { [key: string]: any } },
    mode?: string,
    onModeChange?: (mode: string) => void,
    onClose?: () => void,
    style?: React.CSSProperties
}

const NodeMultiWindow = (props: NodeMultiWindowProps) => {
    const [selectedTab, setSelectedTab] = useState("Inputs")

    const { node, node_class } = props

    const selTab = props.mode || selectedTab
    const setSelTab = props.onModeChange || setSelectedTab

    var modes: { [key: string]: React.ReactNode } = {};
    if (props.modes) {
        modes = props.modes
    } else {

        const inputs_repr = <NodeInputs node={node} node_class={node_class} {...props.modes_props?.Inputs}/>

        // Get the output representation, which we will only recompute if the node changes
        // For example, if only the inputs change, this representation won't get recomputed.
        const out_repr = <NodeOutput node={node} node_class={node_class} {...props.modes_props?.Output}/>

        const docs_repr = <NodeDocs node={node} node_class={node_class} {...props.modes_props?.Docs}/>

        const logs_repr = <NodeLogs node={node} node_class={node_class} divProps={{className: "no-scrollbar"}} {...props.modes_props?.Logs}/>

        const terminal = <NodeTerminal node={node} node_class={node_class} {...props.modes_props?.Terminal}/>
        
        modes={ "Inputs": inputs_repr, "Output": out_repr, "Docs": docs_repr, "Logs": logs_repr, "Terminal": terminal }

    }

    const options = Object.keys(modes)

    return <div style={{...props.style, display: "flex", flexDirection: "column"}} >
        <StyledTabs
            orientation="horizontal"
            variant="scrollable"
            value={selTab}
            onChange={(event, key) => setSelTab(key)}
            indicatorColor="primary"
            textColor="primary"
            aria-label="Main app tabs"
        >
            {options.map((option) => <StyledTab key={option} label={option} value={option} />)}
        </StyledTabs>
        <div className="no-scrollbar" style={{padding: 20, flex: 1, overflowY: "scroll"}}>
            {options.map(key => <TabPanel key={key} tab_key={key} sel_key={selTab}>{modes[key]}</TabPanel>)}
        </div>
        <div><Button onClick={props.onClose}>Close</Button></div>
    </div>
}

export default NodeMultiWindow;