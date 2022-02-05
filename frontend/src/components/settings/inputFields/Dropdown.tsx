import { FC } from 'react'

import _ from 'lodash'
import Autocomplete from '@material-ui/lab/Autocomplete';
import { TextField } from '@material-ui/core';
import { ParamInterface, InputFieldInterface } from '../../../interfaces';

export interface DropdownProps{
    id?: string,
    inputField: InputFieldInterface,
    value: any[]|any,
    label?: string,
    setting?: ParamInterface,
    onChange: (value: any[]|any) => void,
    style?: Object
}

const Dropdown:FC<DropdownProps> = props => {
    const label = props.label || (props.setting ? props.setting.name : "")
    // Parameters that define the behavior of the dropdown
    const disableClearable = ! props.inputField.params.isClearable
    const freeSolo = props.inputField.params.isCreatable
    const multiple = props.inputField.params.isMulti
    const options = props.inputField.params.options

    const handleChange = (event:any, value:any, reason: string) => {

        value = getValueFromObj(value)

        props.onChange(value)
    }

    const getValueFromObj = (obj:any):any => {
        let value;
        if (multiple && Array.isArray(obj)) {
            value = obj.map(getValueFromObj)
        } else if (typeof obj === 'string'){
            // A new value is being created
            value = obj
        } else if (obj !== null) {
            value = obj.value
        }

        return sanitizeValue(value)
    }

    const getObjFromValue = (value:any):any => {
        let obj;
        if (multiple && Array.isArray(value)) {
            obj = value.map(getObjFromValue)
        } else if (value != null) {
            obj = _.find(options, { value: value })
            if (obj == null){
                // This is a value that is not in the options.
                obj = {value:value, label:value}
            }
        }

        return sanitizeValue(obj)
    }

    const sanitizeValue = (value: any):any => {
        if (value === null){
            value = multiple ? [] : null
        }
        return value
    }

    const value = getObjFromValue(props.value)

    return (
            <Autocomplete
                fullWidth
                freeSolo={freeSolo}
                multiple={multiple}
                disableClearable={disableClearable}
                value={value}
                onChange={handleChange}
                getOptionLabel={(option) => option.label}
                options={options}
                //helperText={this.props.setting.help}
                renderInput={(params) => <TextField style={{width: "100%"}} {...params} label={label} variant="outlined" />}
            />
        
    )
}

export default Dropdown;
