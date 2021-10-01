import React, { Component } from 'react'

import _ from 'lodash'
import Dropdown from './Dropdown'
import Numeric from './Numeric'
import Range from './Range'
import RangeSlider from './RangeSlider'
import Text from './TextInput'

import { AiOutlineDelete } from 'react-icons/ai'
import { MdPlaylistAdd } from 'react-icons/md'
import { IconButton } from '@material-ui/core'



export default class AtomSelector extends Component {

    state = {}

    onCategoryChange = (catName, value) => {
        //this.props.onChange({...this.props.value, [catName]: value})
        this.props.onChange({
            ...this.props.value, [catName]: value
        })
    }

    addNewCategory = (key) => {
        if (!key) return
        this.onCategoryChange(key, undefined)
    }

    deleteCategory = (key) => {
        this.props.onChange(_.omit(this.props.value, key))
    }

    renderCategory = (key, value) => {
        // If we have no component for this category, return null
        if (!ATOMIC_CATEGORIES_INPUT[key]) return null

        // Otherwise, get the name and the component for this category
        const { component: InputComponent, name } = ATOMIC_CATEGORIES_INPUT[key]

        // And render it
        return <fieldset style={{
            borderStyle: "dashed", borderColor: "#ccc", borderRadius: 5, borderWidth: 1, padding: 5, marginTop: 2, marginBottom: 2
        }}>
            <legend style={{
                paddingLeft: 10, paddingRight: 10, paddingTop: 2, paddingBottom: 2, borderRadius: 3,
                backgroundColor: "white"
            }}>{name}</legend>
            <InputComponent
                {...this.props}
                value={value}
                onChange={(value) => this.onCategoryChange(key, value)}/>
            <IconButton onClick={() => this.deleteCategory(key)}><AiOutlineDelete color="red" /></IconButton>
        </fieldset>
    }

    render() {

        const label = this.props.label || (this.props.setting ? this.props.setting.name : "")

        let value = this.props.value || {}
        // If we are getting a list of atomic indices, convert it to categories
        if (Array.isArray(value)) {
            value = {index: value}
            return this.props.onChange(value)
        }

        return (
            <div>
                <div>
                    {label}
                </div>
                <div>
                    {Object.keys(value).map(key => this.renderCategory(key, value[key]))}
                </div>
                <div style={{display: "flex"}}>
                    <div style={{flex: 1, paddingLeft: 5}}>
                        <Dropdown
                            value={this.state.new_cat_value}
                            onChange={(val) => this.setState({new_cat_value: val})}
                            label="Add a new selection..."
                            inputField={{
                                params: {
                                    options: Object.keys(ATOMIC_CATEGORIES_INPUT).map(key => ({ label: ATOMIC_CATEGORIES_INPUT[key].name, value: key })),
                                }
                            }} />
                    </div>
                    <IconButton onClick={() => this.addNewCategory(this.state.new_cat_value)}><MdPlaylistAdd color="green" /></IconButton>
                </div>
            </div>
            
        )
    }
}

class AtomIndexCategory extends Component {
    
    render() {

        return <Dropdown {...this.props}/>
    }
}

class FractionalCoordinatesCategory extends Component {
    render() {

        const value = this.props.value || [0,1]

        return (
            <RangeSlider
                value={value}
                setting={{}}
                inputField={{
                    params: {
                        min: 0, max: 1, step: 0.01,
                        //marks: { 0: "0", 0.25: "0.25", 0.5: "0.5", 0.75: "0.75", 1: "1" },
                        tipFormatter: value => `${value}`
                    }
                }}
                onChange={this.props.onChange}
            /> 
        )
    }
}

class CoordinatesCategory extends Component {
    render() {

        const value = this.props.value || [null, null]

        return (
            <Range
                value={value}
                setting={{ }}
                inputField={{params:{}}}
                onChange={this.props.onChange}
                />
        )
    }
}

class AtomicNumberCategory extends Component {
    render() {

        const value = this.props.value || null

        return (
            <Numeric
                value={value}
                setting={{ }}
                inputField={{ params: {min: 1} }}
                onChange={this.props.onChange}
            />
        )
    }
}

class AtomicTagCategory extends Component {
    render() {

        const value = this.props.value || null

        return (
            <Text
                value={value}
                setting={{ }}
                inputField={{ params: {} }}
                onChange={this.props.onChange}
            />
        )
    }
}

class AtomNeighboursCategory extends Component {

    onRangeChange = (val) => {
        this.props.onChange({ ...this.props.value, min: val[0], max: val[1]})
    }

    onKeyChange = (key, val) => {
        this.props.onChange({...this.props.value, [key]: val})
    }

    render() {
        const value = this.props.value || {"min": 0, "max": 20, "R": 1}

        return (
            <div>
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", paddingBottom: 5}}>
                    <Range
                        value={[value.min, value.max]}
                        setting={{ name: "" }}
                        inputField={{ params: { min: 0 } }}
                        onChange={this.onRangeChange}
                    />
                    <Numeric
                        style={{ paddingLeft: 5 }}
                        value={value.R}
                        setting={{ name: "R" }}
                        inputField={{ params: { min: 0 } }}
                        onChange={(val) => this.onKeyChange("R", val)}
                    />
                </div>
                <Text
                    value={value.neighbour ? value.neighbour.tag : null}
                    setting={{ name: "Neighbour tag" }}
                    inputField={{ params: { placeholder: "Neighbour tag..." } }}
                    onChange={(tag) => this.onKeyChange("neighbour", { "tag": tag })} />
            </div>
            
        )

    }
}

// class CompositeCategory extends Component {

//     render() {

//         return (
//             <div>
//                 <Numeric />
//             </div>
//         )
//     }
// }

const ATOMIC_CATEGORIES_INPUT = {
    index: {
        name: "Indices",
        component: AtomIndexCategory,
    },
    fx: {
        name: "Fractional X",
        component: FractionalCoordinatesCategory
    },
    fy: {
        name: "Fractional Y",
        component: FractionalCoordinatesCategory
    },
    fz: {
        name: "Fractional Z",
        component: FractionalCoordinatesCategory
    },
    x: {
        name: "X coordinate",
        component: CoordinatesCategory
    },
    y: {
        name: "Y coordinate",
        component: CoordinatesCategory
    },
    z: {
        name: "Z coordinate",
        component: CoordinatesCategory
    },
    Z: {
        name: "Atomic Number",
        component: AtomicNumberCategory
    },
    neighbours: {
        name: "Neighbours",
        component: AtomNeighboursCategory
    },
    tag: {
        name: "Atom tag",
        component: AtomicTagCategory
    }
}
