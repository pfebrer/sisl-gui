import { FC,  } from 'react'
import InputField, { InputFieldProps, MasterInputFieldProps } from "../InputField"

import { IconButton } from '@material-ui/core'
import { AiOutlineDelete } from 'react-icons/ai'
import { MdDragHandle, MdPlaylistAdd } from "react-icons/md"
import {
    SortableContainer,
    SortableElement,
    SortableHandle,
    SortEnd,
    arrayMove
} from 'react-sortable-hoc';

const DragHandle = SortableHandle(() => <MdDragHandle size={20} color="gray"/>);

interface SortableItemProps extends MasterInputFieldProps{
    sortable: boolean,
    remove: () => void,
}

const SortableItem = SortableElement((props: SortableItemProps) => (
    <div className="listitem">
        {props.sortable ? <DragHandle/> : null}
        <InputField {...props} />
        {props.remove ? <IconButton className="removebutton" onClick={props.remove}><AiOutlineDelete color="red"/></IconButton> : null }
    </div>
));

interface SortableContainerProps {
    children: any[]
}

const SortableList = SortableContainer((props: SortableContainerProps) => {
    return <div className="listcontainer">{props.children}</div>;
});

const handleNone = () => []

const sanitizeVal = (value: any):any[] => {

    if(!value){
        return handleNone()
    } else if (! Array.isArray(value)){
        return [value]
    } else {
        return value
    }
}

const ListInput:FC<InputFieldProps<Object[]>> = props => {
    let value = sanitizeVal(props.value)

    const addItem = () => {
        props.onChange([...sanitizeVal(props.value), props.setting.default || null])
    }

    const removeItem = (i: number) => {
        props.onChange(sanitizeVal(props.value).filter((val, index) => index !== i))
    }

    const changeValue = (newVal:any, i: number) => {
        let value = [...sanitizeVal(props.value)]

        value[i] = newVal

        props.onChange(value)
    }

    const onSortEnd = (args: SortEnd) => {

        props.onChange(
            arrayMove(sanitizeVal(props.value), args.oldIndex, args.newIndex)
        )

    };

    return (
        <div className="container" style={props.style}>
            <div className="namediv" style={{ paddingBottom: 10 }}>{props.setting.name}</div>
            <SortableList onSortEnd={onSortEnd} useDragHandle>
                {value.map((val, i) => (
                    <SortableItem 
                        key={`item-${i}`} index={i} value={val} 
                        onValueChange={(val: any) => changeValue(val, i)} 
                        remove={() => removeItem(i)}
                        sortable={props.setting.inputField.params.sortable}
                        setting={props.setting.inputField.params.itemInput} />
                ))}
            </SortableList>
            <IconButton 
                data-tip="Add a new item"
                onClick={addItem}>
                    <MdPlaylistAdd color="green" />
            </IconButton>
        </div>
    )
}

export default ListInput;