import React, { Component } from 'react'

import _ from 'lodash'
import Autocomplete from '@material-ui/lab/Autocomplete';
import { TextField } from '@material-ui/core';

export default class Dropdown extends Component {

    get multiple(){
        return this.props.inputField.params.isMulti
    }

    get options(){
        return this.props.inputField.params.options
    }

    handleChange = (event, value, reason) => {

        value = this.getValueFromObj(value)

        this.props.onChange(value)
    }

    getValueFromObj = (obj) => {
        let value;
        if (this.multiple && Array.isArray(obj)) {
            value = obj.map(this.getValueFromObj)
        } else if (typeof obj === 'string'){
            // A new value is being created
            value = obj
        } else if (obj !== null) {
            value = obj.value
        }

        return this.sanitizeValue(value)
    }

    getObjFromValue = (value) => {
        let obj;
        if (this.multiple && Array.isArray(value)) {
            obj = value.map(this.getObjFromValue)
        } else if (value != null) {
            obj = _.find(this.options, { value: value })
            if (obj == null){
                // This is a value that is not in the options.
                obj = {value:value, label:value}
            }
        }

        return this.sanitizeValue(obj)
    }

    sanitizeValue = (value) => {
        if (value === null){
            value = this.multiple ? [] : null
        }
        return value
    }

    render() {

        const label = this.props.label || (this.props.setting ? this.props.setting.name : "")
        const value = this.getObjFromValue(this.props.value)
        const disableClearable = ! this.props.inputField.params.isClearable
        const freeSolo = this.props.inputField.params.isCreatable

        return (
                <Autocomplete
                    fullWidth
                    freeSolo={freeSolo}
                    multiple={this.multiple}
                    disableClearable={disableClearable}
                    value={value}
                    onChange={this.handleChange}
                    getOptionLabel={(option) => option.label}
                    options={this.options}
                    //helperText={this.props.setting.help}
                    renderInput={(params) => <TextField {...params} label={label} variant="outlined" />}
                />
            
        )
    }
}
