import React, { Component } from 'react'
import TextField from '@material-ui/core/TextField'


export default class Text extends Component {
    render() {

        const value = this.props.value || ""

        const label = this.props.label || (this.props.setting ? this.props.setting.name : "")

        return (
            <TextField
                variant="outlined"
                value={value}
                onChange={(e) => this.props.onChange(e.target.value)}
                label={label}
                style={{width: "100%", ...this.props.style}}
                {...(this.props.inputField ? this.props.inputField.params : this.props.params)}/>
        )
    }
}
