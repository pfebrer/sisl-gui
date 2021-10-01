import React, { Component } from 'react'

import { Range, createSliderWithTooltip } from 'rc-slider'
import 'rc-slider/assets/index.css';

const RangeWithTooltip = createSliderWithTooltip(Range)

export default class RangeSlider extends Component {
    render() {

        const value = this.props.value || [0,0]

        return (
            <div style={{paddingLeft: "10%", paddingRight: "10%"}}>
                <div style={{paddingBottom: 10}}>{this.props.setting.name}</div>
                <RangeWithTooltip
                    value={value}
                    onChange={(value) => this.props.onChange(value)}
                    {...this.props.inputField.params}
                    />
            </div>
        )
    }
}
