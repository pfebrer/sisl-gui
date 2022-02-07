import { CSSProperties, FC, useContext, useRef, useState } from 'react'

import _ from "lodash"

import Card from '@material-ui/core/Card'

import PythonApi from '../../apis/PythonApi'

import { connect } from 'react-redux'
import { setActiveTab, addPlots, informLoadingPlot, informLoadedPlot } from '../../redux/actions'
import StructuresGroup, { StructureGroup } from './StructuresGroup';
import { MdClose, MdDone } from 'react-icons/md'
import { Button } from '@material-ui/core'
import PlotableRow from './PlotableRow'
import StructurePicker from '../structures/StructurePicker'
import { PickerSelectedContext } from '../structures/pickerContext'
import { SessionInterface, StructureInterface, TabInterface } from '../../interfaces'

const newGroup = (structs: StructureInterface[], tabID: string,  groupParams?: Partial<StructureGroup>): StructureGroup => ({
    structs: structs,
    initializingOptions: { tabID: tabID, plotClasses: [], mergeMethod: "separatePlot" },
    ...groupParams
})

const cleanUnselectedFromGroups = (groups: StructureGroup[], selectedStructures: string[]) => {
    /* Removes unselected structures */
    return groups.reduce((cleanGroups:StructureGroup[], group) => {
        group = { ...group, structs: group.structs.filter(({ id: structID }) => selectedStructures.includes(structID)) }

        if (group.structs.length > 0) {
            cleanGroups.push(group)
        }

        return cleanGroups
    }, [])
}

const markActiveGroup = (iGroup: number, groups: StructureGroup[]) => groups.map((group, i) => ({ ...group, active: i === iGroup }))


const NothingToPlotMessage:FC = (props) => {
    return <div>
        <div style={{ color: "darkred", fontSize: "1.3em", fontWeight: "bold" }}>There's nothing to plot currently</div>
        <div>Select a structure or plotable to begin.</div>
    </div>
}

interface PlotInitializerProps {
    active: {[key: string]: any},
    tabs: TabInterface[],
    session: SessionInterface,
    style?: CSSProperties
}

