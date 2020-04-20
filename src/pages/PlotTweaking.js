import React, { Component } from 'react'
import { Row, Col} from 'react-materialize'
import ReactTooltip from "react-tooltip"

import PythonApi from "../apis/Socket"

//--Components
import PlotCard from '../components/plots/PlotCard'
import SettingsContainer from '../components/settings/SettingsContainer'

//--Redux
import { connect } from 'react-redux'
import { addPlots, setNewStructures, setActivePlot, setCurrentSession, informLoadedPlot, informLoadingPlot } from "../redux/actions"
import { CHANGE_PLOT_SETTINGS } from '../redux/actions/actionTypes'
import { GlobalHotKeys } from 'react-hotkeys'
import { PLOT_TWEAKING_HOT_KEYS } from '../utils/hotkeys'



class PlotTweaking extends Component {

    hotKeysHandlers = {
        UNDO_SETTINGS: () => this.undoSettings(),
        SUBMIT_ALL_SETTINGS: () => this.submitSettings("all")
    }

    submitSettings = (settings) => {

        if (settings = "all"){
            settings = this.props.active.plot.settings
        }

        PythonApi.updatePlotSettings(this.props.active.plot.id, settings)

        // We would need to update the active plot here!!!!!!
        // But with the new socket-based approach there's probably
        // a smarter way.
    }

    undoSettings = () => {

        PythonApi.undoPlotSettings(this.props.active.plot.id)

        //Same as with updatePlotSettings
    }

    render() {

        if (! this.props.active.plot ) return null

        let setsCont = <SettingsContainer
                            settings={this.props.active.plot.settings}
                            params={this.props.active.plot.params}
                            paramGroups={this.props.active.plot.paramGroups}
                            onSettingChangeType={CHANGE_PLOT_SETTINGS}
                            submitSettings={this.submitSettings}
                            undoSettings={this.undoSettings}/>
        
        return (
            <div style={{...this.props.style}}>
                <GlobalHotKeys keyMap={PLOT_TWEAKING_HOT_KEYS.global} handlers={this.hotKeysHandlers}/>
                <Row>
                    <Col className="s12 l4" style={{height:"90vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems:"center"}}>
                        <PlotCard plot={this.props.active.plot} style={{height: "80vh"}}/>
                    </Col>
                    <Col className="s12 l8" >
                        {this.props.browser.mediaType == "infinity" ? <div className="scrollView" style={{ maxHeight: "90vh" }}>{setsCont}</div> : setsCont}
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

export default connect(mapStateToProps, mapDispatchToProps)(PlotTweaking);
