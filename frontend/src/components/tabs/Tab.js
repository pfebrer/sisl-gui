import React, { Component } from 'react'
import { connect } from 'react-redux'

import PythonApi from '../../apis/PythonApi'
import { setActiveTab } from '../../redux/actions'

import { MdRemoveCircle } from 'react-icons/md'

class Tab extends Component {

    updateTabs = (tabs) => {
        document.dispatchEvent(new CustomEvent("updateTabs", {detail: {tabs: tabs}}))
    }

    updateTabParams = (tabID, newTabParams) => {

        PythonApi.updateTab(tabID, newTabParams)
    }

    removeTab = (tabID) => {

        PythonApi.removeTab(tabID)

    }

    updateTabName = (e) => {e.target.blur(); this.updateTabParams(e.target.id, {name: e.target.textContent})}

    render() {

        let {id: tabID, name: tabName} = this.props.tab

        let active = tabID === this.props.active.tab

        return (
            <div
                    key={tabID}
                    className={active ? "active plotTab" : "plotTab"}
                    onClick={active ? null : ()=> this.props.setActiveTab(tabID)}>
                <div
                    id={tabID}
                    contentEditable={active}
                    
                    onBlur={this.updateTabName}
                    onKeyUp={(e) => {if (e.keyCode === 13) this.updateTabName(e)}}
                    >{tabName}</div>
                {active ? <div className="removeTabBut" onClick={() => this.removeTab(tabID)}><MdRemoveCircle size={20}/></div> : null}
            </div>
        )
    }
}

const mapStateToProps = state => ({
    active: state.active,
    tabs: state.tabs,
})

const mapDispatchToProps = {
    setActiveTab
}

export default connect(mapStateToProps, mapDispatchToProps)(Tab);
