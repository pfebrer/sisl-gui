import { FC } from 'react'
import { InputFieldProps, number } from '../InputField'
import { TextField } from '@material-ui/core'

const Range:FC<InputFieldProps<(string|number)[]>> = props => {
    const value = props.value != null ? props.value : ["", ""]

    return (
        <div>
            <div style={{paddingBottom: 10}}>{props.setting.name}</div>
            <div style={{display: 'flex'}}>
                <TextField
                    style={{marginRight: 30, flex:1}}
                    type="number"
                    variant="outlined"
                    label="min"
                    value={value[0]}
                    onChange={(e) => value[1] >= Number(e.target.value) ? 
                        props.onChange( [number(e.target.value), value[1]] ) : null}
                    {...props.inputField.params}/>
                <TextField
                    style={{marginLeft: 30, flex:1}}
                    type="number"
                    variant="outlined"
                    label="max"
                    value={value[1]}
                    onChange={(e) => Number(e.target.value) >= value[0] ? 
                        props.onChange( [value[0], number(e.target.value)] ) : null }
                    {...props.inputField.params}/>
            </div>
            
        </div>
    )
}

export default Range;
