import React, { Component } from 'react'
import Plot from 'react-plotly.js';
import Card from "@material-ui/core/Card"
import { AiOutlineEdit, AiOutlineDelete, AiOutlineExport, AiOutlineFullscreen } from 'react-icons/ai'
import { FaHammer, FaSave } from 'react-icons/fa'
import { MdSettings } from 'react-icons/md'
import { IconContext } from 'react-icons'

import ReactTooltip from "react-tooltip"

import _ from "lodash"

//--Redux
import { connect } from 'react-redux'
import { setActivePlot, removePlot, setSessionTabs, setActivePage, addPlots} from "../../redux/actions"
import PythonApi from '../../apis/PythonApi';
import { HotKeys } from 'react-hotkeys';
import { PLOT_CARD_HOT_KEYS } from '../../utils/hotkeys';
import { toast } from 'react-toastify';
import { IconButton } from '@material-ui/core';

class PlotCard extends Component {

    constructor(props){
        super(props)
        this.state = {
            isLoading: false,
            editable: false,
        }

    }

    hotKeys = () => document.querySelectorAll(".plotCardHotKeys")

    hotKeysHandlers = {
        GO_TO_PLOT_LAYOUTEDITING: () => this.goToPlotLayoutEditing(),
        GO_TO_PLOT_SETTINGSEDITING: () => this.goToPlotSettingsEditing(),
        GO_TO_PLOT_METHODS: () => this.goToPlotMethods(),
        FULL_SCREEN: () => this.showPlotFullScreen(),
        UNDO_PLOT_SETTINGS: () => this.undoSettings(),
        REMOVE_PLOT: () => this.removePlot(),
    }

    callPlotShortcut = (sequence) => {
        toast.warn("Applying " + this.props.plot.shortcuts[sequence].name + " shortcut")
        PythonApi.callPlotShortcut(this.props.plot.id, sequence)
    }

    handlePlotClick = ({points}) => {
        const data = _.omit(points[0], ["data", "fullData", "xaxis", "yaxis"])
        console.warn(data)
        PythonApi.dispatchPlotEvent(this.props.plot.id, "click", data)
    }

    handlePlotRelayout = (layoutUpdates) => {
        if (layoutUpdates["scene.camera"]) return

        const keys = Object.keys(layoutUpdates)
        if (keys.includes("autosize")) return 
        else if (keys.length === 0) return
        else {
            PythonApi.updatePlotLayout(this.props.plot.id, layoutUpdates)
        }
    }

    undoSettings = () => {

        PythonApi.undoPlotSettings(this.props.plot.id)
    }

    componentDidMount(){
        document.addEventListener("plotResize", (e) => {
            
            if (e.detail.id === this.props.plot.id || e.detail.id === "all"){
                this.setState({cou: Math.random()})          
            }
            
        })
    }

    removePlot = () => {
        PythonApi.removePlot(this.props.plot.id)   
    }

    goToPlotSettingsEditing = () => {
        this.setPlotAsActive()
        this.props.setActivePage("plotTweaking")
    }

    goToPlotLayoutEditing = () => {
        this.setPlotAsActive()
        this.props.setActivePage("plotLayoutEditor")
    }

    goToPlotMethods = () => {
        this.setPlotAsActive()
        this.props.setActivePage("plotMethods")
    }

    setPlotAsActive = () => {
        this.props.setActivePlot(this.props.plot)
    }

    togglePlotAsActive = () => {
        if (this.isActivePlot){
            this.props.setActivePlot(undefined)
        } else {
            this.setPlotAsActive()
        }
    }

    savePlot = () => {
        let path = prompt("Please provide the path to save the plot.\n\nRoot directory:\n" + this.props.session.settings.rootDir)
        if (!path) return

        PythonApi.savePlot(this.props.plot.id, path)
    }

    get isActivePlot(){
        return this.props.plot.id === this.props.active.plot
    }

    showPlotFullScreen = () => {
        PythonApi.showPlotFullScreen(this.props.plot.id)
    }

