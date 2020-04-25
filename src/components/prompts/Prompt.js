import React, { Component } from 'react'
import { toast } from 'react-toastify'

export class Prompt extends Component {

    constructor(props){
        super(props)

        this.state = {
            value: ""
        }
    }

    componentWillUnmount(){
        this.props.callback(this.state.value)
    }

    render() {
        return (
            <div>
                <div>{this.props.content}</div>
                <input value={this.state.value} onChange={(e) => {this.setState({value: e.target.value})}}/>
                <button onClick={this.props.closeToast}>Submit</button>
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
        <div>Do you want to specify a different address for the API? (host:port)</div>
    </div>

    prompt(content, callback, props)

}

export const authPrompt = (callback, props) => {

    const content = <div>
        <div>Authorization is required</div>
        <div>We need you to provide your username:</div>
    </div>

    prompt(content, callback, props)

} 

export default prompt;
