import React, { Component } from 'react'

import CreatableSelect from 'react-select/creatable';

import { components } from "react-select"

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

export default class CreatableDropdown extends Component {

    santitizeValue = (val) => {
        /*
        Maps the real value to something that can be passed to react select

        What we need to do is convert each value into an object {value: , label: }
        */

        var sanitized = _.find(this.props.inputField.params.options, { value: val })

        if (!sanitized && val) {
            sanitized = {label: val, value: val}
        }

        return sanitized || null

    }

    handleChange = (obj) => {
        /*
        Treats the new object before passing it to the onChange function
        */

        var newVal;
        if (Array.isArray(obj)){
            newVal = obj.map(obj => obj.value)
        } else if (obj) {
            newVal = obj.value
        } else {
            newVal = this.props.inputField.params.isMulti ? [] : null
        }

        this.props.onChange(newVal)

    }

    render() {

        const label = this.props.label || (this.props.setting ? this.props.setting.name : "")

        var value;
        
        if (Array.isArray(this.props.value)){
            value = this.props.value.map(val => this.santitizeValue(val))
        } else {
            value = this.santitizeValue(this.props.value)
        }

        return (
            <CreatableSelect
                value={value}
                onChange={this.handleChange}
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
                        fontSize: (state.hasValue || state.selectProps.inputValue) && 13,
                        color: state.hasValue || state.selectProps.inputValue ? "blue" : "#ccc",
                        marginLeft: state.hasValue || state.selectProps.inputValue ? -5 : 0,
                    })
                }}
                placeholder={label} />
        )
    }
}
