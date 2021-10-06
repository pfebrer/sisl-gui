import React, { Component } from 'react'

import InputField from '../InputField';

export default class DictInput extends Component {

    constructor(props){
        super(props)

        this.state = {
            displayColorPicker: {}
        }
    }

    changeSettingValue = (paramKey, paramValue) => {
        this.props.onChange({ ...this.props.value, [paramKey]: paramValue })
    }

    render() {

        const value = this.props.value || {}

        return (
            <div className="DictInput_container" style={this.props.style}>
                <div style={{paddingBottom: 10}}>{this.props.setting.name}</div>
                <div>
                    {this.props.setting.inputField.fields.map(field => <InputField
                        id={field.key}
                        setting={field}
                        value={value[field.key]}
                        onValueChange={(val) => this.changeSettingValue(field.key, val)} />)}
                </div>
            </div>
            
        )
    }
}
