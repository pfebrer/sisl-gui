import React, { Component } from 'react'
import { connect } from 'react-redux'

import Select from 'react-select'

import _ from "lodash"

class PlotTypePicker extends Component {

    render() {

        const plotOptions = this.props.session.plotOptions

        const value = _.find(plotOptions, ["value", this.props.value])

        return (
            <Select
                options={plotOptions}
                placeholder="Choose the plot type..."
                isClearable isSearchable isMulti
                onChange={(obj) => this.props.onChange(obj ? obj.value || obj.map(selected => selected.value) : undefined)}
                value={value}
            />
        )
    }
}

const mapStateToProps = state => ({
    tabs: state.tabs,
    active: state.active,
    session: state.session
})

const mapDispatchToProps = {

}

export default connect(mapStateToProps, null)(PlotTypePicker);