    render() {

        if (this.state.isLoading || !this.props.plot) {
            return (
                <Card 
                    className="plotcard"
                    style={{borderRadius: 15}}>
                    <div>We are working hard to load your plot.</div>
                </Card>
            )
        }

        if (! this.props.plot.figure){
            return (
                <Card
                    className="plotcard"
                    style={{ borderRadius: 15 }}>
                    <div>A figure could not be generated for this plot.</div>
                </Card>
            )
        }

        let layout = this.props.plot.figure.layout;
        let backColor = layout.paper_bgcolor || "white"

        const hotKeysKeyMap = {
            ...PLOT_CARD_HOT_KEYS,
            TESTING: "shift+r",
            ...Object.keys(this.props.plot.shortcuts).reduce((plotShortcuts, sequence) => {
                let shortcut = this.props.plot.shortcuts[sequence]
                if (["ctrl+z", "ctrl+alt+l"].includes(sequence)) return plotShortcuts
                    plotShortcuts[shortcut.name.replace(/ /g, "_")] = {
                    sequence: sequence,
                    ...shortcut
                }
                return plotShortcuts
            }, {})
        }

        const hotKeysHandlers = {
            ...this.hotKeysHandlers,
            ...Object.keys(this.props.plot.shortcuts).reduce((plotShortcuts, sequence) => {
                let shortcut = this.props.plot.shortcuts[sequence]
                if (["ctrl+z", "ctrl+alt+l"].includes(sequence)) return plotShortcuts
                plotShortcuts[shortcut.name.replace(/ /g, "_")] = () => this.callPlotShortcut(sequence)
                return plotShortcuts
            }, {})
        }

        const activeStyles = this.isActivePlot && false ? {
            borderStyle: "dashed",
            borderWidth: "2px",
            borderColor: "black"
        } : {}

        return <HotKeys
                 className="plotCardHotKeys"
                 //onClick={(e) => {if (e.ctrlKey && false){this.togglePlotAsActive()}}}
                 component={Card}
                 elevation={this.props.elevation || 1}
                 keyMap={hotKeysKeyMap} handlers={hotKeysHandlers} allowChanges={true}
                 style={ {width: "100%", height: "100%", display: "flex", flexDirection: "column", borderRadius: 3, overflow:"hidden", background: backColor, paddingTop: 5, ...activeStyles, ...this.props.style}}>
                <div style={{flex:1}}>
                    <Plot
                        ref={plotlyRef => {
                            this.plotlyRef = plotlyRef;
                        }}
                        useResizeHandler
                        style={{ width: "100%", height: "100%"}}
                        data={this.props.plot.figure.data}
                        layout={{autosize: true, title: "", ...layout}}
                        frames={this.props.plot.figure.frames}
                        onClick={this.handlePlotClick}
                        onRelayout={this.handlePlotRelayout}
                        onUpdate={(figure) => {}}//PythonApi.updateFigure(this.props.plot.id, figure)}
                    config={{editable: this.state.editable, responsive: true}}
                    />
                </div>
                
            <div style={{ display: "flex", paddingLeft: 10, paddingRight: 20, background: backColor, marginBottom: 5}} className="card-action">
                <IconContext.Provider value={{ size: 25, style: { margin: 5 }, color: "#6eb6ff"}}>
                    <div style={{flex:1, textAlign: "left"}}>
                        <IconButton size="small" data-tip="Full screen (f)" onClick={this.showPlotFullScreen}><AiOutlineFullscreen/></IconButton> 
                    </div>

                    <div>
                        <IconButton
                            size="small"
                            data-tip="Settings (s)"
                            onClick={this.goToPlotSettingsEditing}><MdSettings /></IconButton>
                        <IconButton
                            size="small"
                            data-tip="Methods (m)"
                            onClick={this.goToPlotMethods}><FaHammer/></IconButton>
                        <IconButton
                            size="small"
                            data-tip="Editable"
                            onClick={() => this.setState({editable: !this.state.editable})}><MdSettings /></IconButton>
                        <IconButton
                            size="small"
                            data-tip="Edit layout (e)"
                            onClick={this.goToPlotLayoutEditing}><AiOutlineEdit/></IconButton>
                        <IconButton size="small" data-tip="Save plot (coming soon)"><FaSave color="#ccc"/></IconButton>
                        <IconButton size="small" data-tip="Export data (coming soon)"><AiOutlineExport color="#ccc"/></IconButton>
                        <IconButton size="small" data-tip="Remove (supr)" onClick={this.removePlot}><AiOutlineDelete color="red"/></IconButton>
                    </div> 
                </IconContext.Provider>
                <ReactTooltip effect="solid" place="bottom" disable={this.props.session.settings ? !this.props.session.settings.showTooltips : false} /> 
            </div>
        </HotKeys>
    }
}

const mapStateToProps = state => ({
    plots: state.plots,
    active: state.active,
    session: state.session
})

const mapDispatchToProps = {
    setSessionTabs,
    setActivePlot,
    removePlot,
    setActivePage,
    addPlots
}

export default connect(mapStateToProps, mapDispatchToProps)(PlotCard);
