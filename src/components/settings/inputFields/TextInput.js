import React, { Component } from 'react'
import TextInput from 'react-materialize/lib/TextInput'


export default class Text extends Component {
    render() {

        const value = this.props.value || "" 

        return (
            <TextInput
                noLayout
                value={value}
                onChange={(e) => this.props.onChange(e.target.value)}
                label={this.props.setting.name}
                {...this.props.inputField.params}/>
        )
    }
}
