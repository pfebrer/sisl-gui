import React, { Component } from 'react'
import PythonApi from "../apis/PythonApi"

//--Components
import ReactTooltip from "react-tooltip"
import SettingsContainer from "../components/settings/SettingsContainer"

//--Redux
import { connect } from 'react-redux'
import { setCurrentSession } from "../redux/actions"

import _ from "lodash"
import { CHANGE_SESSION_SETTINGS } from '../redux/actions/actionTypes'

class Settings extends Component {

    constructor(props){
        super(props)

        this.state = {}
    }

    submitSettings = (settings) => {

        PythonApi.updateSessionSettings(settings)

    }

    undoSettings = () => {
        PythonApi.undoSessionSettings()
    }

    render() {

        if ( _.isEmpty(this.props.session) ) return null

        return (
            <div className="scrollView" style={{...this.props.style, padding: 20}}>
                <SettingsContainer
                    defaultActiveKey={1}
                    settings={this.props.session.settings}
                    params={this.props.session.params}
                    paramGroups={this.props.session.paramGroups}
                    onSettingChangeType={CHANGE_SESSION_SETTINGS}
                    submitSettings={this.submitSettings}
                    undoSettings={this.undoSettings}/>
                <ReactTooltip multiline disable={this.props.session.settings ? !this.props.session.settings.showTooltips : false}/>
            </div>
            
        )
    }
}

const mapStateToProps = state => ({
    session: state.session
})

const mapDispatchToProps = dispatch => ({
    setCurrentSession: (session) => dispatch(setCurrentSession(session)),
})

export default connect(mapStateToProps, mapDispatchToProps)(Settings);
