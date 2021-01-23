import React, { Component } from 'react'
import { MdRemove } from 'react-icons/md'
import { deactivatePlotable, setPlotablePlots } from '../../redux/actions'

import { connect } from 'react-redux'
import PlotTypePicker from './PlotTypePicker'

class PlotableRow extends Component {
    render() {

        const plotable = this.props.plotable

        return (
            <div style={{ display: "flex", flexDirection: "row", alignItems: "center", marginTop: 10 }}>
                <div style={{ display: "flex", flexDirection: "row", alignItems: "center"}}>
                    <div style={{ color: "darkred", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center" }} onClick={() => this.props.deactivatePlotable(plotable.id)}>
                        <MdRemove />
                    </div>
                    <div data-tip={plotable.path} style={{marginLeft: 20}}>{"(.../" + plotable.path.split("/").slice(-2, -1)[0] + ")"}</div>
                    <div style={{  marginLeft: 20, padding: 10, backgroundColor: "whitesmoke", borderRadius: 3 }}>
                        {plotable.name}
                    </div>
                </div>
                <div style={{flex: 1, paddingLeft: 20, paddingRight: 20}}>
                    <PlotTypePicker 
                        options={plotable.plots.map(plotOption => ({value: plotOption, label: plotOption}))} 
                        value={plotable.chosenPlots}
                        onChange={(plotTypes) => this.props.setPlotablePlots(plotable.id, plotTypes)}
                    />
                </div>
                
            </div> 
        )
    }
}

const mapDispatchToProps = {
    deactivatePlotable,
    setPlotablePlots
}

export default connect(null, mapDispatchToProps)(PlotableRow);

