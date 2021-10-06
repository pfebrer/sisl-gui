import React, { Component } from 'react'
import { connect } from 'react-redux'

import Dropdown from '../settings/inputFields/Dropdown'

import _ from "lodash"

class TabPicker extends Component {
    render() {

        const options = this.props.tabs.map( (tab) => ({label: tab.name, value: tab.id }))

        const value = this.props.value
        if (value == null){
            if (this.props.active.tab && _.find(this.props.tabs, ["id", this.props.active.tab])){
                this.props.onChange(this.props.active.tab)
            }
        }

        const inputField = {
            params: {
                options: options,
                isClearable: false, isMulti: false,
            }
        }

        return (
            <Dropdown
                value={value}
                inputField={inputField}
                onChange={this.props.onChange}
                label="Tab"
            />
        )
    }
}

const mapStateToProps = state => ({
    tabs: state.session.tabs,
    active: state.active
})

export default connect(mapStateToProps, null)(TabPicker);
