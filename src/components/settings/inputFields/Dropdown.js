import React, { Component } from 'react'

import Select from "react-select"

import _ from 'lodash'

export default class Dropdown extends Component {
    render() {
        return (
            <div style={{display:"flex", justifyContent:"center", alignItems:"center"}}>
                <div style={{paddingRight: 20}}>{this.props.setting.name + ":"}</div>
                <div style={{flex:1}}>
                    <Select
                        value={ Array.isArray(this.props.value) ? this.props.value.map(val => _.find(this.props.inputField.params.options, {value: val})) : _.find(this.props.inputField.params.options, {value: this.props.value})}
                        onChange={(obj) => this.props.onChange(Array.isArray(obj) ? obj.map(obj => obj.value) : obj ? obj.value : null )}
                        {...this.props.inputField.params}/>
                </div>
            </div>
        )
    }
}
