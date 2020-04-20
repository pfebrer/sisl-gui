import React, { Component } from 'react'
import InputField from '../InputField'

export default class Numeric extends Component {
    render() {

        const additionalProps = this.props.inputField ? this.props.inputField.params : {}

        const value = this.props.value || "" 

        return (
            <div>
                {this.props.setting ? <div style={{paddingBottom: 10}}>{this.props.setting.name}</div> : null}
                <input
                    type="number"
                    value={value}
                    onChange={(e) => this.props.onChange( InputField.number(e.target.value) )}
                    style = {this.props.style}
                    {...additionalProps}/>
            </div>
        )
    }
}
