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
import QueriesField from './inputFields/QueriesInput';
import ArrayInput from './inputFields/Array';
import ListInput from './inputFields/List';
import CreatableDropdown from './inputFields/CreatableDropown';

export const INPUT_FIELDS = {
    textinput: TextInput,
    switch: Switch,
    dropdown: Dropdown,
    "creatable dropdown": CreatableDropdown,
    color: ColorPicker,
    rangeslider: RangeSlider,
    range: Range,
    number: Numeric,
    queries: QueriesField,
    vector: ArrayInput,
    list: ListInput
}

export class InputField extends Component {

    constructor(props){
        super(props)

        this.state ={}
    }

    w = (string) => {

        if (!string) return undefined

        let isSizeDefined = ["s", "m", "l"].map(sizeLabel => string.indexOf(sizeLabel) >= 0)

        let iWindowSize = ["small", "medium", "infinity"].indexOf(this.props.browser.mediaType)

        for (let i = iWindowSize; i > -1; i--) {
            
            if(isSizeDefined[i]){
                let width = _.find(string.split(" "), (str) => str.indexOf(["s","m","l"][i]) >= 0)
                return width.substr(1)
            }
          }

        return undefined
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
            //w={this.w} //This is only needed by the queries field, maybe there is a better way to do it
        />

        let tooltipParams = {
            "data-tip": (this.props.setting.help ? this.props.setting.help + "<br>" : "") + "Default: " + (this.props.setting.default || "None"),
            "data-multiline": true,
            "data-effect": "solid",
            "data-place": inputField.type === "color" ? "bottom" : "top", 
        }

        const backgroundColor = this.props.value == null ? "rgba(230,230,230,0.4)" : undefined

        return <div
            onClick={(e) => inputField.type !== "queries" && e.ctrlKey ? this.changeSettingValue(this.props.value == null ? this.props.setting.default : null) : null}
            style={{backgroundColor, paddingTop: 10, paddingBottom: 10, paddingLeft: 20, paddingRight: 20, borderRadius: 3, marginTop: 20, marginBottom: 20, width: this.w(inputField.width), ...inputField.style}}
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