import { combineReducers } from 'redux'
import {createResponsiveStateReducer} from 'redux-responsive'
import _ from "lodash"

import session from './session'
import plots from './plots'
import active from './active'
import loading from './loading'
import { persist } from './persist'

export default combineReducers({
    session,
    plots,
    loading: persist('loading', ['plots'], loading),
    active: persist( 'active', ['tab', 'plot'], active),
    browser: createResponsiveStateReducer({
        small: 600,
        medium: 992,
    })
})

export const selectActiveStructs = (state) => {
    return state.active.structs.map(structID => state.session.structures[structID])
}

export const selectActivePlotables = (state) => {
    return state.active.plotables.map(plotableID => state.session.plotables[plotableID])
}

export const selectActivePlot = (state) => {
    return state.plots[state.active.plot]
}