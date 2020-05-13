import React, { Component } from 'react'
import { connect } from 'react-redux'

import SpeedDial from '@material-ui/lab/SpeedDial';
import SpeedDialIcon from '@material-ui/lab/SpeedDialIcon';
import SpeedDialAction from '@material-ui/lab/SpeedDialAction';
import { makeStyles } from '@material-ui/core/styles';
import { Button } from '@material-ui/core';

import { FaSave} from 'react-icons/fa'
import { AiOutlineUpload } from 'react-icons/ai'
import { setActivePage } from '../../redux/actions'

import PythonApi from '../../apis/PythonApi'
import { ROUTES } from './NavigateButton'

import { GlobalHotKeys } from 'react-hotkeys'
import { GLOBAL_HOT_KEYS } from '../../utils/hotkeys'

const useStyles = makeStyles((theme) => ({
    root: {
        transform: 'translateZ(0px)',
        flexGrow: 1,
    },
    exampleWrapper: {
        position: 'relative',
        marginTop: theme.spacing(3),
    },
    radioGroup: {
        margin: theme.spacing(1, 0),
    },
    speedDial: {
        position: 'absolute',
        '&.MuiSpeedDial-directionUp, &.MuiSpeedDial-directionLeft': {
            bottom: theme.spacing(2),
            right: theme.spacing(2),
        },
        '&.MuiSpeedDial-directionDown, &.MuiSpeedDial-directionRight': {
            top: theme.spacing(2),
            left: theme.spacing(2),
        },
    },
}));

function SpeedDials(props) {
    const classes = useStyles();
    const [direction, setDirection] = React.useState('left');
    const [open, setOpen] = React.useState(false);
    const [hidden, setHidden] = React.useState(false);

    const handleDirectionChange = (event) => {
        setDirection(event.target.value);
    };

    const handleHiddenChange = (event) => {
        setHidden(event.target.checked);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleOpen = () => {
        setOpen(true);
    };

    return (
        <SpeedDial
            ariaLabel="SpeedDial example"
            className={classes.speedDial}
            hidden={hidden}
            icon={<SpeedDialIcon />}
            onClose={handleClose}
            onOpen={handleOpen}
            open={open}
            direction={direction}
        >
            {props.actions.map((action) => (
                <SpeedDialAction
                    key={action.name}
                    icon={action.icon}
                    tooltipTitle={action.tip || action.name}
                    tooltipPlacement={"top"}
                    onClick={action.onClick}
                />
            ))}
        </SpeedDial>
    );
}

class Controls extends Component {

    hotKeysHandler = {
        SAVE_SESSION: () => this.saveCurrentSession(),
        LOAD_SESSION: () => this.loadSession()
    }

    syncWithSession = (session) => {
        document.dispatchEvent(new CustomEvent("syncWithSession", {detail: {session}}))
    }

    showPage = (pageName) => {
        this.props.setActivePage(pageName)
    }

    saveCurrentSession = () => {
        let path = prompt("Please provide the path to save the session.\n\nRoot directory:\n" + this.props.session.settings.rootDir)
        if (!path) return 

        PythonApi.saveSession(path)
    }

    loadSession = () => {

        let path = prompt("Please provide the path of the saved session.\n\nRoot directory:\n" + this.props.session.settings.rootDir)
        if (!path) return

        PythonApi.loadSession(path)
    }

    render() {

        const margins = { marginRight: 20, padding: 0, display:"flex", justifyContent: "center", alignItems: "center"}

        const actions = [{
            name: "Save session",
            icon: <FaSave size={20} />,
            onClick: this.saveCurrentSession
        }, {
            name: "Load session",
                icon: <AiOutlineUpload size={20} />,
            onClick: this.loadSession
        }]

        return <SpeedDials actions={actions} />
    }
}

export class Control extends Component {

    render(){
        
        return <Button
                    data-tip={this.props.tooltip}
                    style={this.props.style}
                    floating
                    icon={this.props.icon}
                    onClick={this.props.onClick}
                    className={this.props.className} />
    }
}

const mapStateToProps = state => ({
    session: state.session
})

const mapDispatchToProps = {
    setActivePage
}

export default connect(mapStateToProps, mapDispatchToProps)(Controls);
