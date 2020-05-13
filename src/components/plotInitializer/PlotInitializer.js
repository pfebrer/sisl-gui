import React, { Component } from 'react'

import _ from "lodash"

import Card from '@material-ui/core/Card'

import PythonApi from '../../apis/PythonApi'

import { connect } from 'react-redux'
import { selectActiveStructs, selectActivePlotables } from '../../redux/reducers'
import { setActiveTab, addPlots, setActiveStructs, informLoadingPlot, informLoadedPlot, deactivateStruct, deactivatePlotable, setActivePlotables } from '../../redux/actions'
import StructuresGroup from './StructuresGroup';
import { MdRemove, MdClose, MdDone, MdRefresh } from 'react-icons/md'
import { Button } from '@material-ui/core'

class PlotInitializer extends Component {

    constructor(props){
        super(props)

        this.state = {
            structureGroups: [],
            plotables: [],
        }
        
    }

    get selectedStructs(){
        return this.props.activeStructs || []
    }

    get selectedPlotables(){
        return this.props.activePlotables || []
    }

    get defaultTabID(){
        return this.props.active.tab ? this.props.active.tab : this.props.tabs.length && this.props.tabs.length > 0 ? this.props.tabs[0].id : undefined
    }

    componentDidMount(){

        this.onStructsUpdate([])

    }

    componentWillUnmount(){

    }

    componentDidUpdate(prevProps) {

        if ( !_.isEqual(prevProps.active.structs, this.props.active.structs) ){

            this.onStructsUpdate(prevProps.active.structs)
            
        }
    }

    onStructsUpdate = (prevActiveStructs) => {

        let structureGroups = [];

        const newStructs = this.selectedStructs.filter(({id:structID}) => !prevActiveStructs.includes(structID))

        if (this.state.structureGroups.length == 0){
            //In this case build a new group and mark it as active
            structureGroups = this.markActiveGroup(0, [this.newGroup(this.selectedStructs)])
        } else {
            const activeGroupIndex = _.findIndex(this.state.structureGroups, "active" )
            const activeGroup = this.state.structureGroups[activeGroupIndex]

            //Add the structure to the receptive group
            structureGroups = [
                ...this.state.structureGroups.slice(0,activeGroupIndex),
                {...activeGroup, structs: [...activeGroup.structs, ...newStructs]},
                ...this.state.structureGroups.slice(activeGroupIndex + 1)
            ]
        }

        structureGroups = this.cleanUnselectedFromGroups(structureGroups)

        //Ensure that there is an active group
        if ( !_.find(structureGroups, "active") ){
            structureGroups = this.markActiveGroup(structureGroups.length - 1, structureGroups)
        }

        this.setState({structureGroups})
    }

    cleanUnselectedFromGroups = (groups) => {
        /* Removes unselected structures */
        return groups.reduce((cleanGroups, group) => {
            group = {...group, structs: group.structs.filter(({id: structID}) => this.props.active.structs.includes(structID))}

            if (group.structs.length > 0){
                cleanGroups.push(group)
            }
            
            return cleanGroups
        },[])
    }

    newGroup = (structs, groupParams) => {

        return {
            structs: structs || [],
            initializingOptions: {tabID: this.defaultTabID, plotClasses: [], mergeMethod: "separatePlot"},
            ...groupParams
        }
    }

    addGroup = ({structs}) => {

        const structureGroups = this.markActiveGroup(this.state.structureGroups.length,
            [...this.state.structureGroups, this.newGroup(structs)])

        this.setState({structureGroups})
    }

    removeGroup = (iGroup) => {

        const group = this.state.structureGroups[iGroup]
        
        if (group.structs.length > 0){

            //We need to deactivate all structures in the group, this will automatically update groups
            this.props.deactivateStruct(group.structs.map(struct => struct.id))
        } else {
            //If no structures in the group, we just delete it

            let structureGroups = this.state.structureGroups.filter((g, i) => i != iGroup)

            if (group.active){
                structureGroups = this.markActiveGroup(structureGroups.length - 1, structureGroups)
            }

            this.setState({structureGroups})
        }
        
    }

    splitGroup = (iGroup) => {
        const group = this.state.structureGroups[iGroup]

        const splitted = group.structs.map( struct => this.newGroup([struct], _.omit(group, ["structs"])) )

        //Remove the old group
        let structureGroups = this.state.structureGroups.filter( (g, i) => i != iGroup)

        //Add the new ones
        structureGroups = [...structureGroups.slice(0,iGroup), ...splitted, ...structureGroups.slice(iGroup) ]

        //If it was the active group, we can't leave all groups as active!
        if (group.active) structureGroups = this.markActiveGroup(iGroup, structureGroups)

        this.setState({structureGroups})

    }

    markActiveGroup = (iGroup, groups) => {
        groups = groups || this.state.structureGroups
        
        return groups.map((group, i) => {
            return {...group, active: i == iGroup}
        })
    }

    setGroupAsActive = (iGroup) => {
        this.setState({structureGroups: this.markActiveGroup(iGroup)})
    }

