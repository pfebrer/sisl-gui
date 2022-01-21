import React, { Component } from 'react'

import _ from "lodash"

//--Components
import PlotDashboard from '../components/plots/PlotDashboard';

//--Python api 
import PythonApi from '../apis/PythonApi'

//--Redux
import { connect } from 'react-redux'
import { setActivePlot, setActivePage} from "../redux/actions"
import PlotInitializer from '../components/plotInitializer/PlotInitializer'
import PlotTweaking from './PlotTweaking'

import { Button, Toolbar} from '@material-ui/core';

import {getApplicationKeyMap, GlobalHotKeys, configure} from 'react-hotkeys'
import PlotMethods from './PlotMethods';
import PlotEditor from './PlotEditor';
import { GLOBAL_HOT_KEYS } from '../utils/hotkeys';

configure({logLevel: "debug", simulateMissingKeyPressEvents: false})

class Plots extends Component {

    state= {
        structPickerState: {
            searchString: "",
            alphabeticSorting: false,
            selectedSorting: false,
            searchByFolder: false,
            displayStructures: true,
            displayPlotables: false,
        }
    }

    hotKeysHandlers = {
        GO_TO_DASHBOARD: () => this.props.setActivePage("plots"),
        SHOW_AVAIL_HOTKEYS: () => console.warn(getApplicationKeyMap())
    }

    componentDidMount(){

        //this.props.setActivePlot(undefined)

        //Add the listener to display or not the plot initializer
        this.listener = document.addEventListener("togglePlotInitializer", this.togglePlotInitializer)

    }

    componentDidUpdate(){

        let activeTab = _.find(this.props.tabs, ["id", this.props.active.tab]) 
        
        if (!activeTab) return

        //Get the missing plots if there are any
        activeTab.plots.forEach(plotID => {

            if (!this.props.plots[plotID]){

                PythonApi.getPlot(plotID)
                
            }
        })

    }

    togglePlotInitializer = (e) => {

        let currentlyShowing = this.props.active.page === "plotInitializer"

        if (e !== undefined & e.detail !== undefined) {
            if (e.detail.forceShow &&  !currentlyShowing){
                this.props.setActivePage("plotInitializer")
            } if (e.detail.forceHide && currentlyShowing){
                this.props.setActivePage("plots")
            }
        } else {
            this.props.setActivePage(currentlyShowing ? "plots" : "plotInitializer")
        }

    }

    render() {

        if (!this.props.active.plot && !["plotInitializer", "plots"].includes(this.props.active.page)) {
            this.props.setActivePage("plots")
        }

        const MainComponent = {
            'plots': PlotDashboard,
            'plotLayoutEditor': PlotEditor,
            'plotTweaking': PlotTweaking,
            'plotMethods': PlotMethods,
            'plotInitializer': PlotInitializer,
        }[this.props.active.page]

        return <div style={{height: "100%", display: "flex", flexDirection: "column"}}>
                <GlobalHotKeys keyMap={{...GLOBAL_HOT_KEYS}} handlers={this.hotKeysHandlers}/>
                <Toolbar style={{backgroundColor: "#cccccc"}}>
                    {["plots", "plotInitializer"].includes(this.props.active.page) ? null :
                        <Button color="inherit" onClick={() => this.props.setActivePage("plots")}>BACK TO DASHBOARD</Button>
                    }
                </Toolbar>
                <MainComponent 
                    style={{flex: 1}} 
                    structPickerState={this.state.structPickerState}
                    setStructPickerState={(newState) => this.setState({structPickerState: newState})}
                    goto={this.props.setActivePage}
                />    
            </div>
    }
}

const mapStateToProps = state => ({
    plots: state.plots,
    tabs: state.session.tabs,
    active: state.active,
    session: state.session
})

const mapDispatchToProps = {
    setActivePlot,
    setActivePage
}

export default connect(mapStateToProps, mapDispatchToProps)(Plots);