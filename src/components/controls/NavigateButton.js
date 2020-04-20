import React, { Component } from 'react'
import { Control } from './Controls'
import { connect } from 'react-redux'
import { setActivePage } from '../../redux/actions'
import { IoMdSettings } from 'react-icons/io'
import { MdDashboard } from 'react-icons/md'

const ROUTES = {
    settings: {
        icon: IoMdSettings,
        color: "grey",
        hotKey: "Shift + s",
    },
    plots: {
        icon: MdDashboard,
        color: "grey",
        hotKey: "Shift + d"
    }
}

class NavigateButton extends Component {

    showPage = () => {
        this.props.setActivePage(this.props.to)
    }

    render() {

        const route = ROUTES[this.props.to]

        return <Control 
            icon={route.icon} 
            className={route.color}
            tooltip={"Go to " + this.props.to + " (" + route.hotKey + ")"}
            onClick={this.showPage}
            {...this.props}/>
    }
}

const mapDispatchToProps = {
    setActivePage
}

export default connect(null, mapDispatchToProps)(NavigateButton);
