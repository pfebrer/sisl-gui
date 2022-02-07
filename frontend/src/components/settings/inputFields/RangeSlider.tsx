import { FC } from 'react'

import { Slider } from '@material-ui/core'
import { InputFieldProps } from '../InputField'

const RangeSlider:FC<InputFieldProps<number|number[]>> = props => {

    const params = props.inputField ? props.inputField.params : {}
    let { min, max, step, marks} = params
    marks = Array.isArray(marks) ? marks : undefined

    const value = props.value || [0,0]

    return (
        <div className="container">
            <div style={{paddingBottom: 10}}>{props.label}</div>
            <Slider
                getAriaLabel={() => props.label}
                value={value}
                onChange={(event, value) => props.onChange(value)}
                valueLabelDisplay="auto"
                min={min} max={max} step={step}
                marks={marks}
            />
        </div>
    )

}

export default RangeSlider;
