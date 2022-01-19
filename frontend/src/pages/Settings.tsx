import { FC } from 'react'
import PythonApi from "../apis/PythonApi"

//--Components
import ReactTooltip from "react-tooltip"
import SettingsContainer from "../components/settings/SettingsContainer"

//--Redux
import { connect } from 'react-redux'

import _ from "lodash"
import { SessionInterface } from '../interfaces'

interface SessionSettingsProps {
    session: SessionInterface,
    style: {[key: string]: any},
}

const SessionSettings:FC<SessionSettingsProps> = props => {
    if ( _.isEmpty(props.session) ) return null

    return (
        <div className="scrollView" style={{...props.style, padding: 20}}>
            <SettingsContainer
                settings={props.session.settings}
                params={props.session.params}
                paramGroups={props.session.paramGroups}
                submitSettings={PythonApi.updateSessionSettings}
                undoSettings={PythonApi.undoSessionSettings}/>
            <ReactTooltip multiline disable={props.session.settings ? !props.session.settings.showTooltips : false}/>
        </div>
        
    )
}

const mapStateToProps = (state: {[key: string]: any}) => ({
    session: state.session
})

export default connect(mapStateToProps)(SessionSettings);
