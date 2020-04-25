import React, { Component } from "react";

import _ from "lodash"

//--Components
import PlotCard from "./PlotCard";

//--Redux
import { connect } from 'react-redux'
import { setTabPlots, setSessionTabs} from "../../redux/actions"
import PythonApi from "../../apis/PythonApi";

import { Responsive, WidthProvider } from 'react-grid-layout';

import 'react-grid-layout/css/styles.css'
import'react-resizable/css/styles.css'

import { HotKeys, withHotKeys, GlobalHotKeys } from "react-hotkeys";
import { PLOTS_HOT_KEYS, ADDITIONAL_GLOBAL_HOT_KEYS } from "../../utils/hotkeys";
import Tabs from "../tabs/Tabs";

const ResponsiveReactGridLayout = WidthProvider(Responsive);

class PlotDashboard extends React.Component {

  constructor(props){
    super(props)

    this._plotsInLayout = false

  }

  static defaultProps = {
    className: "layout",
    rowHeight: 30,
    onLayoutChange: function() {},
    cols: { lg: 12, sm: 6, xs: 4, xxs: 2 },
  };

  state = {
    currentBreakpoint: "lg",
    compactType: "vertical",
    mounted: false,
    layouts: { lg: [] }
  };

  componentDidMount() {
    this.setState({ mounted: true });
  }

  emptyDashboard = () => {
    return null
  }

  noTabsMessage = () => {
    return null
  }

  noPlotsMessage = () => {
    //className="attentionLeft"
    return <div style={{display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "100%"}}>
      <div style={{fontSize: "5em", fontWeight: "bold"}}>This is the plots dashboard.</div>
      <div style={{fontSize: "1.2em"}}>We would like to display your plots here, but currently you don't seem to have any</div>
      <div style={{backgroundColor: "white",  fontSize: "2em", margin: 20, padding: 20, paddingLeft: 50, paddingRight: 50, borderRadius: 70}}> You can try to create one by clicking on your structures</div>
    </div>
  }

  static newPlotLayout = (plot, layouts) => {
    return {
      x: plot.grid_dims[0]*(layouts.lg.length),
      y: 2,
      w: plot.grid_dims[0],
      h: plot.grid_dims[1],
      i: plot.id,
    };
  }

  generateDOM(layouts, plots) {
    return _.map(layouts, function(l, i) {
      return <div key={plots[i].id}><PlotCard plot={plots[i]}/></div>
    });
  }

  onBreakpointChange = (breakpoint) => {
    document.dispatchEvent(new CustomEvent("plotResize", {detail: {id: "all"}}))
  };

  onResizeStop = (layouts, finalL, initL) => {
    document.dispatchEvent(new CustomEvent("plotResize", {detail: {id: initL.i, higher: finalL.h > initL.h}}))
  }

  shouldComponentUpdate = (newProps) => {

    if( !this._plotsInLayout ) return true

    const isDifferentTab = newProps.active.tab != this.props.active.tab
    let hasDifferentPlots;
    if (!isDifferentTab){
      let tab = _.find(this.props.tabs, ["id", this.props.active.tab])
      let newTab = _.find(newProps.tabs, ["id", newProps.active.tab])

      if (!tab || !newTab) return true
      else if (!tab.layouts || !newTab.layouts) return true
      else if (_.isEqual(tab.layouts, newTab.layouts)) return true
      else if (! _.isEqual(this._plotsInLayout, newTab.plots)) return true

      hasDifferentPlots = ! _.isEqual(tab.plots, newTab.plots)
    }
    
    return isDifferentTab || hasDifferentPlots
  }

  onLayoutChange = (layout, layouts) => {
    this.props.onLayoutChange(layout, layouts);

    PythonApi.setTabLayouts(this.props.active.tab, layouts)
  };

  onDrop = (elemParams) => {
    alert(`Element parameters: ${JSON.stringify(elemParams)}`);
  };

  getLayout = () => {
    if (!this.props.active.tab ) return this.noTabsMessage()

    let tab = _.find(this.props.tabs, ["id", this.props.active.tab])

    if (!tab) return this.noTabsMessage()
    if (tab.plots.length == 0) return this.noPlotsMessage()
    
    let plots = tab.plots.map(plotID => this.props.plots[plotID])

    plots = plots.filter( plot => plot)

    // Wait for all plots to draw a first layout
    // THIS IS KEY in order to avoid the layout going crazy
    if (plots.length != tab.plots.length) return null

    let layouts = tab.layouts

    if (layouts.lg.length != plots.length){
      layouts.lg = plots.map(plot => {
        let layout = _.find(layouts.lg, ["i", plot.id])
        return layout || PlotDashboard.newPlotLayout(plot, layouts)
      })
    }

    this._plotsInLayout = tab.plots

    return (
      <ResponsiveReactGridLayout
        {...this.props}
        layouts={layouts}
        onBreakpointChange={this.onBreakpointChange}
        onLayoutChange={this.onLayoutChange}
        onDrop={this.onDrop}
        onResizeStop={this.onResizeStop}
        draggableCancel=".draglayer" //Avoids plot being dragged when zooming and other drag actions
        // WidthProvider option
        measureBeforeMount={false}
        // I like to have it animate on mount. If you don't, delete `useCSSTransforms` (it's default `true`)
        // and set `measureBeforeMount={true}`.
        useCSSTransforms={this.state.mounted}
        compactType={this.state.compactType}
        preventCollision={!this.state.compactType}
        rowHeight={10}
      >
        {this.generateDOM(layouts.lg, plots)}
      </ResponsiveReactGridLayout>
    )

  }

  render() {

    // We will reuse some of the tabs hot keys handlers
    const tabs = <Tabs/>
    const handlers = {...this.hotKeysHandler, ..._.pick(tabs.hotKeysHandler, ["MOVE_TO_NEXT_TAB", "MOVE_TO_PREVIOUS_TAB"]) }

    // eslint-disable-next-line no-unused-vars
    return (
      <div style={{padding: 10, ...this.props.style}} className="scrollView">
        <GlobalHotKeys keyMap={PLOTS_HOT_KEYS.global} handlers={handlers}/>
        {this.getLayout()}
      </div>
    );
  }
}

const mapStateToProps = state => ({
  plots: state.plots,
  structures: state.session.structures,
  tabs: state.session.tabs,
  active: state.active,
  session: state.session
})

const mapDispatchToProps = {
  setSessionTabs,
  setTabPlots,
}

export default connect(mapStateToProps, mapDispatchToProps)(withHotKeys(PlotDashboard));