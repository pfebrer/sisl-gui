import React, { Component } from 'react'
import InputField from '../InputField'
import TextField from '@material-ui/core/TextField'

export default class Numeric extends Component {
    render() {

        const additionalProps = this.props.inputField ? this.props.inputField.params : {}

        const value = this.props.value || ""
        const label = this.props.label || (this.props.setting ? this.props.setting.name : "")

        return (
            <div>
                <TextField
                    type="number"
                    label={label}
                    value={value}
                    onChange={(e) => this.props.onChange( InputField.number(e.target.value) )}
                    style = {this.props.style}
                    variant="outlined"
                    {...additionalProps}/>
            </div>
        )
    }
}
