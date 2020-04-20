import React, { Component } from 'react'

export default class StructureTag extends Component {

    constructor(props){
        super(props)

        this.state = {}
    }

    render() {

        return (
            <div 
                className={"structTag " + (this.props.struct.selected ? "active" : "")} 
                onClick={this.props.toggleStruct}
                data-tip={this.props.struct.path}
                data-effect="solid">
                <div>{this.props.struct.name.replace(".fdf", "")}</div>
                <div style={{fontSize: "0.7em", color: "gray"}}>{".../" + this.props.struct.path.split("/").slice(-2,-1)[0]}</div>
            </div>
        )
    }
}




