import { FC } from 'react'
import NumericInput from './Numeric'

import _ from "lodash"
import { InputFieldProps } from '../InputField'

const ArrayInput:FC<InputFieldProps<number[]>> = (props) => {

    const changeValue = (newVal:string|number|undefined, i:number) => {
        let value = _.cloneDeep(props.value)

        if (typeof newVal === "string" || typeof newVal === "undefined") return

        if(!value){
            value = handleNone()
        }

        value[i] = newVal

        props.onChange(value)
    }

    const handleNone = () => {
        return Array((props.inputField.params.shape || [1])[0]).fill(null)
    }

    //Params to pass to numeric inputs
    const orientationStyles = props.inputField.params.vertical ? {
        marginLeft: 20, marginRight: 20, marginBottom: 0, width: 70
    } : {
        marginLeft: 5, marginRight: 5, marginBottom: 0, width: 100
    }
    const inputStyle = { ...orientationStyles, textAlign: "center"}

    let value = props.value

    if (!value){
        value = handleNone()
    }

    return (
        <div style={{display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center"}}>
            <div style={{paddingBottom: 10}}>{props.setting.name}</div>
            <div style={{display: "flex", flexDirection: props.inputField.params.vertical ? "column" : "row", justifyContent: "center", alignItems: "center"}} className="arrayContainer">
                {value.map((val, i) => <NumericInput key={i} value={val} onChange={(val) => changeValue(val, i)} style={inputStyle}/>)}
            </div>  
        </div>
    )
}
export default ArrayInput;
