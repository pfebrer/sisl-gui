import { ChangeEvent, FC } from 'react'
import { InputFieldProps, number } from '../InputField'
import { TextField } from '@material-ui/core'

const Range:FC<InputFieldProps<(string|number|null)[]>> = props => {
    const value = props.value != null ? props.value : ["", ""]

    const handleChange = (
        e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement >, 
        i:number, oldValue: (string|number|null)[]
    ) => {
        const newVal = number(e.target.value)
        let valid = true;
        if (typeof newVal === "number"){
            if (i === 0 && typeof oldValue[1] === "number") valid = newVal <= oldValue[1]
            if (i === 1 && typeof oldValue[0] === "number") valid = newVal >= oldValue[0]
        }

        if (valid) {
            const finalVal = i === 0 ? [newVal, oldValue[1]] : [oldValue[0], newVal]
            props.onChange(finalVal)
        }
    }

    return (
        <div>
            <div style={{paddingBottom: 10}}>{props.label}</div>
            <div style={{display: 'flex'}}>
                <TextField
                    style={{marginRight: 30, flex:1}}
                    type="number"
                    variant="outlined"
                    label="min"
                    value={value[0]}
                    onChange={(e) => handleChange(e, 0, value)}
                    {...(props.inputField ? props.inputField.params : undefined)}/>
                <TextField
                    style={{marginLeft: 30, flex:1}}
                    type="number"
                    variant="outlined"
                    label="max"
                    value={value[1]}
                    onChange={(e) => handleChange(e, 1, value)}
                    {...(props.inputField ? props.inputField.params : undefined)}/>
            </div>
            
        </div>
    )
}

export default Range;
