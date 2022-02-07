import { FC } from 'react'
import { MdRemove } from 'react-icons/md'

import PlotTypePicker from './PlotTypePicker'
import { PlotableInterface } from '../../interfaces'

interface PlotableRowProps {
    plotable: PlotableInterface,
    plots: string[] | undefined,
    selectPlots: (plots: string[]) => void,
    unselect: () => void
}

const PlotableRow:FC<PlotableRowProps> = (props) => {
    if (!props.plots && props.plotable.default_plot) {
        props.selectPlots([props.plotable.default_plot])
    }

    return (
        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", marginTop: 10 }}>
            <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                <div style={{ color: "darkred", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center" }} onClick={props.unselect}>
                    <MdRemove />
                </div>
                <div data-tip={props.plotable.path} style={{ marginLeft: 20 }}>{"(.../" + props.plotable.path.split("/").slice(-2, -1)[0] + ")"}</div>
                <div style={{ marginLeft: 20, padding: 10, backgroundColor: "whitesmoke", borderRadius: 3 }}>
                    {props.plotable.name}
                </div>
            </div>
            <div style={{ flex: 1, paddingLeft: 20, paddingRight: 20 }}>
                <PlotTypePicker
                    options={props.plotable.plots.map(plotOption => ({ value: plotOption, label: plotOption }))}
                    value={props.plots || [""]}
                    onChange={props.selectPlots}
                />
            </div>

        </div>
    )
}

export default PlotableRow

