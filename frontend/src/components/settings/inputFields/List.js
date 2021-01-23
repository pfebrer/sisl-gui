import React, { Component } from 'react'
import InputField from "../InputField"
import {MdDragHandle} from "react-icons/md"
import { IoIosRemoveCircle, IoIosAddCircle } from "react-icons/io"
import _ from "lodash"
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
        <InputField {...props} />
        { props.remove ? <IoIosRemoveCircle color="darkred" size={20} onClick={props.remove}/> : null }
    </div>
));

const SortableContainer = sortableContainer(({ children }) => {
    return <div>{children}</div>;
});

export default class ListInput extends Component {

    changeValue = (newVal, i) => {
        let value = _.cloneDeep(this.sanitizeVal())

        value[i] = newVal

        this.props.onChange(value)
    }

    sanitizeVal = () => {
        if(!this.props.value){
            return this.handleNone()
        } else {
            return this.props.value
        }
    }

    handleNone = () => {

        return []
        
    }

    addItem = () => {

        this.props.onChange([...this.sanitizeVal(), null])
    }

    removeItem = (i) => {
        this.props.onChange(this.sanitizeVal().filter((val, index) => index !== i))
    }

    onSortEnd = ({ oldIndex, newIndex }) => {

        this.props.onChange(
            arrayMove(this.sanitizeVal(), oldIndex, newIndex)
        )

    };

    render() {

        let value = this.sanitizeVal()

        return (
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
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
                <IoIosAddCircle
                    data-tip="Add a new item"
                    onClick={this.addItem}
                    size={20}
                    color="green"
                />
            </div>
        )
    }
}