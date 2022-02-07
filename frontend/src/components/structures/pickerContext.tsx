import { FC, createContext, useMemo, useState, useRef} from 'react'
import _ from "lodash"
import { PlotableInterface, StructureInterface } from '../../interfaces'

export interface PickerParams {
    searchString: string,
    alphabeticSorting: false | "asc" | "desc",
    selectedSorting: boolean,
    searchByFolder: boolean,
    displayStructures: boolean,
    displayPlotables: boolean,
}

export const defaultPickerParams: PickerParams = {
    searchString: "",
    alphabeticSorting: false,
    selectedSorting: false,
    searchByFolder: false,
    displayStructures: true,
    displayPlotables: true,
}

export const PickerParamsContext = createContext({
    pickerParams: defaultPickerParams,
    setPickerParams: (params: Partial<PickerParams>) => { },
    toggleParam: (name: keyof PickerParams) => { },
})

export interface PickerSelectedInterface {
    structures: string[],
    plotables: string[],
}

export const defaultPickerSelected: PickerSelectedInterface = {
    structures: [],
    plotables: [],
}

type SelectedKeys = keyof PickerSelectedInterface

type ObjectInterface<T> = 
    T extends "structures" ? StructureInterface :
    T extends "plotables" ? PlotableInterface : never

function defaultFilterSelected<T extends SelectedKeys>(what: T, objects: { [id: string]: ObjectInterface<T> }): ObjectInterface<T>[] {
    const selectedIds = defaultPickerSelected[what]

    return selectedIds.map(id => objects[id]).filter(obj => obj !== undefined)
}

export const PickerSelectedContext = createContext({
    pickerSelected: defaultPickerSelected,
    nChanges: 0,
    setPickerSelected: (pickerSelected: Partial<PickerSelectedInterface>) => { },
    toggleSelectedObject: (what: keyof PickerSelectedInterface, objectId: string) => { },
    filterSelected: defaultFilterSelected,
    unselect: (what: "structures" | "plotables", ids: string | string[]) => { },
})

const StructurePickerProvider: FC = (props) => {
    const [pickerParams, setPickerParams] = useState(defaultPickerParams)
    const nChangesSelected = useRef(0)
    const [pickerSelected, setPickerSelected] = useState(defaultPickerSelected)
    
    // Ensure that the consumers are not rerendered each time by memoizing the context value
    // and then provide functions to alter the state

    // For the picker parameters
    const pickerValue = useMemo(() => {

        // Function to toggle any parameter
        const toggleParam = (name: keyof PickerParams) => {
            let newVal;
            if (name === "alphabeticSorting") {
                const currVal = pickerParams.alphabeticSorting
                if (currVal === false) newVal = "asc"
                else if (currVal === "asc") newVal = "desc"
                else if (currVal === "desc") newVal = false
            } else {
                newVal = !pickerParams[name]
            }
            setPickerParams({ ...pickerParams, [name]: newVal })
        }

        return {
            pickerParams,
            setPickerParams: (params: Partial<PickerParams>) => setPickerParams({ ...pickerParams, ...params }),
            toggleParam
        }

    }, [pickerParams, setPickerParams])

    // And for the selected values
    const selectedValue = useMemo(() => {
        nChangesSelected.current = nChangesSelected.current + 1

        const toggleSelectedObject = (what: "structures" | "plotables", id: string) => {
            const toSelect = _.xor(pickerSelected[what], [id])
            setPickerSelected({ ...pickerSelected, [what]: toSelect})
        }

        function filterSelected<T extends SelectedKeys>(what: T, objects: { [id: string]: ObjectInterface<T> }): ObjectInterface<T>[]{
            const selectedIds = pickerSelected[what]

            return selectedIds.map(id => objects[id]).filter(obj => obj !== undefined)
        }

        const unselect = (what: "structures" | "plotables", ids: string | string[]) => {
            if (typeof ids === "string") ids = [ids]
            console.log("UNSELECTING", ids, "from", pickerSelected)
            console.log({ ...pickerSelected, [what]: pickerSelected[what].map(id => !ids.includes(id)) })

            setPickerSelected({...pickerSelected, [what]: pickerSelected[what].filter(id => !ids.includes(id))})
        }

        return {
            pickerSelected,
            nChanges: nChangesSelected.current,
            setPickerSelected: (toSelect: Partial<PickerSelectedInterface>) => setPickerSelected({ ...pickerSelected, ...toSelect }),
            toggleSelectedObject,
            filterSelected,
            unselect
        }

    }, [pickerSelected, setPickerSelected])

    return <PickerParamsContext.Provider value={pickerValue}>
        <PickerSelectedContext.Provider value={selectedValue}>
            {props.children}
        </PickerSelectedContext.Provider>
    </PickerParamsContext.Provider>
}

export default StructurePickerProvider;