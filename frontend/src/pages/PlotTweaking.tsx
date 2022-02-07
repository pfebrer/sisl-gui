import { FC } from 'react'
import Grid from '@material-ui/core/Grid';
import ReactTooltip from "react-tooltip"

import PythonApi from "../apis/PythonApi"

//--Components
import PlotCard from '../components/plots/PlotCard'
import SettingsContainer from '../components/settings/SettingsContainer'

//--Redux
import { connect } from 'react-redux'
import { selectActivePlot } from '../redux/reducers'
import { PlotInterface, SessionInterface } from '../interfaces';

interface PlotTweakingProps {
    plots: {[key: string]: PlotInterface},
    activePlot: PlotInterface,
    session: SessionInterface,
    browser: any,
    style: {[key: string]: any},
    goto?: (path: string) => void,
}

const PlotTweaking:FC<PlotTweakingProps> = (props) => {
    const activePlot = props.activePlot

    if (! activePlot ) return null
    const plotSettings = activePlot.settings

    console.warn(activePlot)

    let setsCont = <SettingsContainer
                        className={"SISL_SETTING_PLOT SISL_SETTING_PLOTCLASS_" + activePlot.plotClass} 
                        settings={plotSettings}
                        params={activePlot.params}
                        paramGroups={activePlot.paramGroups}
                        submitSettings={(settings) => PythonApi.updatePlotSettings(activePlot.id, settings)}
                        undoSettings={() => PythonApi.undoPlotSettings(activePlot.id)}/>
    
    return (
        <div style={{...props.style, }}>
            <Grid container style={{paddingLeft: "20px"}}>
                <Grid item sm={12} md={4} style={{height:"90vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems:"center"}}>
                    <PlotCard plot={activePlot} style={{height: "80vh"}}/>
                </Grid>
                <Grid item sm={12} md={8} style={{ padding: 20, display: "flex", flexDirection: "column"}} >
                    {props.browser.mediaType === "infinity" ? <div className="scrollView" style={{ maxHeight: "90vh"}}>{setsCont}</div> : setsCont}
                </Grid>
            </Grid>
            <ReactTooltip effect="solid" multiline disable={props.session.settings ? !props.session.settings.showTooltips : false}/>  
        </div>
        
    )
}

const mapStateToProps = (state: {[key:string]: any}) => ({
    plots: state.plots,
    activePlot: selectActivePlot(state),
    session: state.session,
    browser: state.browser
})

export default connect(mapStateToProps)(PlotTweaking);
