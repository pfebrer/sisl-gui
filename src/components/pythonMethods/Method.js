import React, { Component } from 'react'
import ReactMarkDown from "react-markdown"
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io'
import PythonApi from '../../apis/PythonApi'

export default class Method extends Component {

    constructor(props){
        super(props)

        this.state = {
            showingDetails: false
        }
    }

    applyMethod = () => {
        PythonApi.callPlotShortcut(this.props.plot.id, this.props.shortcut)
    }

    renderDetails = () => {

        return <div style={{transition: "all 1s", maxHeight: this.state.showingDetails ? undefined : 0, overflow: "hidden"}}>
            <div style={{padding: 20, fontSize: 13}}>
                <ReactMarkDown source={this.props.info.description}/>
            </div>
            <div onClick={this.applyMethod} style={{cursor: "pointer"}}>APPLY METHOD</div>
        </div>
    }

    render() {

        const iconRot = this.state.showingDetails ? "rotate(180deg)" : "rotate(0)"
        const headerColor =  this.state.showingDetails ? "#ccc" : "whitesmoke"
        return (
            <div>
                <div
                    className="hoverable"
                    style={{display: "flex", padding: 20, cursor: "pointer", justifyContent: "space-between", alignItems: "center", backgroundColor: headerColor, transition: "all 500ms"}} 
                    onClick={() => this.setState({showingDetails: !this.state.showingDetails})}>
                    <div>
                        <span style={{color: "gray", marginRight: 10}}>{this.props.shortcut}</span>
                        <span style={{fontWeight: "bold"}}>{this.props.info.name}</span>
                    </div>
                    <IoIosArrowDown style={{transition: "all 500ms", transform: iconRot}}/>
                </div>
                {this.renderDetails()}
            </div>
        )
    }
}
