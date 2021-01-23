import React, { Component } from 'react'

import { Range } from 'rc-slider'
import 'rc-slider/assets/index.css';

export default class RangeSlider extends Component {
    render() {

        const value = this.props.value || [0,0]

        return (
            <div style={{paddingLeft: "10%", paddingRight: "10%"}}>
                <div style={{paddingBottom: 10}}>{this.props.setting.name}</div>
                <Range
                    value={value}
                    onChange={(value) => this.props.onChange(value)}
                    {...this.props.inputField.params}
                    />
            </div>
        )
    }
}
