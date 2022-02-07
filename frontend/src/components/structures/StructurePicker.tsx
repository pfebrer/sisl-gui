import { FC, useContext, CSSProperties } from 'react'
import _ from "lodash"
import { MdFolder, MdFolderOpen} from 'react-icons/md'

import NavigateButton from '../controls/NavigateButton'
import {PlotableTag, StructureTag} from './Tag'
import TextInput from '../settings/inputFields/TextInput'
import { PlotableInterface, StructureInterface, StructOrPlotableInterface } from '../../interfaces'
import { PickerParams, PickerParamsContext, PickerSelectedContext } from './pickerContext'


function wildTest(wildcard: string, str: string) {
    const re = new RegExp(`^${wildcard.replace(/\*/g,'.*').replace(/\?/g,'.')}$`,'i');
    return re.test(str); // remove last 'i' above to have case sensitive
}

interface FilteredObject extends StructOrPlotableInterface{
    isPlotable: boolean,
}

const filterStructs = (
    structures: { [key: string]: StructureInterface }, plotables: {[key: string]: PlotableInterface }, 
    pickerParams: PickerParams,
) => {

    let searchString = pickerParams.searchString

    searchString = searchString.includes("*") || searchString.includes("?") ? searchString : "*" + searchString + "*"

    let toggles = [pickerParams.displayStructures, pickerParams.displayPlotables]
    let objs: { [key: string]: StructureInterface | PlotableInterface }[] = [structures, plotables]

    //Filter both structures and plotables
    return objs.reduce<{ [key: string]: FilteredObject }>((structs, object, index: number) => {

        if (!toggles[index]) return structs

        const isPlotable = index === 1

        Object.keys(object).forEach((structID) => {

            const struct = object[structID]

            const toTest = pickerParams.searchByFolder ? struct.path.split("/").slice(-2, -1)[0] : struct.name//.replace(".fdf", "")

            if (wildTest(searchString, toTest)) {

                structs[structID] = {
                    ...struct,
                    isPlotable,
                }
            }
        })

        return structs

    }, {})

}

const NoStructuresMessage:FC = (props) => {
    return <div>
        <div style={{ color: "darkred" }}>No structures in the search scope right now.</div>
        <div>Try to change file system settings or initialize the GUI from a different directory</div>
        <NavigateButton to="settings" style={{ marginTop: 10 }} />
    </div>
}

const NoMatchingStructuresMessage:FC = (props) => {
    return <div>
        <div style={{ color: "darkred" }}>No structure that matches your search.</div>
        <div>Try to change file system settings or initialize the GUI from a different directory</div>
        <NavigateButton to="settings" style={{ marginTop: 10 }} />
    </div>
}

interface StructurePickerProps {
    structures: { [key: string]: StructureInterface },
    plotables: {[key: string]: PlotableInterface },
    style?: CSSProperties
}

const StructurePicker:FC<StructurePickerProps> = (props) => {
    const {pickerParams, setPickerParams, toggleParam} = useContext(PickerParamsContext)
    const {pickerSelected, setPickerSelected, toggleSelectedObject} = useContext(PickerSelectedContext)
    
    const filteredObjs = filterStructs(props.structures || {}, props.plotables || {}, pickerParams)

    let structsAndPlotables = Object.values(filteredObjs)
    if (pickerParams.alphabeticSorting) {
        structsAndPlotables = _.orderBy(structsAndPlotables, "name", pickerParams.alphabeticSorting)
    }
    if (pickerParams.selectedSorting) {
        const isObjSelected = (struct: StructureInterface) => [...pickerSelected.structures, ...pickerSelected.plotables].includes(struct.id)
        structsAndPlotables = _.orderBy(structsAndPlotables, isObjSelected, "desc")
    }

    const isSelected = (id: string) => [...pickerSelected.structures, ...pickerSelected.plotables].includes(id)

    const toggleAllSelected = () => {
        const onDisplay = Object.keys(filteredObjs)

        const onDisplaySelected = _.intersection([...pickerSelected.structures, ...pickerSelected.plotables], onDisplay).length === 0

        const displayedStructs = _.intersection(Object.keys(props.structures), onDisplay)
        const displayedPlotables = _.intersection(Object.keys(props.plotables), onDisplay)

        const newSelectedStructs = onDisplaySelected ?
            [...displayedStructs, ...pickerSelected.structures]
            :
            pickerSelected.structures.filter(structID => !displayedStructs.includes(structID))
        
        const newSelectedPlotables = onDisplaySelected ?
            [...displayedPlotables, ...pickerSelected.plotables]
            :
            pickerSelected.plotables.filter(plotableID => !displayedPlotables.includes(plotableID))

        setPickerSelected({ structures: newSelectedStructs, plotables: newSelectedPlotables })

    }

    return (
        <div style={{ height: "100%", display: "flex", flexDirection: "column", backgroundColor: "white", ...props.style }}>
            <div style={{ display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: 20, marginBottom: 20 }}>
                <TextInput
                    label="Search string"
                    style={{ marginRight: 10 }}
                    value={pickerParams.searchString}
                    onChange={(searchString) => setPickerParams({searchString})} />
                <div
                    data-tip="Search by folder"
                    className={"structPickerToggle " + (pickerParams.searchByFolder ? "active" : "")}
                    onClick={() => toggleParam("searchByFolder")} style={{ cursor: "pointer" }}>{pickerParams.searchByFolder ? <MdFolder /> : <MdFolderOpen />}</div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span
                    data-tip="Show structures"
                    className={"structPickerToggle " + (pickerParams.displayStructures ? "active" : "")}
                    onClick={() => toggleParam("displayStructures")} style={{ cursor: "pointer" }}>Struct</span>
                <span
                    data-tip="Show plotables"
                    className={"structPickerToggle " + (pickerParams.displayPlotables ? "active" : "")}
                    onClick={() => toggleParam("displayPlotables")} style={{ cursor: "pointer" }}>Plotables</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span
                    className={"structPickerToggle " + (pickerParams.alphabeticSorting ? "active" : "")}
                    onClick={() => toggleParam("alphabeticSorting")} style={{ cursor: "pointer" }}>A-Z</span>
                <span
                    data-tip="Show selected first"
                    className={"structPickerToggle " + (pickerParams.selectedSorting ? "active" : "")}
                    onClick={() => toggleParam("selectedSorting")} style={{ cursor: "pointer" }}>sel</span>
                <span
                    className="structPickerToggle"
                    onClick={toggleAllSelected} style={{ cursor: "pointer" }}>All</span>
            </div>

            {Object.keys({ ...props.structures, ...props.plotables }).length === 0 ?
                <NoStructuresMessage/> : Object.values(structsAndPlotables).length === 0 ?
                    <NoMatchingStructuresMessage/> : null
            }

            <div style={{ flex: 1 }} className="scrollView" >
                {Object.values(structsAndPlotables).map(obj => {
                    if (obj.isPlotable) {
                        return <PlotableTag id={obj.id}
                            plotable={obj}
                            selected={isSelected(obj.id)}
                            toggle={() => toggleSelectedObject("plotables", obj.id)}
                        />
                    } else {
                        return <StructureTag id={obj.id}
                            structure={obj}
                            selected={isSelected(obj.id)}
                            toggle={() => toggleSelectedObject("structures", obj.id)}
                        />
                    }

                })}
            </div>
        </div>

    )

}

export default StructurePicker;
