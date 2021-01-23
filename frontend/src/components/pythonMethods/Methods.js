import React, { Component } from 'react'
import Method from './Method'

export default class Methods extends Component {
    render() {
        return (
            <div className="scrollView" style={{textAlign: "left", borderRadius: 3, maxHeight: "90vh"}}>
                {Object.keys(this.props.plot.shortcuts).map((sequence) => <Method plot={this.props.plot} shortcut={sequence} info={this.props.plot.shortcuts[sequence]}/>)}
            </div>
        )
    }
}
