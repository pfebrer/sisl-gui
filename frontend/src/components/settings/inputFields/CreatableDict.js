import React, { Component } from 'react'

import _ from 'lodash'
import Dropdown from './Dropdown'

import { AiOutlineDelete } from 'react-icons/ai'
import { MdPlaylistAdd } from 'react-icons/md'
import { IconButton } from '@material-ui/core'
import InputField from '../InputField'



export default class CreatableDictInput extends Component {

    state = {}

    getParam = (key) => {
        return _.find(this.props.setting.inputField.fields || [], ["key", key])
    }

    onItemChange = (key, value) => {
        this.props.onChange({
            ...this.props.value, [key]: value
        })
    }

    addNewItem = (key) => {
        if (!key) return

        const param = this.getParam(key)
        if (!param) return

        this.onItemChange(key, param.default)
    }

    deleteItem = (key) => {
        this.props.onChange(_.omit(this.props.value, key))
    }

    renderItem = (key, value) => {
        // Find the appropiate input field for this key
        const param = this.getParam(key)

        if (!param) return null

        // And render it
        return <fieldset className="CreatableDictInput_fieldset">
            <legend style={{
                paddingLeft: 10, paddingRight: 10, paddingTop: 2, paddingBottom: 2, borderRadius: 3,
                backgroundColor: "white"
            }}>{param.name}</legend>
            <InputField
                {...this.props}
                setting={{...param, name: ""}}
                value={value}
                onValueChange={(value) => this.onItemChange(key, value)}
            />
            <IconButton onClick={() => this.deleteItem(key)}><AiOutlineDelete color="red" /></IconButton>
        </fieldset>
    }

    render() {

        const label = this.props.label || (this.props.setting ? this.props.setting.name : "")

        const fields = this.props.setting.inputField.fields || []
        const creatable_fields = fields

        let value = this.props.value || {}
        // If we are getting a list of atomic indices, convert it to categories
        if (Array.isArray(value)) {
            value = {index: value}
            return this.props.onChange(value)
        }

        return (
            <div>
                <div>
                    {label}
                </div>
                <div>
                    {Object.keys(value).map(key => this.renderItem(key, value[key]))}
                </div>
                <div style={{display: "flex"}}>
                    <div style={{flex: 1, paddingLeft: 5}}>
                        <Dropdown
                            value={this.state.new_cat_value}
                            onChange={(val) => this.setState({new_cat_value: val})}
                            label="Add a new selection..."
                            inputField={{
                                params: {
                                    options: creatable_fields.map(param => ({ label: param.name, value: param.key })),
                                }
                            }} />
                    </div>
                    <IconButton onClick={() => this.addNewItem(this.state.new_cat_value)}><MdPlaylistAdd color="green" /></IconButton>
                </div>
            </div>
            
        )
    }
}