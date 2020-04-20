import React, { Component } from 'react'
import PlotDashboard from '../components/plots/PlotDashboard'
import Tabs from '../components/tabs/Tabs'

export default class PlotsPage extends Component {
    render() {
        return (
            <div>
                <Tabs/>
                <PlotDashboard style={{flex: 1}}/>
            </div>
        )
    }
}
