import React, { Component } from 'react'
import { connect } from 'react-redux'

import Select from 'react-select'

import _ from "lodash"

const OPTIONS = [
    {label: "Plot individually", value:"separatePlot"},
    {label: "Merge in single plot", value:"jointPlot"},
    {label: "Build animation", value:"jointAnimation"},
    {label: "Animation for each", value:"separateAnimation"},
]

class MergeMethodPicker extends Component {

    constructor(props){
        super(props)
        this.state={}
    }

    render() {
        return (
            <Select
                options={OPTIONS}
                defaultValue={OPTIONS[0]}
                placeholder="Choose the plotting method..."
                isSearchable
                onChange={(obj) => this.props.onChange(obj ? obj.value || obj.map(selected => selected.value) : undefined)}
                value={_.find(OPTIONS, ["value", this.props.value])}
            />
                
        )
    }
}

const mapStateToProps = state => ({})

const mapDispatchToProps = {

}

export default connect(mapStateToProps, null)(MergeMethodPicker);