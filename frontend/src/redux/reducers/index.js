import { combineReducers } from 'redux'
import {createResponsiveStateReducer} from 'redux-responsive'

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

export const selectActivePlot = (state) => {
    return state.plots[state.active.plot]
}