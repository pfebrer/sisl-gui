import * as React from 'react';

import { useCallback, useContext, useEffect, useState } from 'react';

import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import PropTypes from 'prop-types';

import { LiveHelp, Wifi, WifiOff } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// import Plots from './Plots';
import NodeExplorer from '../components/windows/NodeExplorer';
import SislDocs from './SislDocs';
//import Settings from './Session';
import 'react-toastify/dist/ReactToastify.min.css';
import BackendSettings from '../components/windows/BackendSettings';
import SessionLogs from '../components/windows/SessionLogs';

import { Tooltip } from '@mui/material';
import PythonApiContext, { PythonApiStatusContext } from '../apis/context';
import SessionIO from '../components/SessionIO';
import NodeTerminal from '../components/node_windows/NodeTerminal';
import FilePlotter from '../components/windows/FilePlotter';
import FlowWindow from '../components/windows/FlowWindow';
import NoBackendWindow from '../components/windows/NoBackendWindow';
import { NavigatorContext } from '../context/main_nav';
import { TooltipsLevelContext } from '../context/tooltips';


const AppTabs = styled(Tabs)({
    borderRightWidth: 0,
    '& .MuiTabs-indicator': {
        display: "none",
    },
});

const AppTab = styled(Tab)({
    borderRadius: 5,
    marginLeft: 2,
    marginRight: 2,
    marginTop: 10,
    marginBottom: 10,
    '&:hover': {
        backgroundColor: 'rgb(238, 242, 246)',
    },
    '&.Mui-selected': {
        backgroundColor: 'rgb(238, 242, 246)',
    },
    '&.Mui-focusVisible': {
        backgroundColor: '#d1eaff',
    },
})

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      style={{ flex: 1, overflow: "hidden"}}
      {...other}
    >
      {value === index && (
        <Box sx={{width: "100%", height: "100%"}}>
          {children}
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export default function MainPage() {

    const {pythonApi} = useContext(PythonApiContext)
    const apiStatus = useContext(PythonApiStatusContext)

    const [value, setValue] = React.useState(7);
    const [connected, setConnected] = useState(false)

    const [explorerNode, setExplorerNode] = useState(undefined)

    const seeNodeInExplorer = useCallback((node_id) => {
        setValue(1)
        setExplorerNode(node_id)
    }, [])

    useEffect(() => {
        pythonApi.onConnect(() => setConnected(true))
        pythonApi.onDisconnect(() => setConnected(false))
    }, [pythonApi])

    if (connected && value === 7) setValue(0)

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const goToBackendSettings = () => {
        setValue(6)
    }

    const {tooltipsLevel, setTooltipsLevel} = useContext(TooltipsLevelContext)
    const tooltipsLevelColor = {"beginner": "green", "normal": undefined, "none": "#ccc"}[tooltipsLevel]

    const connectionTooltipColor = apiStatus <= 100 ? "red" : apiStatus < 200 ? "orange" : "green"
    var connectionTooltipTitle = "Connection status: " + (apiStatus <= 100 ? "Not connected" : apiStatus < 200 ? "Connecting..." : "Connected")
    if (tooltipsLevel === "beginner") {
        connectionTooltipTitle = <div style={{textAlign: "center"}}>
            <div>{connectionTooltipTitle}</div>
            { apiStatus <= 100 ? 
                <div>The graphical interface needs to be connected to some backend.
                You can pick the backend to connect at the home page or by clicking this icon.</div> 
                : null
            }

        </div>
    }

    return (
        <NavigatorContext.Provider value={{seeNodeInExplorer}}>
        <Box
        sx={{ height: "100vh", display: "flex", flexDirection: "column"}}>
            <Box sx={{ bgcolor: "background.paper", display: "flex", justifyContent: "space-between", alignItems: "center", paddingLeft: 1 }}>
                <AppTabs
                orientation="horizontal"
                variant="scrollable"
                value={value}
                onChange={handleChange}
                aria-label="Main app tabs"
                sx={{ borderRight: 0, borderColor: 'divider'}}
                >
                    <AppTab label="Quick plot" {...a11yProps(0)} />
                    <AppTab label="Explorer" {...a11yProps(1)} />
                    <AppTab label="Flow" {...a11yProps(2)} />
                    <AppTab label="Sisl docs" {...a11yProps(3)} />
                    <AppTab label="Logs" {...a11yProps(4)} />
                    <AppTab label="Terminal" {...a11yProps(5)} style={{display: pythonApi.allows_runpython ? undefined : "none"}} />
                    <AppTab label="Backend config" {...a11yProps(6)} style={{display: "none"}} />
                    <AppTab label="No backend" {...a11yProps(7)} style={{display: "none"}} />
                </AppTabs>

                
                <div style={{padding: 20, display: "flex", alignItems: "center"}}>
                    <Tooltip title={`Tooltips level: ${tooltipsLevel}. Click to change.`} arrow>
                    <IconButton 
                        style={{marginRight: 10}} 
                        onClick={() => setTooltipsLevel(tooltipsLevel === "normal" ? "beginner" : "normal")}
                        onDoubleClick={() => setTooltipsLevel("none")}
                    >
                        <LiveHelp style={{color: tooltipsLevelColor}}/>
                    </IconButton>
                    </Tooltip>
                    <SessionIO />
                    <Tooltip 
                        title={connectionTooltipTitle}
                        componentsProps={{
                            tooltip: {sx: { bgcolor: connectionTooltipColor,
                                '& .MuiTooltip-arrow': {color: connectionTooltipColor,},
                              },
                            },
                        }}
                        arrow>
                    <IconButton variant="outlined" color={apiStatus <= 100 ? "error" : apiStatus < 200 ? "warning" : "success" } onClick={goToBackendSettings}>
                        {pythonApi.connected ?  <Wifi /> : <WifiOff />}
                    </IconButton>
                    </Tooltip>

                </div>

            </Box>
            <TabPanel value={value} index={0}>
                <FilePlotter/>
            </TabPanel>
            <TabPanel value={value} index={1}>
                <NodeExplorer defaultNode={explorerNode}/>
            </TabPanel>
            <TabPanel value={value} index={2}>
                <FlowWindow/>
            </TabPanel>
            <TabPanel value={value} index={3}>
                <SislDocs />
            </TabPanel>
            <TabPanel value={value} index={4}>
                <SessionLogs/>
            </TabPanel>
            <TabPanel value={value} index={5}>
                <NodeTerminal style={{padding: 20}}/>
            </TabPanel>
            <TabPanel value={value} index={6}>
                <BackendSettings />
            </TabPanel>
            <TabPanel value={value} index={7}>
                <NoBackendWindow goToBackendSettings={goToBackendSettings} />
            </TabPanel>
            {/* <ToastContainer/> */}
        </Box>
        </NavigatorContext.Provider>
    );
}
