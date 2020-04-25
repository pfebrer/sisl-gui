import React, { Component } from 'react'
import Plot from 'react-plotly.js';
import { Card, Row, Icon } from 'react-materialize';
import { AiOutlineEdit, AiOutlineDelete, AiOutlineExport, AiOutlineFullscreen } from 'react-icons/ai'
import { FaHammer } from 'react-icons/fa'
import { IconContext } from 'react-icons'

import { CircleLoader} from 'react-spinners';
import ReactTooltip from "react-tooltip"

import _ from "lodash"
import {unflatten} from "flat"

//--Redux
import { connect } from 'react-redux'
import { setActivePlot, removePlot, setSessionTabs, setActivePage, addPlots} from "../../redux/actions"
import PythonApi from '../../apis/PythonApi';
import { HotKeys } from 'react-hotkeys';
import { PLOT_CARD_HOT_KEYS } from '../../utils/hotkeys';
import { toast } from 'react-toastify';

class PlotCard extends Component {

    constructor(props){
        super(props)
        this.state = {
            isLoading: false,
        }

    }

    hotKeys = () => document.querySelectorAll(".plotCardHotKeys")

    hotKeysHandlers = {
        GO_TO_PLOT_EDITING: () => this.goToPlotEditing(),
        GO_TO_PLOT_METHODS: () => this.goToPlotMethods(),
        FULL_SCREEN: () => this.showPlotFullScreen(),
        UNDO_PLOT_SETTINGS: () => this.undoSettings(),
        REMOVE_PLOT: () => this.removePlot(),
    }

    callPlotShortcut = (sequence) => {
        toast.warn("Applying " + this.props.plot.shortcuts[sequence].name + " shortcut")
        PythonApi.callPlotShortcut(this.props.plot.id, sequence)
    }

    undoSettings = () => {

        PythonApi.undoPlotSettings(this.props.plot.id)
    }

    componentDidMount(){
        document.addEventListener("plotResize", (e) => {
            
            if (e.detail.id == this.props.plot.id || e.detail.id == "all"){
                this.setState({cou: Math.random()})          
            }
            
        })
    }

    removePlot = () => {
        PythonApi.removePlot(this.props.plot.id)   
    }

    goToPlotEditing = () => {
        this.setPlotAsActive()
        this.props.setActivePage("plotTweaking")
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

    get isActivePlot(){
        return this.props.active.plot && this.props.plot.id == this.props.active.plot.id
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
                    <Row style={{textAlign: "center"}}>
                        <CircleLoader color="#36D7B7"/>
                    </Row>
                    <div>We are working hard to load your plot.</div>
                </Card>
            )
        }

        let layout = this.props.plot.figure.layout;
        let backColor = this.props.plot.settings.paper_bgcolor || "white"

        //If this is the active plot, we are going to overwrite the layout with the settings (so that user is able to see a preview)
        if (this.props.active.plot && this.props.active.plot.id == this.props.plot.id){

            backColor = this.props.active.plot.settings.paper_bgcolor || "white"

            // let layoutSubGroups = _.groupBy( _.groupBy(this.props.active.plot.params, "group")["layout"] , "subGroup")

            // layout = {
            //     ...layout,
            //     ...layoutSubGroups["undefined"].reduce((map, param) => {map[param.key] = this.props.active.plot.settings[param.key]; return map}, {} ),
            //     "xaxis": {
            //         ...layout.xaxis,
            //         ...layoutSubGroups["xaxis"].reduce((map, param) => {map[param.key.split("_").pop()] = this.props.active.plot.settings[param.key]; return map}, {}),
            //     },
            //     "yaxis": {
            //         ...layout.yaxis,
            //         ...layoutSubGroups["yaxis"].reduce((map, param) => {map[param.key.split("_").pop()] = this.props.active.plot.settings[param.key]; return map}, {} ),
            //     }

            // }

            let layoutParams = _.groupBy(this.props.active.plot.params, "group")["layout"]

            let layoutSettings = layoutParams.reduce((map,param) => {map[param.key] = this.props.active.plot.settings[param.key]; return map},{})

            let nestedLayoutParams = unflatten( layoutSettings, {delimiter: "_"})


            layout = {
                ...layout,
                ...layoutSettings,
                "xaxis": {
                    ...layout.xaxis,
                    ...nestedLayoutParams.xaxis
                },
                "yaxis": {
                    ...layout.yaxis,
                    ...nestedLayoutParams.yaxis
                }

            }
            
        }

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
            TESTING: () => console.warn("YEEEY"),
            ...Object.keys(this.props.plot.shortcuts).reduce((plotShortcuts, sequence) => {
                let shortcut = this.props.plot.shortcuts[sequence]
                if (["ctrl+z", "ctrl+alt+l"].includes(sequence)) return plotShortcuts
                plotShortcuts[shortcut.name.replace(/ /g, "_")] = () => this.callPlotShortcut(sequence)
                return plotShortcuts
            }, {})
        }

        const activeStyles = this.isActivePlot ? {
            borderStyle: "solid",
            borderWidth: "2px",
            borderColor: "black"
        } : {}

        return <HotKeys
                 className="plotCardHotKeys"
                 onClick={(e) => {if (e.ctrlKey){this.togglePlotAsActive()}}}
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
                        layout={{autosize: true, ...layout}}
                        frames={this.props.plot.figure.frames}
                        onClick={(data) => {}}
                        onUpdate={(figure) => {}}
                        config={{responsive: true}}
                    />
                </div>
                
            <div style={{display: "flex", paddingLeft: 10, paddingRight: 20}} className="card-action">
                <IconContext.Provider value={{size: 25, style:{margin: 5}}}>
                    <div style={{flex:1, textAlign: "left"}}>
                        <a data-tip="Full screen (f)" href="#" onClick={this.showPlotFullScreen}><AiOutlineFullscreen/></a> 
                    </div>

                    <div>
                        <a
                            data-tip="Methods (m)"
                            href="#"
                            onClick={this.goToPlotMethods}><FaHammer/></a>
                        <a
                            data-tip="Edit (e)"
                            href="#"
                            onClick={this.goToPlotEditing}><AiOutlineEdit/></a>
                        <a data-tip="Export data" href="#"><AiOutlineExport/></a>
                        <a data-tip="Remove (supr)" href="#" onClick={this.removePlot}><AiOutlineDelete color="red"/></a>
                    </div> 
                </IconContext.Provider>
                <ReactTooltip multiline disable={this.props.session.settings ? !this.props.session.settings.showTooltips : false}/>
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
