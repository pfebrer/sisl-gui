import React, { Component } from 'react'

import Select, { components } from "react-select"

import _ from 'lodash'

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

export default class Dropdown extends Component {
    render() {

        const label = this.props.label || (this.props.setting ? this.props.setting.name : "")

        return (
            <Select
                value={ Array.isArray(this.props.value) ? this.props.value.map(val => _.find(this.props.inputField.params.options, {value: val})) : _.find(this.props.inputField.params.options, {value: this.props.value})}
                onChange={(obj) => this.props.onChange(Array.isArray(obj) ? obj.map(obj => obj.value) : obj ? obj.value : null )}
                {...this.props.inputField.params}
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
                        fontSize: (state.hasValue || state.selectProps.inputValue ) && 13,
                        color: state.hasValue || state.selectProps.inputValue ? "blue" : "#ccc",
                        marginLeft: state.hasValue || state.selectProps.inputValue ? -5 : 0,
                    })
                }}
                placeholder={label}/>
        )
    }
}
