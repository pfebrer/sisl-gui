import React, { Component } from 'react'
import Switch from 'react-materialize/lib/Switch'

export default class SwitchInput extends Component {
    render() {
        return (
            <div style={{display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center"}}>
                <div style={{paddingBottom: 10}}>{this.props.setting.name}</div>
                <Switch
                    id = {this.props.setting.key}
                    checked={this.props.value}
                    onChange={(e) => this.props.onChange(e.target.checked) }
                    {...this.props.inputField.params}/>
            </div>
        )
    }
}
