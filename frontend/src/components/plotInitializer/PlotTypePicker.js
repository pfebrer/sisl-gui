import React, { Component } from 'react'
import { connect } from 'react-redux'

import Dropdown from '../settings/inputFields/Dropdown'

class PlotTypePicker extends Component {

    render() {

        const plotOptions = this.props.options || this.props.session.plotOptions

        const inputField = {
            params: {
                options: plotOptions,
                isClearable: true, isMulti: true,
            }
        }

        return (
            <Dropdown
                value={this.props.value}
                inputField={inputField}
                onChange={this.props.onChange}
                label="Plot type"
            />
        )
    }
}

const mapStateToProps = state => ({
    tabs: state.tabs,
    active: state.active,
    session: state.session
})

export default connect(mapStateToProps, null)(PlotTypePicker);