    moveStructToActiveGroup = (structID) => {
        
        //Get the structure
        const struct = _.find(this.selectedStructs, ["id", structID])

        //Remove the structure from its actual group and move it to the active group
        //THIS WILL BE A PROBLEM IF AT SOME POINT THE SAME STRUCTURE IS ALLOWED IN TWO GROUPS AT THE SAME TIME
        //WE SHOULD THEN SPECIFY THE ORIGIN GROUP!!!!!!!!!!!!!!
        const structureGroups = this.state.structureGroups.map( group => {

            let structs = group.active ? [...group.structs, struct] : group.structs.filter( ({id}) => id != structID)
            
            return {...group, structs}
        })

        this.setState({structureGroups})

    }

    updateGroupInitParams = (iGroup, key, val) => {

        const structureGroups = this.state.structureGroups.map((group, i) => {
            return i == iGroup ? {...group, initializingOptions: {...group.initializingOptions, [key]: val}}: group
        })

        this.setState({structureGroups})
    }

    toggleVisibility = () => {

        document.dispatchEvent( new Event("togglePlotInitializer"))
    }

    updateInitializingOptions = (key, value) => {
        this.setState({ [key]: value})
    }

    getNewPlot = () => {

        //Plot plotables
        this.selectedPlotables.forEach(plotable => {
            PythonApi.newPlot({tabID: this.defaultTabID, plotableID: plotable.id})
        })

        //Plot the structures
        this.state.structureGroups.forEach( ({structs, initializingOptions}) =>  {

            if (initializingOptions.mergeMethod.includes("separate")){

                const animation = initializingOptions.mergeMethod.includes("Animation")

                structs.forEach( struct => {
                    
                    initializingOptions.plotClasses.forEach( plotClass => {
                    
                        PythonApi.newPlot(
                            {tabID: initializingOptions.tabID, structID: struct.id, animation, plotClass: plotClass}
                        )
        
                    })
                    
                    
                })
            }
            
        })

        this.toggleVisibility()

        this.props.setActiveStructs([])
        this.props.setActivePlotables([])

    }

    renderPlotable = (plotable) => {
        return <div style={{display: "flex", flexDirection: "row", alignItems: "center", marginTop: 10}}>
            <div style={{color: "darkred", cursor: "pointer", display: "flex", justifyContent: "center", alignItems:"center"}} onClick={() => this.props.deactivatePlotable(plotable.id)}>
                <MdRemove/>
            </div>
            <div style={{marginRight: 20, marginLeft: 20, padding: 10, backgroundColor: "whitesmoke", borderRadius: 3}}>
                {plotable.name}
            </div>
            <div data-tip={plotable.path}>{".../" + plotable.path.split("/").slice(-2,-1)[0]}</div>
        </div> 
    }

    nothingToPlotMessage = () => {
        return <div>
            <div style={{color: "darkred", fontSize: "1.3em", fontWeight: "bold"}}>There's nothing to plot currently</div>
            <div>Select a structure or plotable to begin.</div>
        </div>
    }

    render() {

        if (this.props.tabs.length == 0) return null

        let plotables = _.groupBy(this.selectedPlotables, "plot")

        return (
            <div className="plotInitializer" style={this.props.style}>

                <Card
                    style={{margin: 20, padding: 20, background: "aliceblue", overflow: "visible"}}>
                    {this.selectedStructs.length > 0 ? <div>
                        <div className="sectionHeader">
                            Structures
                        </div>
                        {this.state.structureGroups.map( (group, i) => {
                            return <StructuresGroup 
                                {...group}
                                onInitParamChange={(paramName, val) => this.updateGroupInitParams(i, paramName, val)}
                                setGroupAsActive={() => this.setGroupAsActive(i)}
                                removeGroup={() => this.removeGroup(i)}
                                splitGroup={() => this.splitGroup(i)}
                                moveStructToActiveGroup={this.moveStructToActiveGroup}
                            />
                        })}
                        <div onClick={this.addGroup}>New Group</div>
                    </div>: null}

                    {this.selectedPlotables.length > 0 ? <div className="sectionHeader">
                        Plotables
                    </div> : null}

                    {Object.keys(plotables).map(plot => <div>
                        <div style={{textAlign: "left", fontSize: "1.1em", marginTop: 20}}>{plot}</div>
                        <div style={{marginLeft: 30, paddingLeft: 20, borderLeftStyle: "solid", borderWidth: 1, borderColor: "#ccc"}}>
                            {plotables[plot].map(plotable => this.renderPlotable(plotable))}
                        </div>
                    </div>)}

                    {[...this.selectedPlotables, ...this.selectedStructs].length == 0 ? this.nothingToPlotMessage() : null}

                    <div style={{ display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center", paddingTop: 20 }}>

                        <Button
                            style={{marginRight: 20}}
                            onClick={this.toggleVisibility}
                            endIcon={<MdClose />}
                        >
                            Dismiss
                        </Button>

                        <Button
                            style={{ marginLeft: 20 }}
                            onClick={this.getNewPlot}
                            endIcon={<MdDone/>}
                        >
                            Initialize plots      
                        </Button>

                    </div>     

                </Card>
            </div>
        )
    }
}

const mapStateToProps = state => ({
    activeStructs: selectActiveStructs(state),
    activePlotables: selectActivePlotables(state),
    tabs: state.session.tabs,
    active: state.active,
})

const mapDispatchToProps = {
    setActiveTab,
    addPlots,
    setActiveStructs,
    setActivePlotables,
    informLoadingPlot,
    informLoadedPlot,
    deactivateStruct,
    deactivatePlotable
}

export default connect(mapStateToProps, mapDispatchToProps)(PlotInitializer);
