import { FC } from 'react'
import PlotTypePicker from './PlotTypePicker'
import TabPicker from './TabPicker'
import StructureRow from './StructureRow'
import MergeMethodPicker from './MergeMethodPicker'
import { Grid } from '@material-ui/core'
import { StructureInterface } from '../../interfaces'

export interface StructureGroup {
    structs: StructureInterface[],
    active?: boolean,
    initializingOptions: {
        tabID: string,
        plotClasses: string[],
        mergeMethod: string,
    }
}

interface StructuresGroupProps extends StructureGroup {
    splitGroup: () => void,
    removeGroup: () => void,
    setGroupAsActive: () => void,
    moveStructToActiveGroup: (id: string) => void,
    onInitParamChange: (tabID: string, val: any) => void,
}

const StructuresGroup:FC<StructuresGroupProps> = (props) => {
    const { tabID, plotClasses, mergeMethod } = props.initializingOptions
    const activenessStyles = props.active ? {
        backgroundColor: "#ccc"
    } : {
        backgroundColor: "whitesmoke"
    }

    return (
        <div>
            <div style={{ display: "flex", flexDirection: "row", margin: -4 }}>
                <div className="structGroupAction" style={activenessStyles} onClick={props.splitGroup}>Split</div>
                <div className="structGroupAction" style={activenessStyles} onClick={props.removeGroup}>Remove</div>
                {props.active ?
                    null
                    :
                    <div className="structGroupAction" style={activenessStyles} onClick={props.setGroupAsActive}>Mark as receptive</div>
                }
                <div style={{ flex: 1 }} />
            </div>
            <Grid container spacing={1} style={{ transition: "all 300ms", display: "flex", flexWrap: "wrap", padding: 20, marginTop: 0, marginBottom: 20, borderRadius: 5, borderTopLeftRadius: 0, justifyContent: "center", alignItems: "center", ...activenessStyles }}>
                <Grid item sm={12} md={4} lg={3}>
                    {props.structs.map(struct => <StructureRow structure={struct} groupActive={props.active} moveStructToActiveGroup={() => props.moveStructToActiveGroup(struct.id)} />)}
                </Grid>
                <Grid item sm={12} md={4} lg={3}>
                    <PlotTypePicker value={plotClasses} onChange={(val) => props.onInitParamChange("plotClasses", val)} />
                </Grid>
                <Grid item sm={12} md={4} lg={3}>
                    <TabPicker value={tabID} onChange={(val) => props.onInitParamChange("tabID", val)} />
                </Grid>
                <Grid item sm={12} md={4} lg={3}>
                    <MergeMethodPicker value={mergeMethod} onChange={(val) => props.onInitParamChange("mergeMethod", val)} />
                </Grid>
            </Grid>
        </div>
    )
}

export default StructuresGroup;