import { FC } from 'react'

import InputField, { InputFieldProps } from '../InputField';
import { ParamInterface } from '../../../interfaces';

interface Value {
    [key: string]: any
}

const DictInput:FC<InputFieldProps<Value>> = props => {

    const changeSettingValue = (paramKey:string, paramValue:any) => {
        props.onChange({ ...props.value, [paramKey]: paramValue })
    }

    const value = props.value || {}
        const fields = props.setting.inputField.fields || []

        return (
            <div className="DictInput_container" style={props.style}>
                <div style={{paddingBottom: 10}}>{props.setting.name}</div>
                <div>
                    {fields.map((field:ParamInterface) => <InputField
                        //id={field.key}
                        key={field.key}
                        setting={field}
                        value={value[field.key]}
                        onValueChange={(val) => changeSettingValue(field.key, val)} />)}
                </div>
            </div>
            
        )


}

export default DictInput;