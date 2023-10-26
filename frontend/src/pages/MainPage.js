import * as React from 'react';

import { useEffect, useState, useContext } from 'react';

import { useDispatch } from 'react-redux'
import { setCurrentSession } from '../redux/reducers/session'

import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';

import { Wifi, WifiOff } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// import Plots from './Plots';
import SislDocs from './SislDocs';
import NodeExplorer from '../components/windows/NodeExplorer';
//import Settings from './Session';
import 'react-toastify/dist/ReactToastify.min.css'
import SessionLogs from '../components/windows/SessionLogs';
import BackendSettings from '../components/windows/BackendSettings';

import PythonApiContext, {PythonApiStatusContext} from '../apis/context';
import FilePlotter from '../components/windows/FilePlotter';
import NoBackendWindow from '../components/windows/NoBackendWindow';


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

    const [value, setValue] = React.useState(5);
    const [connected, setConnected] = useState(false)
    const dispatch = useDispatch()

    useEffect(() => {
        pythonApi.onConnect(() => setConnected(true))
        pythonApi.onDisconnect(() => setConnected(false))
        pythonApi.onReceiveSession((session) => dispatch(setCurrentSession({session})))
    }, [pythonApi, dispatch])

    if (connected && value === 5) setValue(0)

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const goToBackendSettings = () => {
        setValue(4)
    }

    return (
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
                    <AppTab label="Sisl docs" {...a11yProps(2)} />
                    <AppTab label="Logs" {...a11yProps(3)} />
                    <AppTab label="Backend config" {...a11yProps(4)} style={{display: "none"}} />
                    <AppTab label="No backend" {...a11yProps(5)} style={{display: "none"}} />
                </AppTabs>

                <div style={{padding: 20}}>
                    <IconButton variant="outlined" color={apiStatus <= 100 ? "error" : apiStatus < 200 ? "warning" : "success" } onClick={() => setValue(4)}>
                        {pythonApi.connected ?  <Wifi /> : <WifiOff />}
                    </IconButton>
                </div>
                
            </Box>
            <TabPanel value={value} index={0}>
                <FilePlotter/>
            </TabPanel>
            <TabPanel value={value} index={1}>
                <NodeExplorer />
            </TabPanel>
            <TabPanel value={value} index={2}>
                <SislDocs />
            </TabPanel>
            <TabPanel value={value} index={3}>
                <SessionLogs/>
            </TabPanel>
            
            <TabPanel value={value} index={4}>
                <BackendSettings />
            </TabPanel>
            <TabPanel value={value} index={5}>
                <NoBackendWindow goToBackendSettings={goToBackendSettings} />
            </TabPanel>
            {/* <ToastContainer/> */}
        </Box>
    );
}
