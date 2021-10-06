import React, { Component } from 'react'

import { Slider } from '@material-ui/core'

export default class RangeSlider extends Component {

    onChange = (event, value) => {
        this.props.onChange(value)
    }

    render() {

        let { min, max, step, marks } = this.props.inputField.params
        marks = Array.isArray(marks) ? marks : undefined

        const value = this.props.value || [0,0]

        return (
            <div>
                <div style={{paddingBottom: 10}}>{this.props.setting.name}</div>
                <Slider
                    getAriaLabel={() => this.props.setting.name}
                    value={value}
                    onChange={this.onChange}
                    valueLabelDisplay="auto"
                    min={min} max={max} step={step}
                    marks={marks}
                />
            </div>
        )
    }
}
