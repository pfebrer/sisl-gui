import { Component } from 'react'
import Tab from './Tab'
import { setActiveTab } from '../../redux/actions'
import PythonApi from '../../apis/PythonApi'
import { connect } from 'react-redux'

import _ from "lodash"
import { GlobalHotKeys } from 'react-hotkeys'
import { TABS_HOT_KEYS } from '../../utils/hotkeys'

export class Tabs extends Component {

    hotKeysHandlers = {
        MOVE_TO_NEXT_TAB: () => this.moveThroughTabs("right"),
        MOVE_TO_PREVIOUS_TAB: () => this.moveThroughTabs("left"),
        NEW_TAB: () => this.newTab(),
        TRY: () => console.warn("YES")
    }
    
    moveThroughTabs = (direction) => {

        const tabs = this.props.tabs
        const i = _.findIndex(tabs, ["id", this.props.active.tab])

        var newI;
        if (direction === "left"){
            newI = i !== 0 ? i-1 : tabs.length -1
        } else if (direction === "right"){
            newI = i !== tabs.length - 1 ? i+1 : 0 
        }

        this.props.setActiveTab(tabs[newI].id)
    }

    updateTabs = (tabs) => {
        document.dispatchEvent(new CustomEvent("updateTabs", {detail: {tabs: tabs}}))
    }

    newTab = () => {

        PythonApi.addTab()
        
    }

    noTabsMessage = () => {
        return <div style={{paddingLeft: 20}}>
            <span style={{color: "darkred"}}>You don't seem to have any tab. </span>
        </div>
    }

    render() {

        const tabs = this.props.tabs || []
        const TabComponent = this.props.tabComponent || Tab
        const NewTabComponent = this.props.newTabComponent || ((props) => null)
        const noTabsComponent = this.props.noTabsComponent || this.noTabsMessage()

        return (
            <div style={{display: "flex", flexWrap: "wrap", alignItems:"center", ...this.props.style}}>
                <GlobalHotKeys keyMap={TABS_HOT_KEYS.global} handlers={this.hotKeysHandlers}/>
                {tabs.length === 0 ? 
                    noTabsComponent
                    :
                    tabs.map( 
                        tab => <TabComponent 
                            tab={tab} 
                            selected={this.props.active.tab === tab.id}
                            selectTab={() => this.props.setActiveTab(tab.id)}
                            removeTab={() => PythonApi.removeTab(tab.id)}
                            updateTabName={(name) => PythonApi.updateTab(tab.id, {name: name})}
                        />
                    )
                }
                <NewTabComponent onClick={this.newTab}/>
            </div>
        )
    }
}

const mapStateToProps = state => ({
    tabs: state.session.tabs,
    active: state.active
})

const mapDispatchToProps = {
    setActiveTab
}

export default connect(mapStateToProps, mapDispatchToProps)(Tabs);
