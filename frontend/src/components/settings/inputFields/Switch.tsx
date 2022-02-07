import { FC } from 'react'
import Switch from '@material-ui/core/Switch'
import { InputFieldProps } from '../InputField';

const SwitchInput:FC<InputFieldProps<boolean>> = props => {
    const id = props.id || (props.setting ? props.setting.key : "")
    return (
        <div className="container">
            <div style={{paddingBottom: 10}}>{props.label}</div>
            <Switch
                id={id}
                checked={props.value}
                onChange={(e) => props.onChange(e.target.checked) }
                {...(props.inputField ? props.inputField.params : undefined)}/>
        </div>
    )
}

export default SwitchInput;
