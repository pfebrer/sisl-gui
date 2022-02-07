import { FC, useState } from 'react'

import _ from 'lodash'
import Dropdown from './Dropdown'

import { AiOutlineDelete } from 'react-icons/ai'
import { MdPlaylistAdd } from 'react-icons/md'
import { IconButton } from '@material-ui/core'
import InputField, { InputFieldProps } from '../InputField'
import { ParamInterface } from '../../../interfaces'

interface Value {
    [key: string]: any
}

interface CreatableDict extends InputFieldProps<Value> {
    setting: ParamInterface
}

const CreatableDictInput:FC<CreatableDict> = props => {
    const [new_cat_value, setNewCatValue] = useState<string | undefined>(undefined)

    const label = props.label || (props.setting ? props.setting.name : "")

    const fields = props.setting.inputField.fields || []
    const creatable_fields = fields

    let value = props.value || {}

    const getParam = (key: string) => {
        return _.find(props.setting.inputField.fields || [], ["key", key])
    }

    const onItemChange = (key:string, value:any) => {
        props.onChange({
            ...props.value, [key]: value
        })
    }

    const addNewItem = (key: string | undefined) => {
        if (!key) return

        const param = getParam(key)
        if (!param) return

        onItemChange(key, param.default)
    }

    const deleteItem = (key: string) => {
        props.onChange(_.omit(props.value, key))
    }

    const renderItem = (key: string, value: any) => {
        // Find the appropiate input field for this key
        const param = getParam(key)

        if (!param) return null

        // And render it
        return <fieldset>
            <legend style={{
                paddingLeft: 10, paddingRight: 10, paddingTop: 2, paddingBottom: 2, borderRadius: 3,
                backgroundColor: "white"
            }}>{param.name}</legend>
            <InputField
                {...props}
                setting={{...param, name: ""}}
                value={value}
                onValueChange={(value) => onItemChange(key, value)}
            />
            <IconButton onClick={() => deleteItem(key)}><AiOutlineDelete color="red" /></IconButton>
        </fieldset>
    }

    return (
        <div className="container">
            <div className="namediv">
                {label}
            </div>
            <div className="listcontainer">
                {Object.keys(value).map(key => renderItem(key, value[key]))}
            </div>
            <div className="newfielddiv">
                <Dropdown
                    value={new_cat_value}
                    onChange={(val) => setNewCatValue(val)}
                    label="Add a new selection..."
                    inputField={{
                        type: "",
                        params: {
                            options: creatable_fields.map((param: {name:string, key:string}) => ({ label: param.name, value: param.key })),
                        }
                    }} />
                <IconButton onClick={() => addNewItem(new_cat_value)}><MdPlaylistAdd color="green" /></IconButton>
            </div>
        </div>
        
    )
}

export default CreatableDictInput