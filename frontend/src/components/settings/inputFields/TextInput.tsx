import { FC } from 'react'
import TextField from '@material-ui/core/TextField'
import { InputFieldProps } from '../InputField'

const Text:FC<InputFieldProps<string>> = props => {
    const value = props.value || ""

    return (
        <TextField
            variant="outlined"
            value={value}
            onChange={(e) => props.onChange(e.target.value)}
            label={props.label}
            style={{width: "100%", ...props.style}}
            {...(props.inputField ? props.inputField.params : {})}/>
    )
}

export default Text;
