import { FC, MouseEvent } from 'react'

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

import { InputFieldInterface, ParamInterface } from '../../interfaces';

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

export const number = (value: string | number) : (string | number | null) => {
    if (typeof value === "string") {
        if (value === "") return null
        if (["-", "."].includes(value)) return value
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

export interface MasterInputFieldProps {
    setting: ParamInterface,
    value: any,
    onValueChange?: (value: any) => void,
    changeSettings?: (type: string, key: string, value: any, extraParams: any) => void,
    onSettingChangeType?: string,
    onSettingChangeExtraParams?: any,
    style?: any
}

export interface InputFieldProps<T> {
    id?: string,
    inputField?: InputFieldInterface,
    setting?: ParamInterface,
    value: T,
    label: string,
    onChange: (value: T) => void,
    style?: Object
}

const InputField:FC<MasterInputFieldProps> = (props) => {

    let inputField = props.setting.inputField

    // Get the input field that we need
    const InputComponent = INPUT_FIELDS[inputField.type]
    
    if (!InputComponent) return null

    const label = props.setting ? props.setting.name : ""
    const fieldLayout = <InputComponent
        {...props}
        label={label}
        inputField={inputField}
        onChange={(value: any) => changeSettingValue(value, props)}
    />

    const handleClick = (e:MouseEvent) => {
        if (e.ctrlKey) {
            e.stopPropagation()
            changeSettingValue(props.value == null ? props.setting.default : null, props)
        }
    }

    let tooltipParams = {
        "data-tip": (props.setting.help ? props.setting.help + "<br>" : "") + "Default: " + (props.setting.default || "None"),
        "data-multiline": true,
        "data-effect": "solid",
        "data-place": inputField.type === "color" ? "bottom" : "top", 
    }

    let className = `SISL_INPUTFIELD SISL_INPUTFIELD_${inputField.type.replace(/ /g, "_")} SISL_SETTING_${props.setting.key} `
    if (props.value == null) className = className + " inputvalue_None"

    return <div
        className={className}
        onClick={handleClick}
        style={props.style}
        {...tooltipParams}>
            {/* <div>{props.setting.key}</div> */}
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