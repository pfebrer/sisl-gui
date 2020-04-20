import React, { Component } from 'react'
import { Row, Col} from 'react-materialize'
import ReactTooltip from "react-tooltip"

//--Components
import PlotCard from '../components/plots/PlotCard'

//--Redux
import { connect } from 'react-redux'
import { addPlots, setNewStructures, setActivePlot, setCurrentSession, informLoadedPlot, informLoadingPlot } from "../redux/actions"
import { CHANGE_PLOT_SETTINGS } from '../redux/actions/actionTypes'
import { GlobalHotKeys } from 'react-hotkeys'
import { PLOT_TWEAKING_HOT_KEYS } from '../utils/hotkeys'
import Methods from '../components/pythonMethods/Methods'



class PlotMethods extends Component {

    hotKeysHandlers = {
    }

    render() {

        if (! this.props.active.plot ) return null
        
        return (
            <div style={{...this.props.style}}>
                <GlobalHotKeys keyMap={PLOT_TWEAKING_HOT_KEYS.global} handlers={this.hotKeysHandlers}/>
                <Row>
                    <Col className="s12 l4" style={{height:"90vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems:"center"}}>
                        <PlotCard plot={this.props.active.plot} style={{height: "80vh"}}/>
                    </Col>
                    <Col className="s12 l8" style={{paddingTop: 100}}>
                        <Methods plot={this.props.active.plot}/>
                    </Col>
                </Row>
                <ReactTooltip multiline disable={this.props.session.settings ? !this.props.session.settings.showTooltips : false}/>  
            </div>
            
        )
    }
}

const mapStateToProps = state => ({
    plots: state.plots,
    structures: state.structures,
    active: state.active,
    session: state.session,
    browser: state.browser
})

const mapDispatchToProps = {
    setCurrentSession,
    addPlots,
    setActivePlot,
    setNewStructures,
    informLoadedPlot,
    informLoadingPlot
}

export default connect(mapStateToProps, mapDispatchToProps)(PlotMethods);
