import React, { Component } from 'react'
import Grid from '@material-ui/core/Grid';
import ReactTooltip from "react-tooltip"

//--Components
import PlotCard from '../components/plots/PlotCard'

//--Redux
import { connect } from 'react-redux'
import { addPlots, setNewStructures, setActivePlot, setCurrentSession, informLoadedPlot, informLoadingPlot } from "../redux/actions"
import { GlobalHotKeys } from 'react-hotkeys'
import { PLOT_TWEAKING_HOT_KEYS } from '../utils/hotkeys'
import Methods from '../components/pythonMethods/Methods'
import { selectActivePlot } from '../redux/reducers'



class PlotMethods extends Component {

    hotKeysHandlers = {
    }

    render() {

        if (! this.props.activePlot ) return null
        
        return (
            <div style={{...this.props.style}}>
                <GlobalHotKeys keyMap={PLOT_TWEAKING_HOT_KEYS.global} handlers={this.hotKeysHandlers}/>
                <Grid container>
                    <Grid item sm={12} md={4} style={{ height: "90vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                        <PlotCard plot={this.props.activePlot} style={{ height: "80vh" }} />
                    </Grid>
                    <Grid item sm={12} md={8} style={{ padding: 20, display: "flex", flexDirection: "column" }} >
                        <Methods plot={this.props.activePlot} />
                    </Grid>
                </Grid>
                <ReactTooltip multiline disable={this.props.session.settings ? !this.props.session.settings.showTooltips : false} />   
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

export default connect(mapStateToProps, mapDispatchToProps)(PlotMethods);
