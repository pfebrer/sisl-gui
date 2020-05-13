
import PythonApi from "../apis/PythonApi"

//--Redux
import { connect } from 'react-redux'
import { addPlots, setNewStructures, setActivePlot, setCurrentSession, informLoadedPlot, informLoadingPlot } from "../redux/actions"
import { CHANGE_PLOT_SETTINGS } from '../redux/actions/actionTypes'
import { GlobalHotKeys } from 'react-hotkeys'
import { PLOT_TWEAKING_HOT_KEYS } from '../utils/hotkeys'
import { selectActivePlot } from '../redux/reducers'

import React, { Component } from 'react';
import plotly from 'plotly.js/dist/plotly';
import PlotlyEditor from 'react-chart-editor';
import 'react-chart-editor/lib/react-chart-editor.css';

// const dataSources = {
//     col1: [1, 2, 3], // eslint-disable-line no-magic-numbers
//     col2: [4, 3, 2], // eslint-disable-line no-magic-numbers
//     col3: [17, 13, 9], // eslint-disable-line no-magic-numbers
// };

// const dataSourceOptions = Object.keys(dataSources).map(name => ({
//     value: name,
//     label: name,
// }));

const config = { editable: true };

class PlotEditor extends Component {

    constructor(props) {
        super(props);
        const activePlot = props.activePlot
        this.state = activePlot.figure;
    }

    hotKeysHandlers = {
        UNDO_SETTINGS: () => this.undoSettings(),
        SUBMIT_ALL_SETTINGS: () => this.submitSettings("all")
    }

    submitSettings = (settings) => {

        if (settings = "all") {
            settings = this.props.activePlot.unsubmittedSettings
        }

        PythonApi.updatePlotSettings(this.props.activePlot.id, settings)

    }

    componentWillUnmount(){

        PythonApi.updateFigure(this.props.activePlot.id, {...this.state, overwrite: true})
        // this.props.addPlots({
        //     [this.props.activePlot.id]: {
        //         ...this.props.activePlot,
        //         figure: this.state
        //     }
        // })
    }

    undoSettings = () => {

        PythonApi.undoPlotSettings(this.props.activePlot.id)

    }

    render() {

        const activePlot = this.props.activePlot

        if (!activePlot) return null

        return (
            <PlotlyEditor
                data={this.state.data}
                layout={this.state.layout}
                config={config}
                frames={this.state.frames}
                plotly={plotly}
                style={{...this.props.style}}
                onUpdate={(data, layout, frames) =>
                    this.setState({ data, layout, frames })
                }
                useResizeHandler
                debug
                advancedTraceTypeSelector
            />
        )
    }
}

const mapStateToProps = state => ({
    activePlot: selectActivePlot(state),
})

export default connect(mapStateToProps, null)(PlotEditor);