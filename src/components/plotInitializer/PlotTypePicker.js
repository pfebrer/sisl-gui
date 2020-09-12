import React, { Component } from 'react'
import { connect } from 'react-redux'

import Select, { components } from 'react-select'

import _ from "lodash"

const { ValueContainer, Placeholder } = components;

const CustomValueContainer = ({ children, ...props }) => {
    return (
        <ValueContainer {...props}>
            <Placeholder {...props} isFocused={props.isFocused}>
                {props.selectProps.placeholder}
            </Placeholder>
            {React.Children.map(children, child =>
                child && child.type !== Placeholder ? child : null
            )}
        </ValueContainer>
    );
};

class PlotTypePicker extends Component {

    render() {

        const plotOptions = this.props.options || this.props.session.plotOptions

        let value;

        if (Array.isArray(this.props.value)){
            value = this.props.value.map(value => _.find(plotOptions, ["value", value]))
        } else {
            value = _.find(plotOptions, ["value", this.props.value])
        }

        return (
            <Select
                options={plotOptions}
                placeholder="Choose the plot type..."
                isClearable isSearchable isMulti
                onChange={(obj) => this.props.onChange(obj ? obj.value || obj.map(selected => selected.value) : undefined)}
                value={value}
                components={{
                    ValueContainer: CustomValueContainer
                }}
                styles={{
                    container: (provided, state) => ({
                        ...provided,
                        marginTop: 20,
                        marginBottom: 20
                    }),
                    valueContainer: (provided, state) => ({
                        ...provided,
                        overflow: "visible"
                    }),
                    placeholder: (provided, state) => ({
                        ...provided,
                        position: "absolute",
                        top: state.hasValue || state.selectProps.inputValue ? -15 : "50%",
                        transition: "top 0.1s, font-size 0.1s",
                        fontSize: (state.hasValue || state.selectProps.inputValue) && 13,
                        color: state.hasValue || state.selectProps.inputValue ? "blue" : "#ccc",
                        marginLeft: state.hasValue || state.selectProps.inputValue ? -5 : 0,
                    })
                }}
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