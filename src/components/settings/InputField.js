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

class InputField extends Component {

    constructor(props){
        super(props)

        this.state ={}
    }

    w = (string) => {

        if (!string) return undefined

        let isSizeDefined = ["s", "m", "l"].map(sizeLabel => string.indexOf(sizeLabel) >= 0)

        let iWindowSize = ["small", "medium", "infinity"].indexOf(this.props.browser.mediaType)

        for (var i = iWindowSize; i > -1; i--) {
            
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
            "data-place": inputField.type == "color" ? "bottom" : "top", 
        }

        const backgroundColor = this.props.value == null ? "rgba(230,230,230,0.4)" : undefined

        return <div
            onClick={(e) => inputField.type != "queries" && e.ctrlKey ? this.changeSettingValue(this.props.value == null ? this.props.setting.default : null) : null}
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


// if (inputField.type == "textinput"){

//     fieldLayout = <TextInput
//             noLayout
//             value={this.props.value}
//             onChange={(e) => this.changeSettingValue(e.target.value)}
//             label={this.props.setting.name}
//             {...inputField.params}/>

// } else if (inputField.type == "switch"){

//     fieldLayout = <div style={{display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center"}}>
//             <div style={{paddingBottom: 10}}>{this.props.setting.name}</div>
//             <Switch
//                 id = {this.props.setting.key}
//                 checked={this.props.value}
//                 onChange={(e) => this.changeSettingValue(e.target.checked) }
//                 {...inputField.params}/>
//         </div>

// } else if (inputField.type == "dropdown") {

//     fieldLayout = <div style={{display:"flex", justifyContent:"center", alignItems:"center"}}>
//         <div style={{paddingRight: 20}}>{this.props.setting.name + ":"}</div>
//         <div style={{flex:1}}>
//             <Select
//                 value={ Array.isArray(this.props.value) ? this.props.value.map(val => _.find(inputField.params.options, {value: val})) : _.find(inputField.params.options, {value: this.props.value})}
//                 onChange={(obj) => this.changeSettingValue(Array.isArray(obj) ? obj.map(obj => obj.value) : obj ? obj.value : null )}
//                 {...inputField.params}/>
//         </div>
//         </div>

// } else if (inputField.type == "color") {

//     let colorPicker = this.state.displayColorPicker ? (
//         <div style={{position: "absolute", bottom: 60}}>
//             <ChromePicker
//                 color={this.props.value}
//                 onChangeComplete={(color) => this.changeSettingValue(color.hex)}
//                 {...inputField.params}/>
//         </div>
//     ) : null;

//     fieldLayout = <div style={{position: "relative",display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center"}}>
//             <div style={{paddingBottom: 10}}>{this.props.setting.name}</div>
//             <div 
//                 className="z-depth-2"
//                 onClick={this.toggleColorPicker}
//                 style={{width: 30, height: 30, borderRadius: 30, background: this.props.value}}/>
            
//             {colorPicker}
//         </div>
// } else if (inputField.type == "rangeslider"){

//     fieldLayout = <div style={{paddingLeft: "10%", paddingRight: "10%"}}>
//     <div style={{paddingBottom: 10}}>{this.props.setting.name}</div>
//     <Range
//         value={this.props.value}
//         onChange={(value) => this.changeSettingValue(value)}
//         {...inputField.params}
//         />
//   </div>

// } else if (inputField.type == "range"){

//     fieldLayout = <div>
//         <div style={{paddingBottom: 10}}>{this.props.setting.name}</div>
//         <div style={{display: 'flex'}}>
//             <input
//                 style={{marginRight: 30, flex:1}}
//                 type="number"
//                 value={this.props.value[0]}
//                 onChange={(e) => this.props.value[1] >= Number(e.target.value) ? 
//                     this.changeSettingValue( [InputField.number(e.target.value), this.props.value[1]] ) : null}
//                 {...inputField.params}/>
//             <input
//                 style={{marginLeft: 30, flex:1}}
//                 type="number"
//                 value={this.props.value[1]}
//                 onChange={(e) => Number(e.target.value) >= this.props.value[0] ? 
//                     this.changeSettingValue( [this.props.value[0], InputField.number(e.target.value)] ) : null }
//                 {...inputField.params}/>
//         </div>
        
//     </div>

// } else if (inputField.type == "number"){

//     fieldLayout = <div>
//         <div style={{paddingBottom: 10}}>{this.props.setting.name}</div>
//         <input
//             type="number"
//             value={this.props.value}
//             onChange={(e) => this.changeSettingValue( InputField.number(e.target.value) )}
//             {...inputField.params}/>
//         </div>
// } else if (inputField.type == "queries"){

//     fieldLayout = <div>
//         <div style={{paddingBottom: 10}}>{this.props.setting.name}</div>
//         <QueriesField 
//             changeSettingValue={this.changeSettingValue}
//             setting={this.props.setting}
//             value={this.props.value}
//             w={this.w}/>
//     </div>
// }
