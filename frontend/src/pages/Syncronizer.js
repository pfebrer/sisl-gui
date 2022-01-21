import { Component } from 'react'
import { connect } from 'react-redux'
import PythonApi from '../apis/PythonApi'
import {
    addPlots, setNewStructures, setActiveTab, setActivePlot,
    setSessionTabs, setCurrentSession, setNewPlotables, setActivePage
} from "../redux/actions"

class Syncronizer extends Component {

    constructor(props){
        super(props)

        document.addEventListener("syncWithSession", (e) => this.syncWithSession(e.detail.session) )

        document.addEventListener("updateTabs", () => this.syncWithSession())

        // document.addEventListener("loadingPlot", (e) => {
        //     this.setState({ loadingPlots: [...this.state.loadingPlots, e.detail.plot_id] })
        // })

        document.addEventListener("plot", (e) => {
            const plot = e.detail.plot
            props.addPlots({ [plot.id]: plot })
            // this.setState({ loadingPlots: this.state.loadingPlots.filter(id => id !== plot.id) })
        })

        document.addEventListener("newPlot", () => this.syncWithSession())

        document.addEventListener("sessionUpdate", (e) => {
            e.detail.justUpdated.forEach( plotID => {
                
                PythonApi.getPlot(plotID)

            })

        })
            
    }

    syncWithSession = (session) => {

        if (!session) {
            return PythonApi.askForSession()
        }
        
        this.props.setCurrentSession(session)
        
    }

    render() {
        return null
    }
}

const mapStateToProps = state => ({
    plots: state.plots,
    structures: state.session.structures,
    tabs: state.session.tabs,
    active: state.active,
    session: state.session
})

const mapDispatchToProps = {
    setCurrentSession,
    setActiveTab,
    setSessionTabs,
    setActivePlot,
    addPlots,
    setNewStructures,
    setNewPlotables,
    setActivePage
}

export default connect(mapStateToProps, mapDispatchToProps)(Syncronizer);
