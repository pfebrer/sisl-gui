import { FC, useState } from 'react'
import { ChromePicker } from 'react-color';
import { InputFieldProps } from '../InputField';

const ColorPicker:FC<InputFieldProps<string>> = (props) => {
    const [tempcolor, setTempcolor] = useState<string | undefined>(undefined)
    const [showColorPicker, setShowColorPicker] = useState(false)

    let colorPicker = showColorPicker ? (
        <div style={{position: "absolute", bottom: 60}}>
            <ChromePicker
                color={tempcolor || props.value || 'black'}
                onChange={(color) => {setTempcolor(color.hex)}}
                onChangeComplete={(color) => {props.onChange(color.hex); setTempcolor(undefined)}}
                {...props.inputField.params}/>
        </div>
    ) : null;

    return (
        <div style={{position: "relative",display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center"}}>
            <div style={{paddingBottom: 10}}>{props.setting.name}</div>
            <div 
                className="MuiPaper-elevation3"
                onClick={() => setShowColorPicker(!showColorPicker)}
                style={{width: 30, height: 30, borderRadius: 30, background: props.value}}/>
            
            {colorPicker}
        </div>
    )

}

export default ColorPicker;
