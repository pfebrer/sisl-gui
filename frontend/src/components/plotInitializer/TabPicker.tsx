import { FC } from 'react'
import { connect } from 'react-redux'

import Dropdown from '../settings/inputFields/Dropdown'

import _ from "lodash"
import { TabInterface } from '../../interfaces'

interface TabPickerProps {
    tabs: TabInterface[],
    active: {
        tab: string,
        [key: string]: any
    },
    value: string | null,
    onChange: (value: string) => void,
}

const TabPicker:FC<TabPickerProps> = (props) => {

    const options = props.tabs.map( (tab) => ({label: tab.name, value: tab.id }))

    const value = props.value
    if (value == null){
        if (props.active.tab && _.find(props.tabs, ["id", props.active.tab])){
            props.onChange(props.active.tab)
        }
    }

    const inputField = {
        type: "dropdown",
        params: {
            options: options,
            isClearable: false, isMulti: false,
        }
    }

    return (
        <Dropdown
            value={value}
            inputField={inputField}
            onChange={props.onChange}
            label="Tab"
        />
    )
}

const mapStateToProps = (state: any) => ({
    tabs: state.session.tabs,
    active: state.active
})

export default connect(mapStateToProps)(TabPicker);
