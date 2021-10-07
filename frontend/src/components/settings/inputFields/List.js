import React, { Component } from 'react'
import InputField from "../InputField"

import { IconButton } from '@material-ui/core'
import { AiOutlineDelete } from 'react-icons/ai'
import { MdDragHandle, MdPlaylistAdd } from "react-icons/md"
import {
    sortableContainer,
    sortableElement,
    sortableHandle,
    arrayMove
} from 'react-sortable-hoc';

const DragHandle = sortableHandle(() => <MdDragHandle size={20} color="gray"/>);

const SortableItem = sortableElement((props) => (
    <div style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
        {props.sortable ? <DragHandle /> : null}
        <div style={{flex: 1}}>
            <InputField {...props} />
        </div>
        {props.remove ? <IconButton onClick={props.remove}><AiOutlineDelete color="red"/></IconButton> : null }
    </div>
));

const SortableContainer = sortableContainer(({ children }) => {
    return <div style={{ width: "100%"}}>{children}</div>;
});

export default class ListInput extends Component {

    changeValue = (newVal, i) => {
        let value = [...this.sanitizeVal(this.props.value)]

        value[i] = newVal

        this.props.onChange(value)
    }

    sanitizeVal = (value) => {

        if(!value){
            return this.handleNone()
        } else if (! Array.isArray(value)){
            return [value]
        } else {
            return value
        }
    }

    handleNone = () => []

    addItem = () => {

        this.props.onChange([...this.sanitizeVal(this.props.value), this.props.setting.default || null])
    }

    removeItem = (i) => {
        this.props.onChange(this.sanitizeVal(this.props.value).filter((val, index) => index !== i))
    }

    onSortEnd = ({ oldIndex, newIndex }) => {

        this.props.onChange(
            arrayMove(this.sanitizeVal(this.props.value), oldIndex, newIndex)
        )

    };

    render() {

        let value = this.sanitizeVal(this.props.value)

        return (
            <div className="ListInput_container" style={this.props.style}>
                <div style={{ paddingBottom: 10 }}>{this.props.setting.name}</div>
                <SortableContainer onSortEnd={this.onSortEnd} useDragHandle>
                    {value.map((val, i) => (
                        <SortableItem 
                            key={`item-${i}`} index={i} value={val} 
                            onValueChange={(val) => this.changeValue(val, i)} 
                            remove={() => this.removeItem(i)}
                            sortable={this.props.setting.inputField.params.sortable}
                            setting={this.props.setting.inputField.params.itemInput} />
                    ))}
                </SortableContainer>
                <IconButton 
                    data-tip="Add a new item"
                    onClick={this.addItem}>
                        <MdPlaylistAdd color="green" />
                </IconButton>
            </div>
        )
    }
}