import { FC, useContext } from 'react'
import { MdRemove } from 'react-icons/md'
import { StructureInterface } from '../../interfaces'
import { PickerSelectedContext } from '../structures/pickerContext'

interface StructureRowProps {
    structure: StructureInterface,
    groupActive?: boolean,
    moveStructToActiveGroup: () => void,
}

const StructureRow:FC<StructureRowProps> = (props) => {
    const { unselect } = useContext(PickerSelectedContext)

    const struct = props.structure
    const groupActive = props.groupActive

    return (
        <div style={{display: "flex", flexDirection: "row", justifyContent: "flex-start", alignItems: "center", marginTop: 10, marginBottom: 10}}>
            <div 
                style={{color: "darkred", cursor: "pointer", display: "flex", justifyContent: "center", alignItems:"center"}}
                onClick={() => unselect("structures", struct.id)}>
                <MdRemove/>
            </div>
            <div 
                style={{cursor: groupActive ? "default" : "pointer", marginRight: 20, marginLeft: 20, padding: 10, backgroundColor: groupActive ? "whitesmoke" : "#ccc", borderRadius: 3}}
                onClick={groupActive ? undefined : props.moveStructToActiveGroup}>
                {struct.name.replace(".fdf", "")}
            </div>
            <div data-tip={struct.path}>{".../" + struct.path.split("/").slice(-2,-1)[0]}</div>
        </div>
    )
}

export default StructureRow;
