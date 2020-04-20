import React, { Component } from 'react'
import Method from './Method'

export default class Methods extends Component {
    render() {
        return (
            <div style={{textAlign: "left", backgroundColor: "white", borderRadius: 3, overflow: "hidden"}}>
                {Object.keys(this.props.plot.shortcuts).map((sequence) => <Method plot={this.props.plot} shortcut={sequence} info={this.props.plot.shortcuts[sequence]}/>)}
            </div>
        )
    }
}
