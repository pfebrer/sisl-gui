import React, { Component } from 'react'
import InputField from '../InputField'

export default class Range extends Component {

    render() {

        const value = this.props.value != null ? this.props.value : ["", ""]

        return (
            <div>
                <div style={{paddingBottom: 10}}>{this.props.setting.name}</div>
                <div style={{display: 'flex'}}>
                    <input
                        style={{marginRight: 30, flex:1}}
                        type="number"
                        value={value[0]}
                        onChange={(e) => value[1] >= Number(e.target.value) ? 
                            this.props.onChange( [InputField.number(e.target.value), value[1]] ) : null}
                        {...this.props.inputField.params}/>
                    <input
                        style={{marginLeft: 30, flex:1}}
                        type="number"
                        value={value[1]}
                        onChange={(e) => Number(e.target.value) >= value[0] ? 
                            this.props.onChange( [value[0], InputField.number(e.target.value)] ) : null }
                        {...this.props.inputField.params}/>
                </div>
                
            </div>
        )
    }
}
