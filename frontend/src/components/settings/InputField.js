import React, { Component } from 'react'

import _ from "lodash"

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


export const INPUT_FIELDS = {
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

export class InputField extends Component {

    constructor(props){
        super(props)

        this.state ={}
    }

    changeSettingValue = (newValue) => {

        if (this.props.onValueChange){
            this.props.onValueChange(newValue)
        } else {
            this.props.changeSettings(this.props.onSettingChangeType, this.props.setting.key, newValue, this.props.onSettingChangeExtraParams)
        }

    }

    static number = (value) => ["", "-"].includes(value) ? value : Number(value)

    render() {

        let inputField = this.props.setting.inputField

        // Get the input field that we need
        const InputComponent = INPUT_FIELDS[inputField.type]
        
        if (!InputComponent) return null

        const fieldLayout = <InputComponent
            {...this.props}
            inputField={inputField}
            onChange={(value) => this.changeSettingValue(value)}
        />

        let tooltipParams = {
            "data-tip": (this.props.setting.help ? this.props.setting.help + "<br>" : "") + "Default: " + (this.props.setting.default || "None"),
            "data-multiline": true,
            "data-effect": "solid",
            "data-place": inputField.type === "color" ? "bottom" : "top", 
        }

        let className = "InputField_container"
        if (this.props.value == null) className = className + " inputvalue_None"

        return <div
            className={className}
            onClick={(e) => inputField.type !== "queries" && e.ctrlKey ? this.changeSettingValue(this.props.value == null ? this.props.setting.default : null) : null}
            style={{...inputField.style}}
            {...tooltipParams}>
                {fieldLayout}
            </div>

    }
}

const mapStateToProps = state => ({
    browser: state.browser
})

const mapDispatchToProps = {
    changeSettings,
}

export default connect(mapStateToProps, mapDispatchToProps)(InputField);