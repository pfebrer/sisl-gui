import React, { Component } from 'react'

//--Components
import { Card, TextInput, Switch, Button } from 'react-materialize'
import Select from "react-select"
import { ChromePicker } from "react-color"
import { Range } from 'rc-slider';
import 'rc-slider/assets/index.css';

import _ from "lodash"
import InputField from '../InputField';

export default class QueriesField extends Component {

    constructor(props){
        super(props)

        this.state = {
            displayColorPicker: {}
        }
    }

    toggleColorPicker = (pickerID) => {
        this.setState({ displayColorPicker: {
            ...this.state.displayColorPicker,
            [pickerID] : ! this.state.displayColorPicker[pickerID]
        } })
    };

    addQuery = () => {

        let newQuery = this.props.setting.inputField.queryForm.reduce((map, queryParam) => {
            map[queryParam.key] = queryParam.default || null
            return map
        }, {})

        newQuery.active = true

        this.props.onChange([...this.props.value, newQuery])
    }

    changeSettingValue = (iQuery, paramKey, paramValue) => {

        let newValue = _.cloneDeep(this.props.value)

        newValue[iQuery] = { ...newValue[iQuery], [paramKey]: paramValue}

        this.props.onChange(newValue)
    }

    renderInputField = (queryParam, value, iQuery) => {

        let inputField = queryParam.inputField

        if (!inputField) return null

        let fieldLayout;

        if (inputField.type == "textinput"){

            fieldLayout = <TextInput
                    noLayout
                    value={value}
                    onChange={(e) => this.changeSettingValue(iQuery, queryParam.key, e.target.value)}
                    label={queryParam.name}
                    {...inputField.params}/>

        } else if (inputField.type == "switch"){

            fieldLayout = <div style={{display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center"}}>
                    <div style={{paddingBottom: 10}}>{queryParam.name}</div>
                    <Switch
                        id = {iQuery+queryParam.key}
                        checked={value}
                        onChange={(e) => this.changeSettingValue(iQuery, queryParam.key, e.target.checked) }
                        {...inputField.params}/>
                </div>

        } else if (inputField.type == "dropdown") {

            fieldLayout = <div style={{display:"flex", justifyContent:"center", alignItems:"center"}}>
                <div style={{paddingRight: 20}}>{queryParam.name + ":"}</div>
                <Select
                        className="querySelect"
                        value={ Array.isArray(value) ? value.map(val => _.find(inputField.params.options, {value: val})) : _.find(inputField.params.options, {value: value})}
                        onChange={(obj) => this.changeSettingValue(iQuery, queryParam.key, 
                            Array.isArray(obj) ? obj.map(obj => obj.value) : obj ? obj.value : null )}
                        {...inputField.params}/>
                </div>

        } else if (inputField.type == "color") {

            let pickerID = String(iQuery) + queryParam.key

            let colorPicker = this.state.displayColorPicker && this.state.displayColorPicker[pickerID] ? (
                <div style={{position: "absolute", bottom: 60}}>
                    <ChromePicker
                        color={value ? value : "#00F0F8FF"}
                        onChangeComplete={(color) => this.changeSettingValue(iQuery, queryParam.key, color.hex)}
                        {...inputField.params}/>
                </div>
            ) : null;

            fieldLayout = <div style={{position: "relative",display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center"}}>
                    <div style={{paddingBottom: 10}}>{queryParam.name}</div>
                    <div 
                        className="z-depth-2"
                        onClick={() => this.toggleColorPicker(pickerID)}
                        style={{width: 30, height: 30, borderRadius: 30, background: value}}/>
                    
                    {colorPicker}
                </div>
        } else if (inputField.type == "rangeslider"){

            fieldLayout = <div style={{paddingLeft: "10%", paddingRight: "10%"}}>
            <div style={{paddingBottom: 10}}>{queryParam.name}</div>
            <Range
                value={value}
                onChange={(value) => this.changeSettingValue(iQuery, queryParam.key, value)}
                {...inputField.params}/>
          </div>

        } else if (inputField.type == "number"){

            fieldLayout = <div>
                <div style={{paddingBottom: 10}}>{queryParam.name}</div>
                <input
                    type="number"
                    value={value}
                    onChange={(e) => this.changeSettingValue( iQuery, queryParam.key, InputField.number(e.target.value) )}
                    {...inputField.params}/>
                </div>
        }

        return <div style={{marginBottom: 5, marginTop: 5, paddingLeft: 10, paddingRight: 10, width: this.props.w(inputField.width), ...inputField.style}}>{fieldLayout}</div>
    }

    renderQuery = (query, iQuery) => {

        return (

            <div key={iQuery} style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
                <Switch
                    id={iQuery+"active"}
                    checked={query.active}
                    onChange={(e) => this.changeSettingValue(iQuery, "active", e.target.checked) }/>
                <Card className="queryCard" style={{flex: 1, background: query.active ? "#CBFFC0" : "#ffc3cd", borderRadius: 10}}>
                    <div style={{display:"flex", flexWrap: "wrap", justifyContent: "space-around"}}>
                        {this.props.setting.inputField.queryForm.map(queryParam => this.renderInputField(queryParam, query[queryParam.key], iQuery))}
                    </div>   
                </Card>
            </div>
            
        )

    }

    render() {

        return (
            <div>
                <div style={{paddingBottom: 10}}>{this.props.setting.name}</div>
                <div>
                    {this.props.value.map( (query, iQuery) => this.renderQuery(query, iQuery))}
                    <Button
                        data-tip="Add a new query"
                        onClick={this.addQuery}>
                        Add Query
                    </Button>
                </div>
            </div>
            
        )
    }
}
