import React, { Component } from 'react'
import { connect } from 'react-redux'

import {Button, Icon} from 'react-materialize'
import { FaSave} from 'react-icons/fa'
import { AiOutlineUpload } from 'react-icons/ai'
import { setActivePage } from '../../redux/actions'

import PythonApi from '../../apis/Socket'
import NavigateButton from './NavigateButton'

import { GlobalHotKeys } from 'react-hotkeys'
import { GLOBAL_HOT_KEYS } from '../../utils/hotkeys'

class Controls extends Component {

    hotKeysHandler = {
        SAVE_SESSION: () => this.saveCurrentSession(),
        LOAD_SESSION: () => this.loadSession()
    }

    syncWithSession = (session) => {
        document.dispatchEvent(new CustomEvent("syncWithSession", {detail: {session}}))
    }

    showPage = (pageName) => {
        this.props.setActivePage(pageName)
    }

    saveCurrentSession = () => {
        let path = prompt("Please provide the path to save the session.\n\nRoot directory:\n" + this.props.session.settings.rootDir)
        if (!path) return 

        PythonApi.saveSession(path)
    }

    loadSession = () => {

        let path = prompt("Please provide the path of the saved session.\n\nRoot directory:\n" + this.props.session.settings.rootDir)
        if (!path) return

        PythonApi.loadSession(path)
    }

    render() {

        const margins = { marginRight: 20, padding: 0, display:"flex", justifyContent: "center", alignItems: "center"}

        return (
            <div style={{display: "flex", justifyContent: "flex-end", marginBottom: 10, marginTop: 10}}>
                <GlobalHotKeys keyMap={GLOBAL_HOT_KEYS} handlers={this.hotKeysHandler}/>
                    <NavigateButton to="plots" style={margins}/>
                    <NavigateButton to="settings" style={margins}/>
                    <Button
                        data-tip="Save session"
                        style={margins}
                        floating
                        icon={<FaSave size={20}/>} 
                        onClick={this.saveCurrentSession}
                        className="yellow darken-1" />
                    <Button
                        data-tip="Load session"
                        style={margins}
                        floating
                    icon={<AiOutlineUpload size={20}/>}
                        onClick={this.loadSession}
                        className="green" />
                
            </div>
        )
    }
}

export class Control extends Component {

    render(){
        
        return <Button
                    data-tip={this.props.tooltip}
                    style={this.props.style}
                    floating
                    icon={<this.props.icon size={20}/>}
                    onClick={this.props.onClick}
                    className={this.props.className} />
    }
}

const mapStateToProps = state => ({
    session: state.session
})

const mapDispatchToProps = {
    setActivePage
}

export default connect(mapStateToProps, mapDispatchToProps)(Controls);
