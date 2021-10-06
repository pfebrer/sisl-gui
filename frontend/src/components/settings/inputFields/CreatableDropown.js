import React from 'react'

import Dropdown from './Dropdown'

const CreatableDropdown = (props) => {
    props.inputField.params.isCreatable = true
    return <Dropdown {...props}/>
}

export default CreatableDropdown