const PlotInitializer:FC<PlotInitializerProps> = (props) => {
    const {pickerSelected, nChanges, setPickerSelected, filterSelected, unselect} = useContext(PickerSelectedContext)
    const [structureGroups, setStructureGroups] = useState<StructureGroup[]>([])
    const [plotablesPlots, setPlotablesPlots] = useState<{[plotableID: string]: string[]}>({})

    const defaultTabID = props.active.tab ? props.active.tab : props.tabs.length && props.tabs.length > 0 ? props.tabs[0].id : undefined

    // Get the selected objects
    const selPlotables = filterSelected("plotables", props.session.plotables)
    const selStructures = filterSelected("structures", props.session.structures)
    
    // Group management

    const addGroup = ({ structs }: {structs?: StructureInterface[]}) => {
        // Add a new group at the end and mark it as active
        const newStructureGroups = markActiveGroup(structureGroups.length, [...structureGroups, newGroup(structs || [], defaultTabID)])

        setStructureGroups(newStructureGroups)
    }

    const removeGroup = (iGroup: number) => {

        const group = structureGroups[iGroup]

        if (group.structs.length > 0) {
            // We need to deactivate all structures in the group, this will automatically update groups
            unselect("structures", group.structs.map(struct => struct.id))
        } else {
            // If no structures in the group, we just delete it
            let newStructureGroups = structureGroups.filter((g, i) => i !== iGroup)

            // If this was the active group, mark the last one as active
            if (group.active) {
                newStructureGroups = markActiveGroup(structureGroups.length - 1, structureGroups)
            }

            setStructureGroups(newStructureGroups)
        }

    }

    const splitGroup = (iGroup: number) => {
        const group = structureGroups[iGroup]

        // Build one group for each structure
        const splitted = group.structs.map(struct => newGroup([struct], defaultTabID, _.omit(group, ["structs"])))

        // Remove the old group
        let newStructureGroups = structureGroups.filter((g, i) => i !== iGroup)

        // Add the new ones
        newStructureGroups = [...newStructureGroups.slice(0, iGroup), ...splitted, ...newStructureGroups.slice(iGroup)]

        //If it was the active group, we can't leave all groups as active!
        if (group.active) newStructureGroups = markActiveGroup(iGroup, newStructureGroups)

        setStructureGroups(newStructureGroups)

    }

    const moveStructToActiveGroup = (structID: string) => {

        //Get the structure
        const struct = _.find(selStructures, ["id", structID])
        if (!struct) return

        // Remove the structure from its current group and move it to the active group
        // THIS WILL BE A PROBLEM IF AT SOME POINT THE SAME STRUCTURE IS ALLOWED IN TWO GROUPS AT THE SAME TIME
        // WE SHOULD THEN SPECIFY THE ORIGIN GROUP!!!!!!!!!!!!!!
        const newStructureGroups = structureGroups.map(group => {

            let structs = group.active ? [...group.structs, struct] : group.structs.filter(({ id }) => id !== structID)

            return { ...group, structs }
        })

        setStructureGroups(newStructureGroups)

    }

    const updateGroupInitParams = (iGroup: number, key: string, val: any) => {

        const newStructureGroups = structureGroups.map((group, i) => {
            return i === iGroup ? { ...group, initializingOptions: { ...group.initializingOptions, [key]: val } } : group
        })

        setStructureGroups(newStructureGroups)
    }

    const dismiss = () => setPickerSelected({ structures: [], plotables: [] })

    // When the selected structures change, then update the structure groups
    const nChangesRef = useRef(0)
    if (nChangesRef.current !== nChanges) {
        nChangesRef.current = nChanges
        let newStructureGroups: StructureGroup[] = [];

        const prevSelectedStructures = structureGroups.reduce((prevStructs: string[], group) => (
            [...prevStructs, ...group.structs.map(({ id: structID }) => structID)]
        ), [])

        const newStructs = selStructures.filter(({ id: structID }) => !prevSelectedStructures.includes(structID))

        if (newStructs.length > 0) {
            if (structureGroups.length === 0) {
                //In this case build a new group and mark it as active
                newStructureGroups = markActiveGroup(0, [newGroup(selStructures, defaultTabID)])
            } else {
                // Add the new structures to the receptive group
                newStructureGroups = structureGroups.map((group) => group.active ? { ...group, structs: group.structs.concat(newStructs) } : group)
            }
        } else {
            newStructureGroups = [...structureGroups]
        }

        newStructureGroups = cleanUnselectedFromGroups(newStructureGroups, pickerSelected.structures)
        

        //Ensure that there is an active group
        if (!_.find(newStructureGroups, "active")) {
            newStructureGroups = markActiveGroup(newStructureGroups.length - 1, newStructureGroups)
        }

        console.log("SETTING NEW GROUPS", newStructureGroups)
        setStructureGroups(newStructureGroups)
    }

    const getNewPlot = () => {
        setPickerSelected({ structures: [], plotables: [] })

        //Plot plotables
        selPlotables.forEach(plotable => {
            plotablesPlots[plotable.id].forEach(plotType => {
                PythonApi.newPlot({ tabID: defaultTabID, plotable_path: plotable.path, plot_method: plotType })
            })
        })

        //Plot the structures
        structureGroups.forEach(({ structs, initializingOptions }) => {

            if (initializingOptions.mergeMethod.includes("separate")) {

                const animation = initializingOptions.mergeMethod.includes("Animation")

                structs.forEach(struct => {

                    initializingOptions.plotClasses.forEach(plotClass => {

                        PythonApi.newPlot(
                            { tabID: initializingOptions.tabID, structID: struct.id, animation, plotClass: plotClass }
                        )

                    })


                })
            }

        })
    }

    if (props.tabs.length === 0) return null

    console.warn("STRUCTURE GROUPS", structureGroups)

    return (
        <div className="plotInitializer" style={{ ...props.style, display: "flex" }}>
            <StructurePicker
                structures={props.session.structures}
                plotables={props.session.plotables}
                style={{ paddingLeft: 15, paddingRight: 15, width: "10vw", minWidth: 200, borderRight: "#ccc solid 1px" }}/>
            <Card
                style={{ flex: 1, margin: 20, padding: 20, background: "aliceblue", overflow: "visible" }}>
                {selStructures.length > 0 ? <div>
                    <div className="sectionHeader">
                        Structures
                    </div>
                    {structureGroups.map((group, i) => {
                        return <StructuresGroup
                            {...group}
                            onInitParamChange={(key: string, val: any) => updateGroupInitParams(i, key, val)}
                            setGroupAsActive={() => setStructureGroups(markActiveGroup(i, structureGroups))}
                            removeGroup={() => removeGroup(i)}
                            splitGroup={() => splitGroup(i)}
                            moveStructToActiveGroup={moveStructToActiveGroup}
                        />
                    })}
                    <div onClick={() => addGroup({})}>New Group</div>
                </div> : null}

                {selPlotables.length > 0 ? <div className="sectionHeader">
                    Plotables
                </div> : null}

                <div>
                    {selPlotables.map(plotable => <PlotableRow 
                        plotable={plotable}
                        plots={plotablesPlots[plotable.id]}
                        selectPlots={(newPlots: string[]) => setPlotablesPlots({...plotablesPlots, [plotable.id]: newPlots})}
                        unselect={() => unselect("plotables", plotable.id)} 
                    />)}
                </div>


                {[...selPlotables, ...selStructures].length === 0 ? <NothingToPlotMessage/> : null}

                <div style={{ display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center", paddingTop: 20 }}>

                    <Button
                        style={{ marginRight: 20 }}
                        onClick={dismiss}
                        endIcon={<MdClose />}
                    >
                        Dismiss
                    </Button>

                    <Button
                        style={{ marginLeft: 20 }}
                        onClick={getNewPlot}
                        endIcon={<MdDone />}
                    >
                        Initialize plots
                    </Button>

                </div>

            </Card>
        </div>
    )

}

const mapStateToProps = (state: any) => ({
    tabs: state.session.tabs,
    active: state.active,
})

const mapDispatchToProps = {
    setActiveTab,
    addPlots,
    informLoadingPlot,
    informLoadedPlot,
}

export default connect(mapStateToProps, mapDispatchToProps)(PlotInitializer);
