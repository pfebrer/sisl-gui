import { useContext, useRef, useState } from 'react'

import _ from "lodash"

//--Components
import PlotDashboard from '../components/plots/PlotDashboard';

//--Python api 
import PythonApi from '../apis/PythonApi'

//--Redux
import { connect } from 'react-redux'
import { setActivePlot, setActivePage} from "../redux/actions"
import PlotInitializer from '../components/plotInitializer/PlotInitializer'
import PlotTweaking from './PlotTweaking'

import { Button, IconButton, TextField, Toolbar} from '@material-ui/core';

import {getApplicationKeyMap, GlobalHotKeys, configure} from 'react-hotkeys'
import PlotMethods from './PlotMethods';
import PlotEditor from './PlotEditor';
import { GLOBAL_HOT_KEYS } from '../utils/hotkeys';
import Tabs from '../components/tabs/Tabs';
import { MdRemoveCircle, MdAddCircle } from 'react-icons/md';
import StructurePickerProvider, { PickerSelectedContext } from '../components/structures/pickerContext';

configure({logLevel: "debug", simulateMissingKeyPressEvents: false})

const Tab = (props) => {
    const [editable, setEditable] = useState(false)

    if (editable && !props.selected) setEditable(false)

    const updateTabName = (e) => {
        if (e.key === 'Enter') {
            props.updateTabName(e.target.value);
            setEditable(false)
        }
    }

    const {name: tabName} = props.tab

    if (editable) {
        return <TextField label="Tab name" defaultValue={tabName} onKeyPress={updateTabName}/>
    } else {
        return <Button 
            color="inherit"
            style={{backgroundColor: props.selected ? "whitesmoke" : undefined, marginRight: 10}}
            onClick={props.selected ? undefined : props.selectTab}
            onDoubleClick={() => setEditable(true)}
            endIcon={props.selected ? <MdRemoveCircle className="removeTabBut" onClick={props.removeTab}/> : undefined}
            >{tabName}</Button>
    }
}

const NewTabButton = (props) => {
    return <IconButton color="inherit" aria-label="add new tab" component="span" onClick={props.onClick}>
        <MdAddCircle color="green" className='newTabIcon'/>
    </IconButton>
}

const Plots = (props) => {
    const {pickerSelected} = useContext(PickerSelectedContext)

    const nSelected = Object.keys(pickerSelected).reduce((n, k) => n + pickerSelected[k].length, 0)
    const selectedRef = useRef(nSelected)

    // Selected objects have changed, toggle the plot initializer
    if (selectedRef.current !== nSelected) {
        console.warn(nSelected, props.active.page)
        if (nSelected === 0 && props.active.page === "plotInitializer") {
            props.setActivePage("plots")
        } else if (nSelected > 0 && props.active.page !== "plotInitializer") {
            props.setActivePage("plotInitializer")
        }
        selectedRef.current = nSelected
    }

    const activeTab = _.find(props.tabs, ["id", props.active.tab])
    if (activeTab){
        //Get the missing plots if there are any
        activeTab.plots.forEach(plotID => {

            if (!props.plots[plotID]) {

                PythonApi.getPlot(plotID)

            }
        })
    }

    const hotKeysHandlers = {
        GO_TO_DASHBOARD: () => props.setActivePage("plots"),
        SHOW_AVAIL_HOTKEYS: () => console.warn(getApplicationKeyMap())
    }

    if (!props.active.plot && !["plotInitializer", "plots"].includes(props.active.page)) {
        props.setActivePage("plots")
    }

    const MainComponent = {
        'plots': PlotDashboard,
        'plotLayoutEditor': PlotEditor,
        'plotTweaking': PlotTweaking,
        'plotMethods': PlotMethods,
        'plotInitializer': PlotInitializer,
    }[props.active.page]

    return (
        <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <GlobalHotKeys keyMap={{ ...GLOBAL_HOT_KEYS }} handlers={hotKeysHandlers} />
            <Toolbar style={{ backgroundColor: "#cccccc" }}>
                {["plots"].includes(props.active.page) ? null :
                    <Button color="inherit" onClick={() => props.setActivePage("plots")}>BACK TO DASHBOARD</Button>
                }
                {props.active.page === "plots" ? <Tabs tabComponent={Tab} newTabComponent={NewTabButton} /> : null}
            </Toolbar>
            <MainComponent
                style={{ flex: 1 }}
                session={props.session}
                goto={props.setActivePage}
            />
        </div>
    )

}

const PlotsWithProvider = (props) => {
    return <StructurePickerProvider>
        <Plots {...props}/>
    </StructurePickerProvider>
}

const mapStateToProps = state => ({
    plots: state.plots,
    tabs: state.session.tabs,
    active: state.active,
    session: state.session
})

const mapDispatchToProps = {
    setActivePlot,
    setActivePage
}

export default connect(mapStateToProps, mapDispatchToProps)(PlotsWithProvider);