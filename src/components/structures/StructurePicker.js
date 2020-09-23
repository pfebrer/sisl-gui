import React, { Component } from 'react'
import StructureTag from './StructureTag'
import _ from "lodash"
import { setActiveStructs, setActivePlotables } from '../../redux/actions'
import { MdFolder, MdFolderOpen} from 'react-icons/md'

import { connect } from 'react-redux'
import NavigateButton from '../controls/NavigateButton'
import PlotableTag from './PlotableTag'
import TextInput from '../settings/inputFields/TextInput'

function wildTest(wildcard, str) {
    const re = new RegExp(`^${wildcard.replace(/\*/g,'.*').replace(/\?/g,'.')}$`,'i');
    return re.test(str); // remove last 'i' above to have case sensitive
}

export class StructurePicker extends Component {

    constructor(props){
        super(props)

        this.state = {
            searchString: "",
            alphabeticSorting: false,
            selectedSorting: false,
            searchByFolder: false,
            displayStructures: true,
            displayPlotables: false,
        }

    }

    togglePlotInitializer = (selectedStructs, selectedPlotables) => {

        let forceShow, forceHide;

        if ([...selectedStructs, ...selectedPlotables].length !== 0){
            forceShow = true
        } else {
            forceHide = true
        }

        document.dispatchEvent(new CustomEvent("togglePlotInitializer", {detail: {forceShow, forceHide}}))

    }

    selectStructs = (structs) => {
        this.props.setActiveStructs(structs)
        this.togglePlotInitializer(structs, this.selectedPlotables)
    }

    get selectedStructs(){
        return this.props.activeStructs || []
    }

    selectPlotables = (plotables) => {
        this.props.setActivePlotables(plotables)
        this.togglePlotInitializer(this.selectedStructs, plotables)
    }

    get selectedPlotables(){
        return this.props.activePlotables || []
    }

    toggleStruct = ({id: structID}) => {
        
        //this.setState({selectedStructures: _.xor(this.selectedStructs, [structID])})

        this.selectStructs(_.xor(this.selectedStructs, [structID]))
      
    }

    togglePlotable = ({id: plotableID}) => {
        
        //this.setState({selectedPlotableures: _.xor(this.selectedPlotables, [PlotableID])})

        this.selectPlotables(_.xor(this.selectedPlotables, [plotableID]))
      
    }

    toggleStructDisplay = () => {
        this.setState({displayStructures: !this.state.displayStructures})
    }

    togglePlotablesDisplay = () => {
        this.setState({displayPlotables: !this.state.displayPlotables})
    }

    toggleAlphabeticSorting = () => {

        const toggles = { [false]: "asc", asc: "desc", desc: false}
        this.setState({alphabeticSorting: toggles[this.state.alphabeticSorting]})
    }

    toggleSearchByFolder = () => {

        this.setState({searchByFolder: !this.state.searchByFolder})
    }

    toggleSelectedSorting = () => {
        this.setState({selectedSorting: !this.state.selectedSorting})
    }

    toggleAll = () => {

        const onDisplay = Object.keys(this.filterStructs())

        const onDisplaySelected = _.intersection([...this.selectedStructs, ...this.selectedPlotables], onDisplay).length === 0

        const displayedStructs = _.intersection(Object.keys(this.props.structures), onDisplay)
        const displayedPlotables = _.intersection(Object.keys(this.props.plotables), onDisplay)

        this.selectStructs(onDisplaySelected ? 
            [...displayedStructs, ...this.selectedStructs] 
                : 
            this.selectedStructs.filter( structID => !displayedStructs.includes(structID) )
        )

        this.selectPlotables(onDisplaySelected ? 
            [...displayedPlotables, ...this.selectedPlotables] 
                : 
            this.selectedPlotables.filter( plotableID => !displayedPlotables.includes(plotableID) )
        )

    }

    filterStructs = (searchString) => {

        searchString = searchString || this.state.searchString

        console.warn(searchString)
        searchString = searchString.includes("*") || searchString.includes("?") ? searchString : "*"+searchString+"*"

        let structs = {}

        let toggles = [this.state.displayStructures, this.state.displayPlotables]
        
        const structures = this.props.structures || []
        const plotables = this.props.plotables || []
        let objs = [structures, plotables]

        //Filter both structures and plotables
        objs.forEach( (object, index) => {

            if (!toggles[index]) return

            const isPlotable = index === 1

            let newStructs = Object.keys(object).reduce( (structs, structID) => {

                const struct = object[structID]
    
                const toTest = this.state.searchByFolder ? struct.path.split("/").slice(-2,-1)[0] : struct.name.replace(".fdf", "")
    
                if (wildTest(searchString, toTest)){
    
                    structs[structID] = { 
                        ...struct,
                        selected: [...this.selectedStructs, ...this.selectedPlotables].includes(structID),
                        isPlotable,
                        id: structID,
                    }
                }
    
                return structs
            }, {})

            structs = {...structs, ...newStructs}

        })

        return structs

    }

