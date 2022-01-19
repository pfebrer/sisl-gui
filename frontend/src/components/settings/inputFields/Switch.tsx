import { FC } from 'react'
import Switch from '@material-ui/core/Switch'
import { InputFieldProps } from '../InputField';

const SwitchInput:FC<InputFieldProps<boolean>> = props => {
    return (
        <div style={{display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center"}}>
            <div style={{paddingBottom: 10}}>{props.setting.name}</div>
            <Switch
                id = {props.id || props.setting.key}
                checked={props.value}
                onChange={(e) => props.onChange(e.target.checked) }
                {...props.inputField.params}/>
        </div>
    )
}

export default SwitchInput;
