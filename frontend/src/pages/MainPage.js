import * as React from 'react';
import PropTypes from 'prop-types';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Box from '@material-ui/core/Box';

import Plots from './Plots';
import SislDocs from './SislDocs';
import Settings from './Session';
import ConnectionStatus from '../components/controls/ConnectionStatus';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css'

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      style={{flex: 1, height: "100%"}}
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
  const [value, setValue] = React.useState(1);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box
    sx={{ flexGrow: 1, display: 'flex', height: "100vh"}}>
    <Box sx={{bgcolor:"background.paper"}}>
        <ConnectionStatus
            connectedStyle={{ backgroundColor: "lightgreen", display: "none" }}
            style={{padding: 10}}/>
        <Tabs
        orientation="vertical"
        variant="scrollable"
        value={value}
        onChange={handleChange}
        aria-label="Main app tabs"
        sx={{ borderRight: 1, borderColor: 'divider'}}
        >
            <Tab label="Session" {...a11yProps(0)} />
            <Tab label="Plotting" {...a11yProps(1)} />
            <Tab label="Sisl docs" {...a11yProps(2)} />
        </Tabs>
    </Box>
    <TabPanel value={value} index={0}>
    <Settings/>
    </TabPanel>
    <TabPanel value={value} index={1}>
    <Plots/>
    </TabPanel>
    <TabPanel value={value} index={2}>
    <SislDocs/>
    </TabPanel>
    <ToastContainer/>
    </Box>
  );
}