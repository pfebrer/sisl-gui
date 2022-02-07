import React, { FC } from 'react'
import { connect } from 'react-redux'
import { SessionInterface } from '../../interfaces'

import Dropdown from '../settings/inputFields/Dropdown'

interface PlotTypePickerProps {
    value: string[],
    onChange: (value: string[]) => void,
    options?: { value: string, label: string }[],
    session: SessionInterface
}

const PlotTypePicker:FC<PlotTypePickerProps> = (props) => {
    const plotOptions = props.options || props.session.plotOptions

    const inputField = {
        type: "dropdown",
        params: {
            options: plotOptions,
            isClearable: true, isMulti: true,
        }
    }

    return (
        <Dropdown
            value={props.value}
            inputField={inputField}
            onChange={props.onChange}
            label="Plot type"
        />
    )
}

const mapStateToProps = (state: any) => ({
    session: state.session
})

export default connect(mapStateToProps)(PlotTypePicker);