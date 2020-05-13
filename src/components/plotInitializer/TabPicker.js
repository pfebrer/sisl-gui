import React, { Component } from 'react'
import { connect } from 'react-redux'

import Select from 'react-select'

import _ from "lodash"

class TabPicker extends Component {
    render() {

        const options = this.props.tabs.map( (tab) => ({label: tab.name, value: tab.id }))
        const value = _.find(options, ["value", this.props.value])
        return (
            <Select
                placeholder="Choose a tab..."
                options={options}
                defaultValue={this.props.active.tab && _.find(this.props.tabs, ["id", this.props.active.tab])? {label: _.find(this.props.tabs, ["id", this.props.active.tab]).name, value: this.props.active.tab } : null}
                isSearchable
                onChange={(obj) => this.props.onChange(obj ? obj.value : undefined)}
                value={value}
            />
        )
    }
}

const mapStateToProps = state => ({
    tabs: state.session.tabs,
    active: state.active
})

const mapDispatchToProps = {

}

export default connect(mapStateToProps, null)(TabPicker);
