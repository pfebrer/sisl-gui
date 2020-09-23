import React, { Component } from 'react'

//--Components
import Switch from '@material-ui/core/Switch';
import Button from '@material-ui/core/Button';
import 'rc-slider/assets/index.css';

import _ from "lodash"
import InputField from '../InputField';

export default class QueriesField extends Component {

    constructor(props){
        super(props)

        this.state = {
            displayColorPicker: {}
        }
    }

    addQuery = () => {

        let newQuery = this.props.setting.inputField.queryForm.reduce((map, queryParam) => {
            map[queryParam.key] = queryParam.default || null
            return map
        }, {})

        newQuery.active = true

        this.props.onChange([...this.props.value, newQuery])
    }

    changeSettingValue = (iQuery, paramKey, paramValue) => {

        let newValue = _.cloneDeep(this.props.value)

        newValue[iQuery] = { ...newValue[iQuery], [paramKey]: paramValue}

        this.props.onChange(newValue)
    }

    renderQuery = (query, iQuery) => {

        return (

            <div key={iQuery} style={{display: "flex", justifyContent: "center", alignItems: "center", marginBottom: 10}}>
                <Switch
                    id={iQuery+"active"}
                    checked={query.active}
                    onChange={(e) => this.changeSettingValue(iQuery, "active", e.target.checked) }/>
                <div className="queryCard MuiPaper-elevation3" style={{flex: 1, background: query.active ? "#CBFFC0" : "#ffc3cd", borderRadius: 10, margin: 10}}>
                    <div style={{display:"flex", flexWrap: "wrap", justifyContent: "space-around"}}>
                        {this.props.setting.inputField.queryForm.map(queryParam => <InputField 
                                                                                    id={String(iQuery) + queryParam.key}
                                                                                    setting={queryParam}
                                                                                    value={query[queryParam.key]}
                                                                                    onValueChange={(val) => this.changeSettingValue(iQuery, queryParam.key, val)}/>)}
                    </div>   
                </div>
            </div>
            
        )

    }

    render() {

        const value = this.props.value || []

        return (
            <div>
                <div style={{paddingBottom: 10}}>{this.props.setting.name}</div>
                <div>
                    {value.map( (query, iQuery) => this.renderQuery(query, iQuery))}
                    <Button
                        data-tip="Add a new query"
                        onClick={this.addQuery}>
                        Add Query
                    </Button>
                </div>
            </div>
            
        )
    }
}
