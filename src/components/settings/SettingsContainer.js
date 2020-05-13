import React, { Component } from 'react'

import Button from '@material-ui/core/Button'
import Icon from '@material-ui/core/Icon'
import MuiExpansionPanel from '@material-ui/core/ExpansionPanel';
import MuiExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import MuiExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa'
import { MdRestore } from 'react-icons/md'

import InputField from "./InputField"

import parse from 'html-react-parser';
import _ from "lodash"
import { HotKeys, ObserveKeys } from 'react-hotkeys';
import { SETTING_GROUP_HOT_KEYS, SETTING_CONTAINER_HOT_KEYS } from '../../utils/hotkeys';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';

export default class SettingsContainer extends Component {

    constructor(props){
        super(props)
    }

    hotKeysHandlers = {
        MOVE_EXPANDED_UP: () => this.moveExpanded("up"),
        MOVE_EXPANDED_DOWN: () => this.moveExpanded("down")
    }

    moveExpanded = (direction = "down") => {

        var newExpanded;
        if (direction == "up"){
            newExpanded = this.state.expanded != 0 ? this.state.expanded - 1 : 2
        } else if (direction == "down"){
            newExpanded = this.state.expanded != 2 ? this.state.expanded + 1 : 0 
        }

        this.setState({expanded: newExpanded})
    }

    renderSettingsGroup = (settingsGroup) => {

        return settingsGroup.map(setting => {

            if (!setting.inputField) return null
        
            return <InputField 
                        key={setting.key}
                        setting={setting} 
                        value={this.props.settings[setting.key]}
                        onSettingChangeType={this.props.onSettingChangeType}
                        onSettingChangeExtraParams={this.props.onSettingChangeExtraParams}/>
        }) 
    }

    renderSettingsGroups = (groupedParams) => {

        return this.props.paramGroups.map((paramGroup, iParamGroup) => {

            let groupKey = paramGroup.key ? paramGroup.key : "null";

            let settingsGroup = groupedParams[groupKey]

            if (!settingsGroup) return null

            let subGrouped = _.groupBy(settingsGroup, "subGroup")

            let subGroups = paramGroup.subGroups ? [{key: "null", name: null},  ...paramGroup.subGroups] : [{key: "null", name: null}]

            let itemContent = subGroups.map(({key, name}) => {

                if ( ! subGrouped[key] ) return null
                
                return <div key={key}>
                    <div style={{paddingBottom: 20, fontWeight:"bold", fontSize: "1.3em", textAlign: "left"}}>{name}</div>
                    <div style={{display: "flex", flexWrap: "wrap", justifyContent: "space-around", alignItems: "center"}}>{this.renderSettingsGroup(subGrouped[key])}</div>
                </div>
            })

            const submitSettings = () => this.props.submitSettings( settingsGroup.reduce((settings, setting) => {
                settings[setting.key] = this.props.settings[setting.key]
                return settings
            }, {}))

            const hotKeysHandlers = {
                SUBMIT_SETTINGS: submitSettings,
                UNDO_SETTINGS: this.props.undoSettings,
            }

            return (
                <MuiExpansionPanel
                    key={groupKey}>
                    <MuiExpansionPanelSummary style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                        <Icon>{paramGroup.icon}</Icon>
                        <span style={{paddingLeft: 10}}>{paramGroup.name}</span>
                    </MuiExpansionPanelSummary>
                    <MuiExpansionPanelDetails>
                        <HotKeys keyMap={SETTING_GROUP_HOT_KEYS} handlers={hotKeysHandlers}>
                            <ObserveKeys>
                                <blockquote style={{ textAlign: "left" }}>
                                    {parse(paramGroup.description)}
                                </blockquote>
                                {itemContent}
                                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-around" }}>
                                    <Button
                                        onClick={this.props.undoSettings}
                                        data-tip="This will roll back to previous settings.<br> IT AFFECTS ALL GROUPS OF PARAMETERS, not only this one."
                                        className="orange"
                                        style={{ margin: 20 }}>
                                        <FaAngleLeft />Previous settings
                            </Button>

                                    <Button
                                        data-tip="This will restore all settings to the plot's defaults"
                                        className="red" style={{ margin: 20 }}><MdRestore />Restore defaults</Button>

                                    <Button
                                        data-tip="This will change the settings and will update everything accordingly.<br> IT ONLY AFFECTS THIS GROUP OF SETTINGS, not all settings"
                                        onClick={submitSettings}
                                        className="blue"
                                        style={{ margin: 20 }}>
                                        Submit settings<FaAngleRight />
                                    </Button>

                                </div>
                            </ObserveKeys>
                        </HotKeys>
                    </MuiExpansionPanelDetails>
                </MuiExpansionPanel> 
            )

        })
    }

    render() {

        let groupedParams = _.groupBy(this.props.params, "group")

        return (
            <div style={this.props.style}>
                {this.renderSettingsGroups(groupedParams)}          
            </div>
        )
    }
}

