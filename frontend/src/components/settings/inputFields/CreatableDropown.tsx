import { FC } from 'react'
import { InputFieldProps } from '../InputField'

import Dropdown, {DropdownProps} from './Dropdown'

const CreatableDropdown:FC<DropdownProps>= (props) => {
    props.inputField.params.isCreatable = true
    return <Dropdown {...props}/>
}

export default CreatableDropdown;
