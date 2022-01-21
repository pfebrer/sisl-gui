import React, { Component } from 'react'
import PythonApi from '../../apis/PythonApi'
import { FiWifi, FiWifiOff } from 'react-icons/fi'

export default class ConnectionStatus extends Component {

    constructor(props){
        super(props)

        this.state = { connected: PythonApi.socket.connected }
    }

    componentDidMount() {
        PythonApi.onConnect(() => this.setState({connected: true}))
        PythonApi.onDisconnect(() => this.setState({ connected: false }))
    }

    render() {

        const style = this.state.connected ? { backgroundColor: "lightgreen" } : { backgroundColor: "salmon" }

        const addStyles = this.state.connected ? this.props.connectedStyle : this.props.disconnectedStyle

        return <div {...this.props} style={{...style, ...this.props.style, ...addStyles}}
                data-tip={this.state.connected ? `Connected to ${PythonApi.apiAddress}` : "Currently not connected"} 
                data-place="left"
                data-background-color={style.backgroundColor}>
            {this.state.connected ? <FiWifi color="green" size={20} /> : <FiWifiOff color="darkred" size={20}/>}
        </div>

    }
}
