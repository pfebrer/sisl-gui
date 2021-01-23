import React, { Component } from 'react'
import NumericInput from './Numeric'

import _ from "lodash"

export default class ArrayInput extends Component {

    changeValue = (newVal, i) => {
        let value = _.cloneDeep(this.props.value)

        if(!value){
            value = this.handleNone()
        }

        value[i] = newVal

        this.props.onChange(value)
    }

    handleNone = () => {
        return Array((this.props.inputField.params.shape || [1])[0]).fill(null)
    }

    render() {

        //Params to pass to numeric inputs
        const orientationStyles = this.props.inputField.params.vertical ? {
            marginLeft: 20, marginRight: 20, marginBottom: 0, width: 70
        } : {
            marginLeft: 5, marginRight: 5, marginBottom: 0, width: 100
        }
        const inputStyle = { ...orientationStyles, textAlign: "center"}

        let value = this.props.value

        if (!value){
            value = this.handleNone()
        }

        return (
            <div style={{display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center"}}>
                <div style={{paddingBottom: 10}}>{this.props.setting.name}</div>
                <div style={{display: "flex", flexDirection: this.props.inputField.params.vertical ? "column" : "row", justifyContent: "center", alignItems: "center"}} className="arrayContainer">
                    {value.map((val, i) => <NumericInput value={val} onChange={(val) => this.changeValue(val, i)} style={inputStyle}/>)}
                </div>  
            </div>
        )
    }
}
