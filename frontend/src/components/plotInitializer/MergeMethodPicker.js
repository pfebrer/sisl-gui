import React from 'react'
import Dropdown from '../settings/inputFields/Dropdown'

const OPTIONS = [
    {label: "Plot individually", value:"separatePlot"},
    {label: "Merge in single plot", value:"jointPlot"},
    {label: "Build animation", value:"jointAnimation"},
    {label: "Animation for each", value:"separateAnimation"},
]

const MergeMethodPicker = (props) => {

    const value = props.value
    if (value == null) {
        props.onChange(OPTIONS[0].value)
    }

    const inputField = {
        params: {
            options: OPTIONS,
            isClearable: false, isMulti: false,
        }
    }

    return (
        <Dropdown
            value={value}
            inputField={inputField}
            onChange={props.onChange}
            label="Plotting method"
        />   
    )
}

export default MergeMethodPicker