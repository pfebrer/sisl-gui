import React, { Component } from 'react'
import PlotTypePicker from './PlotTypePicker'
import TabPicker from './TabPicker'
import StructureRow from './StructureRow'
import MergeMethodPicker from './MergeMethodPicker'
import { deactivateStruct } from '../../redux/actions'
import { connect } from 'react-redux'
import { Grid } from '@material-ui/core'

class StructuresGroup extends Component {

    render() {

        const {tabID, plotClasses, mergeMethod} = this.props.initializingOptions
        const activenessStyles = this.props.active ? {
            backgroundColor: "#ccc"
        } : {
            backgroundColor: "whitesmoke"
        }

        return (
            <div>
                <div style={{display: "flex", flexDirection: "row", margin: -4}}>
                    <div className="structGroupAction" style={activenessStyles} onClick={this.props.splitGroup}>Split</div>
                    <div className="structGroupAction" style={activenessStyles} onClick={this.props.removeGroup}>Remove</div>
                    {this.props.active ? 
                        null
                            : 
                        <div className="structGroupAction" style={activenessStyles} onClick={this.props.setGroupAsActive}>Mark as receptive</div>
                    }
                    <div style={{flex:1}}/>
                </div>
                <Grid container spacing={1} style={{transition: "all 300ms", display:"flex", flexWrap: "wrap", padding: 20, marginTop: 0, marginBottom: 20, borderRadius: 5, borderTopLeftRadius: 0, justifyContent: "center", alignItems: "center", ...activenessStyles}}>
                    <Grid item sm={12} md={4} lg={3}>
                        {this.props.structs.map(struct => <StructureRow structure={struct} groupActive={this.props.active} moveStructToActiveGroup={() => this.props.moveStructToActiveGroup(struct.id)}/>)}
                    </Grid>
                    <Grid item sm={12} md={4} lg={3}>
                        <PlotTypePicker value={plotClasses} onChange={(val) => this.props.onInitParamChange("plotClasses", val) }/>
                    </Grid>
                    <Grid item sm={12} md={4} lg={3}>
                        <TabPicker value={tabID} onChange={(val) => this.props.onInitParamChange("tabID", val) }/>
                    </Grid>
                    <Grid item sm={12} md={4} lg={3}>
                        <MergeMethodPicker value={mergeMethod} onChange={(val) => this.props.onInitParamChange("mergeMethod", val) }/>
                    </Grid>
                </Grid>
            </div>      
        )
    }
}

const mapDispatchToProps = {
    deactivateStruct
}

export default connect(null, mapDispatchToProps)(StructuresGroup);