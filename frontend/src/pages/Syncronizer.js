import { Component } from 'react'
import { connect } from 'react-redux'
import PythonApi from '../apis/PythonApi'
import { addPlots, setCurrentSession } from "../redux/actions"

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

const mapDispatchToProps = {
    setCurrentSession,
    addPlots,
}

export default connect(null, mapDispatchToProps)(Syncronizer);
