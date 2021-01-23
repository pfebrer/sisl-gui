import React, { Component } from 'react'
import ReactMarkDown from "react-markdown"
import PythonApi from '../../apis/PythonApi'
import { ExpansionPanel, ExpansionPanelSummary, ExpansionPanelDetails, Button, ExpansionPanelActions } from '@material-ui/core'

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

        return 
    }

    render() {

        return (
            <ExpansionPanel>
                <ExpansionPanelSummary
                    style={{display: "flex", cursor: "pointer", justifyContent: "space-between", alignItems: "center"}}>
                    <span style={{color: "gray", marginRight: 10}}>{this.props.shortcut}</span>
                    <span style={{fontWeight: "bold"}}>{this.props.info.name}</span>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails style={{fontSize: 13}}>
                    <ReactMarkDown source={this.props.info.description}/>
                </ExpansionPanelDetails>
                <ExpansionPanelActions>
                    <Button onClick={this.applyMethod}>APPLY METHOD</Button>
                </ExpansionPanelActions>
            </ExpansionPanel>
        )
    }
}
