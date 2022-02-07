import { FC, useState } from 'react'

import Button from '@material-ui/core/Button'
import Icon from '@material-ui/core/Icon'
import MuiExpansionPanel from '@material-ui/core/ExpansionPanel';
import MuiExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import MuiExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import { FaAngleRight } from 'react-icons/fa'
import { MdRestore } from 'react-icons/md'

import InputField from "./InputField"

import parse from 'html-react-parser';
import _ from "lodash"
import { Formik } from 'formik'

import { ParamGroupInterface, ParamInterface} from '../../interfaces';

interface SettingsFormProps {
    paramGroup: ParamGroupInterface,
    groupedParams: {
        [key:string]: ParamInterface[] | undefined
    },
    index: number,
    settings: { [key:string]: any },
    submitSettings: (settings: {[key:string]: any}) => void,
    undoSettings: () => void,
    style?: Object,
}

const SettingsForm:FC<SettingsFormProps> = props => {
    const [changedFields, setChangedFields] = useState<string[]>([])

    const paramGroup = props.paramGroup;
    const groupedParams = props.groupedParams;

    const groupKey = paramGroup.key ? paramGroup.key : "null";
    const settingsGroup = groupedParams[groupKey]

    if (!settingsGroup) return null

    const subGrouped = _.groupBy(settingsGroup, "subGroup")

    const nullSubGroup = {key: "null", name: null, icon: "", description:""}
    const subGroups = paramGroup.subGroups ? [nullSubGroup,  ...paramGroup.subGroups] : [nullSubGroup]

    return (
        <Formik
            enableReinitialize
            initialValues={props.settings}
            onSubmit={(values) => {
                props.submitSettings(Object.fromEntries(
                    Object.entries(values).filter(([key, value]) => changedFields.includes(key))
                ))
            }}
            >
                {({values, handleChange, handleSubmit, setFieldValue, resetForm}) => (
                    <form className={`SISL_INPUTGROUP SISL_INPUTGROUP_${paramGroup.key}`} onSubmit={handleSubmit}>
                        <blockquote style={{ textAlign: "left" }}>
                            {parse(paramGroup.description)}
                        </blockquote>
                        <div className="subgroupscontainer">
                            {subGroups.map(({key, name}) => {

                                if ( ! subGrouped[key] ) return null

                                return <div key={key} className={`SISL_INPUTSUBGROUP SISL_INPUTSUBGROUP_${key}`}>
                                    <div className="namediv" style={{paddingBottom: 20, fontWeight:"bold", fontSize: "1.3em", textAlign: "left"}}>{name}</div>
                                    <div className="fieldscontainer">{ subGrouped[key].map(setting => {

                                    if (!setting.inputField) return null

                                    return <InputField 
                                            key={setting.key}
                                            onValueChange={(value) => {
                                                setChangedFields([...changedFields, setting.key])
                                                setFieldValue(setting.key, value)
                                            }}
                                            setting={setting} 
                                            value={values[setting.key]} />
                                    })}
                                    </div>
                                </div>
                            })}
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-around" }}>
                            {/* <Button
                                onClick={props.undoSettings}
                                data-tip="This will roll back to previous settings.<br> IT AFFECTS ALL GROUPS OF PARAMETERS, not only this one."
                                className="orange"
                                style={{ margin: 20 }}>
                                <FaAngleLeft />Previous settings
                            </Button> */}

                            <Button
                                onClick={() => resetForm()}
                                data-tip="This will restore the settings to the current ones"
                                style={{ margin: 20 }}><MdRestore />Restore</Button>

                            <Button
                                type="submit"
                                data-tip="This will change the settings and will update everything accordingly.<br> IT ONLY AFFECTS THIS GROUP OF SETTINGS, not all settings"
                                style={{ margin: 20 }}>
                                Submit settings<FaAngleRight />
                            </Button>
                        </div>
                    </form>
                )}
        </Formik>
    )
}

interface SettingGroupsCollapseProps extends SettingsFormProps {}

const SettingGroupsCollapse:FC<SettingGroupsCollapseProps> = props => {
    const paramGroup = props.paramGroup;

    const groupKey = paramGroup.key ? paramGroup.key : "null";

    return (
        <MuiExpansionPanel
            key={groupKey}>
            <MuiExpansionPanelSummary style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                <Icon>{paramGroup.icon}</Icon>
                <span style={{paddingLeft: 10}}>{paramGroup.name}</span>
            </MuiExpansionPanelSummary>
            <MuiExpansionPanelDetails>
                <SettingsForm {...props} />
            </MuiExpansionPanelDetails>
        </MuiExpansionPanel> 
    )
}

interface SettingsContainerProps {
    className?: string,
    settings: {[key:string]: any}
    params: ParamInterface[],
    paramGroups: ParamGroupInterface[],
    submitSettings: (settings: {[key:string]: any}) => void,
    undoSettings: () => void,
    style?: Object,
}

const SettingsContainer:FC<SettingsContainerProps> = props => {
    let groupedParams = _.groupBy(props.params, "group")

    return (
        <div style={props.style} className={props.className}>
            {props.paramGroups.map((paramGroup, iParamGroup) => (
                <SettingGroupsCollapse
                    key={iParamGroup} 
                    index={iParamGroup}
                    paramGroup={paramGroup} 
                    groupedParams={groupedParams}
                    {...props}
                    />
            )) }        
        </div>
    )
}

export default SettingsContainer;

