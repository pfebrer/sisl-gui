import { FC } from 'react'

import { Slider } from '@material-ui/core'
import { InputFieldProps } from '../InputField'

const RangeSlider:FC<InputFieldProps<number|number[]>> = props => {

    let { min, max, step, marks } = props.inputField.params
    marks = Array.isArray(marks) ? marks : undefined

    const value = props.value || [0,0]

    return (
        <div className="container">
            <div style={{paddingBottom: 10}}>{props.setting.name}</div>
            <Slider
                getAriaLabel={() => props.setting.name}
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
