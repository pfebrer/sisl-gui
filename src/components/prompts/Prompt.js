import React, { Component } from 'react'
import { toast } from 'react-toastify'

import TextInput from "../settings/inputFields/TextInput"
import { Button } from '@material-ui/core'

export class Prompt extends Component {

    constructor(props){
        super(props)

        this.state = {
            value: ""
        }

        if (props.controlClose){
            props.controlClose(props.closeToast)
        }
    }

    componentWillUnmount(){
        this.props.callback(this.state.value)
    }

    render() {
        return (
            <div>
                <div style={{paddingBottom: 10}}>{this.props.content}</div>
                <TextInput value={this.state.value} onChange={(value) => {this.setState({value})}} label={this.props.inputProps.label}/>
                <Button onClick={this.props.closeToast}>Submit</Button>
            </div>
        )
    }

}

const prompt = (content, callback, props) => {

    toast(<Prompt content={content} callback={callback} {...props}/>, {autoClose: false, closeOnClick: false, onClose: (arg) => {console.warn(arg)} })

}

export const connectionPrompt = (currentAddress, callback, props) => {

    const content = <div>
        <div>{"Couldn't connect to " + currentAddress}</div>
        <div>Do you want to specify a different address for the API?</div>
        <div> (http(s)://host:port)</div>
    </div>

    prompt(content, callback, {inputProps: {label: "New address" }, ...props})

}

export const authPrompt = (callback, props) => {

    const content = <div>
        <div>Authorization is required</div>
        <div>We need you to provide your username:</div>
    </div>

    prompt(content, callback, { inputProps: { label: "Username" }, ...props })

} 

export default prompt;
