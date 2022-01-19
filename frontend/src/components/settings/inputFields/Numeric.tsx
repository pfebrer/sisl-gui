import { FC } from 'react'
import {number, InputFieldInterface, SettingInterface} from '../InputField'
import TextField from '@material-ui/core/TextField'

interface NumericProps {
    id?: string,
    inputField?: InputFieldInterface,
    value: number | string,
    label?: string,
    setting?: SettingInterface,
    onChange: (value: number | string) => void,
    style: Object
}

const Numeric:FC<NumericProps> = props => {
    const additionalProps = props.inputField ? props.inputField.params : {}
    const value = props.value || ""
    const label = props.label || (props.setting ? props.setting.name : "")

    return (
        <div>
            <TextField
                type="number"
                label={label}
                value={value}
                onChange={(e) => props.onChange( number(e.target.value) )}
                style = {props.style}
                variant="outlined"
                {...additionalProps}/>
        </div>
    )
}

export default Numeric;
