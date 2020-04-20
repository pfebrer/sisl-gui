import React, { Component } from 'react'
import NumericInput from './Numeric'

import _ from "lodash"

export default class ArrayInput extends Component {

    changeValue = (newVal, i) => {
        const value = _.cloneDeep(this.props.value)

        value[i] = newVal

        this.props.onChange(value)
    }

    render() {

        //Params to pass to numeric inputs
        const orientationStyles = this.props.inputField.params.vertical ? {
            marginLeft: 20, marginRight: 20, marginBottom: 0, width: 70
        } : {
            marginLeft: 5, marginRight: 5, paddingLeft: 10, marginBottom: 0, width: 50
        }
        const inputStyle = { ...orientationStyles, paddingLeft: 10, textAlign: "center", borderStyle:"solid", borderWidth: 1, borderColor: "black"}

        return (
            <div style={{display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center"}}>
                <div style={{paddingBottom: 10}}>{this.props.setting.name}</div>
                <div style={{display: "flex", flexDirection: this.props.inputField.params.vertical ? "column" : "row", justifyContent: "center", alignItems: "center"}} className="arrayContainer">
                    {this.props.value.map((val, i) => <NumericInput value={val} onChange={(val) => this.changeValue(val, i)} style={inputStyle}/>)}
                </div>  
            </div>
        )
    }
}
