import { FC } from 'react'
import Grid from '@material-ui/core/Grid';
import ReactTooltip from "react-tooltip"

//--Components
import PlotCard from '../components/plots/PlotCard'

//--Redux
import { connect } from 'react-redux'
import PythonApi from '../apis/PythonApi';
import Methods from '../components/pythonMethods/Methods'
import { selectActivePlot } from '../redux/reducers'
import { PlotInterface, SessionInterface } from '../interfaces';

interface PlotMethodsProps {
    activePlot: PlotInterface,
    session: SessionInterface,
    style: {[key: string]: any},
}

const PlotMethods:FC<PlotMethodsProps> = props => {
    return (
        <div style={{...props.style, paddingLeft: "20px"}}>
            {/* <GlobalHotKeys keyMap={PLOT_TWEAKING_HOT_KEYS.global} handlers={this.hotKeysHandlers}/> */}
            <Grid container>
                <Grid item sm={12} md={4} style={{ height: "90vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                    <PlotCard plot={props.activePlot} style={{ height: "80vh" }} />
                </Grid>
                <Grid item sm={12} md={8} style={{ padding: 20, display: "flex", flexDirection: "column" }} >
                    <Methods 
                        shortcuts={props.activePlot.shortcuts}
                        applyMethod={(key:string) => PythonApi.callPlotShortcut(props.activePlot.id, key)}/>
                </Grid>
            </Grid>
            <ReactTooltip multiline disable={props.session.settings ? !props.session.settings.showTooltips : false} />   
        </div>
        
    )
}

const mapStateToProps = (state: any) => ({
    activePlot: selectActivePlot(state),
    session: state.session,
})

export default connect(mapStateToProps)(PlotMethods);
