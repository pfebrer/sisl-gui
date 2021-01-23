import React, { Component } from 'react'
import Grid from '@material-ui/core/Grid';
import ReactTooltip from "react-tooltip"

import PythonApi from "../apis/PythonApi"

//--Components
import PlotCard from '../components/plots/PlotCard'
import SettingsContainer from '../components/settings/SettingsContainer'

//--Redux
import { connect } from 'react-redux'
import { addPlots, setNewStructures, setActivePlot, setCurrentSession, informLoadedPlot, informLoadingPlot } from "../redux/actions"
import { CHANGE_PLOT_SETTINGS } from '../redux/actions/actionTypes'
import { GlobalHotKeys } from 'react-hotkeys'
import { PLOT_TWEAKING_HOT_KEYS } from '../utils/hotkeys'
import { selectActivePlot } from '../redux/reducers'

class PlotTweaking extends Component {

    hotKeysHandlers = {
        UNDO_SETTINGS: () => this.undoSettings(),
        SUBMIT_ALL_SETTINGS: () => this.submitSettings("all")
    }

    submitSettings = (settings) => {

        if (settings === "all"){
            settings = this.props.activePlot.unsubmittedSettings
        }

        PythonApi.updatePlotSettings(this.props.activePlot.id, settings)

    }

    undoSettings = () => {

        PythonApi.undoPlotSettings(this.props.activePlot.id)

    }

    render() {

        const activePlot = this.props.activePlot

        if (! activePlot ) return null

        const plotSettings = { ...activePlot.settings, ...activePlot.unsubmittedSettings}

        let setsCont = <SettingsContainer
                            settings={plotSettings}
                            params={activePlot.params}
                            paramGroups={activePlot.paramGroups}
                            onSettingChangeType={CHANGE_PLOT_SETTINGS}
                            onSettingChangeExtraParams={{plotID: activePlot.id}}
                            submitSettings={this.submitSettings}
                            undoSettings={this.undoSettings}/>
        
        return (
            <div style={{...this.props.style}}>
                <GlobalHotKeys keyMap={PLOT_TWEAKING_HOT_KEYS.global} handlers={this.hotKeysHandlers}/>
                <Grid container>
                    <Grid item sm={12} md={4} style={{height:"90vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems:"center"}}>
                        <PlotCard plot={activePlot} style={{height: "80vh"}}/>
                    </Grid>
                    <Grid item sm={12} md={8} style={{ padding: 20, display: "flex", flexDirection: "column"}} >
                        {this.props.browser.mediaType === "infinity" ? <div className="scrollView" style={{ maxHeight: "90vh"}}>{setsCont}</div> : setsCont}
                    </Grid>
                </Grid>
                <ReactTooltip multiline disable={this.props.session.settings ? !this.props.session.settings.showTooltips : false}/>  
            </div>
            
        )
    }
}

const mapStateToProps = state => ({
    plots: state.plots,
    structures: state.structures,
    active: state.active,
    activePlot: selectActivePlot(state),
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
