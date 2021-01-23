import React, { Component } from 'react'

export default class PlotableTag extends Component {

    constructor(props){
        super(props)

        this.state = {}
    }

    render() {

        return (
            <div 
                className={"plotableTag " + (this.props.plotable.selected ? "active" : "")} 
                onClick={this.props.togglePlotable}
                data-tip={this.props.plotable.path}
                data-effect="solid">
                <div>{this.props.plotable.name}</div>
                <div style={{fontSize: "0.7em", color: "gray"}}>{".../" + this.props.plotable.path.split("/").slice(-2,-1)[0]}</div>
            </div>
        )
    }
}

