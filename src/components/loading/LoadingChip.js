import React, { Component } from 'react'

import moment from "moment"
import { informLoadedPlot } from '../../redux/actions';

import {connect} from "react-redux"

class LoadingChip extends Component {

    constructor(props){
        super(props)

        this.state = {
            time: Date.now()
        }
    }

    componentDidMount(){
        this.interval = setInterval(() => this.setState({ time: Date.now() }), 1000);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    getLoadingTime = (loadingInit) => {

        return moment(moment().diff(loadingInit)).format("mm:ss")
    }

    render() {

        console.warn(this.props.info)

        let processName = this.props.info.name
        
        if (!processName && this.props.info.struct){
            processName = this.props.info.struct.name ? [this.props.info.struct.name.replace(".fdf", ""), this.props.info.plotClass].join(" ") : "No name"
        }
        let elapsed = this.getLoadingTime(this.props.info.from)

        return (
            <div className="loadingChip">
                <span style={{paddingRight: 10}}>{processName}</span>
                <span>{elapsed}</span>
                <span className="removeTabBut" onClick={() => this.props.informLoadedPlot(this.props.info.id)}>X</span>
            </div>
        )
    }
}


const mapDispatchToProps = {
    informLoadedPlot
}

export default connect(null, mapDispatchToProps)(LoadingChip);