    newSearchString = (searchString) => {

        this.setState({searchString: searchString})
    }

    noStructuresMessage = () => {

        return <div>
            <div style={{color: "darkred"}}>No structures in the search scope right now.</div>
            <div>Try to change file system settings or initialize the GUI from a different directory</div>
            <NavigateButton to="settings" style={{marginTop: 10}}/>
        </div>
    }

    noMatchingStructuresMessage = () => {
        return <div>
            <div style={{color: "darkred"}}>No structure that matches your search.</div>
            <div>Try to change file system settings or initialize the GUI from a different directory</div>
            <NavigateButton to="settings" style={{marginTop: 10}}/>
        </div>
    }

    render() {

        let structsAndPlotables = this.filterStructs()

        if (this.state.alphabeticSorting){
            structsAndPlotables = _.orderBy(structsAndPlotables, "name", this.state.alphabeticSorting)
        }
        if (this.state.selectedSorting){
            structsAndPlotables = _.orderBy(structsAndPlotables, "selected", "desc")
        }
        
        return (
            <div style={{height: "100vh", overflow: "hidden", display: "flex", flexDirection: "column", backgroundColor: "white", ...this.props.style}}>
                <div style={{ display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: 20, marginBottom: 20 }}>
                    <TextInput
                        label="Search string"
                        autocomplete="off"
                        placeholder="Enter your search string..."
                        style={{marginRight: 10}}
                        value={this.state.searchString} 
                        onChange={this.newSearchString}/>
                    <div
                        data-tip="Search by folder"
                        className={"structPickerToggle " + (this.state.searchByFolder ? "active" : "")}
                        onClick={this.toggleSearchByFolder} style={{cursor: "pointer"}}>{this.state.searchByFolder ? <MdFolder/> : <MdFolderOpen/>}</div>
                </div>
                <div style={{display: "flex", justifyContent: "space-between", marginBottom: 5}}>
                    <span
                        data-tip="Show structures"
                        className={"structPickerToggle " + (this.state.displayStructures ? "active" : "")} 
                        onClick={this.toggleStructDisplay} style={{cursor: "pointer"}}>Struct</span>
                    <span
                        data-tip="Show plotables"
                        className={"structPickerToggle " + (this.state.displayPlotables ? "active" : "")}
                        onClick={this.togglePlotablesDisplay} style={{cursor: "pointer"}}>Plotables</span>
                </div>
                <div style={{display: "flex", justifyContent: "space-between", marginBottom: 5}}>
                    <span 
                        className={"structPickerToggle " + (this.state.alphabeticSorting ? "active" : "")} 
                        onClick={this.toggleAlphabeticSorting} style={{cursor: "pointer"}}>A-Z</span>
                    <span
                        data-tip="Show selected first"
                        className={"structPickerToggle " + (this.state.selectedSorting ? "active" : "")}
                        onClick={this.toggleSelectedSorting} style={{cursor: "pointer"}}>sel</span>
                    <span 
                        className="structPickerToggle" 
                        onClick={this.toggleAll} style={{cursor: "pointer"}}>All</span>
                </div>

                {Object.keys({...this.props.structures, ...this.props.plotables}).length === 0 ? 
                    this.noStructuresMessage() : Object.values(structsAndPlotables).length === 0 ? 
                        this.noMatchingStructuresMessage() : null
                }

                <div className="scrollView" >
                    {Object.values(structsAndPlotables).map(obj => {
                        if (obj.isPlotable) {
                            return <PlotableTag id={obj.id} 
                                plotable={obj} 
                                togglePlotable={ () => this.togglePlotable(obj)}
                            />
                        } else {
                            return <StructureTag id={obj.id} 
                                struct={obj} 
                                toggleStruct={ () => this.toggleStruct(obj)}
                            />
                        }
                        
                    })}
                </div>  
            </div>
            
        )
    }
}

const mapStateToProps = state => ({
    activeStructs: state.active.structs,
    activePlotables: state.active.plotables,
    plotables: state.session.plotables,
    structures: state.session.structures
})

const mapDispatchToProps = {
    setActiveStructs,
    setActivePlotables
}

export default connect(mapStateToProps, mapDispatchToProps)(StructurePicker);
