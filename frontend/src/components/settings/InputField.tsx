import { FC, HTMLAttributes } from 'react'

//--Redux
import { connect } from 'react-redux'
import { changeSettings } from "../../redux/actions"

/*  All the different input fields */
import TextInput from './inputFields/TextInput';
import Switch from './inputFields/Switch';
import Dropdown from './inputFields/Dropdown';
import ColorPicker from './inputFields/ColorPicker';
import RangeSlider from './inputFields/RangeSlider';
import Range from './inputFields/Range';
import Numeric from './inputFields/Numeric';
import ArrayInput from './inputFields/Array';
import ListInput from './inputFields/List';
import CreatableDropdown from './inputFields/CreatableDropown';
import DictInput from './inputFields/DictInput';
import CreatableDictInput from './inputFields/CreatableDict';

import "./input_styles.css"


export const INPUT_FIELDS:any = {
    textinput: TextInput,
    bool: Switch,
    options: Dropdown,
    "creatable options": CreatableDropdown,
    dict: DictInput,
    "creatable dict": CreatableDictInput,
    color: ColorPicker,
    rangeslider: RangeSlider,
    range: Range,
    number: Numeric,
    vector: ArrayInput,
    list: ListInput,
}

export const number = (value: string | number) : (string | number) => {
    if (typeof value === "string") {
        if (["", "-"].includes(value)) return value
    }
    return Number(value)
}

export const changeSettingValue = (
    newValue: any, 
    props: MasterInputFieldProps
) => {

    if (props.onValueChange){
        props.onValueChange(newValue)
    } else if (props.changeSettings && props.onSettingChangeType && props.onSettingChangeExtraParams) {
        props.changeSettings(props.onSettingChangeType, props.setting.key, newValue, props.onSettingChangeExtraParams)
    } else {
        console.error("Wrong usage of changeSettingValue")
    }

}

export interface InputFieldInterface {
    type: string,
    params: {[key:string]: any},
    style?: HTMLAttributes<HTMLDivElement>,
    [key:string]: any
}

export interface SettingInterface {
    key: string,
    name: string,
    default: any,
    value: any,
    help?: string
    inputField: InputFieldInterface
}

export interface MasterInputFieldProps {
    setting: SettingInterface,
    value: any,
    onValueChange?: (value: any) => void,
    changeSettings?: (type: string, key: string, value: any, extraParams: any) => void,
    onSettingChangeType?: string,
    onSettingChangeExtraParams?: any,
}

export interface InputFieldProps<T> {
    id: string,
    inputField: InputFieldInterface,
    value: T,
    label: string,
    setting: SettingInterface,
    onChange: (value: T) => void,
    style?: Object
}

const InputField:FC<MasterInputFieldProps> = (props) => {

    let inputField = props.setting.inputField

    // Get the input field that we need
    const InputComponent = INPUT_FIELDS[inputField.type]
    
    if (!InputComponent) return null

    const fieldLayout = <InputComponent
        {...props}
        inputField={inputField}
        onChange={(value: any) => changeSettingValue(value, props)}
    />

    let tooltipParams = {
        "data-tip": (props.setting.help ? props.setting.help + "<br>" : "") + "Default: " + (props.setting.default || "None"),
        "data-multiline": true,
        "data-effect": "solid",
        "data-place": inputField.type === "color" ? "bottom" : "top", 
    }

    let className = "InputField_container"
    if (props.value == null) className = className + " inputvalue_None"

    return <div
        className={className}
        onClick={(e) => inputField.type !== "queries" && e.ctrlKey ? changeSettingValue(props.value == null ? props.setting.default : null, props) : null}
        style={{...inputField.style}}
        {...tooltipParams}>
            {fieldLayout}
        </div>


}

const mapStateToProps = (state: any) => ({
    browser: state.browser
})

const mapDispatchToProps = {
    changeSettings,
}

export default connect(mapStateToProps, mapDispatchToProps)(InputField);