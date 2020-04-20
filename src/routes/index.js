// NOT USING IT CURRENTLY (REACT-ROUTER-DOM IS NOT EVEN INSTALLED)
// "NAVIGATION" IS DONE USING REDUX STATE.

import React from "react";
import { Switch } from "react-router-dom";
import Route from "./Route";

import Plots from "../pages/Plots";
import Settings from "../pages/Settings";
import PlotTweaking from "../pages/PlotTweaking";

export default function Routes() {
  return (
    <Switch>
      <Route path="/plots" exact component={} />
      <Route path="/settings" component={Settings} />
      <Route path="/plotTweaking" component={PlotTweaking}/>

      {/* redirect user to SignIn page if route does not exist and user is not authenticated */}
      <Route component={Plots} />
    </Switch>
  );
}
