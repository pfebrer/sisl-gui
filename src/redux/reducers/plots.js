import { ADD_PLOTS, CLEAR_SESSION, REMOVE_PLOT, CHANGE_PLOT_SETTINGS } from '../actions/actionTypes'
import _ from "lodash"
import { toast } from 'react-toastify';

const defaultState = {};

const plots = (state = defaultState, action) => {
    switch (action.type) {
        case ADD_PLOTS:
            console.log("REDUX: Storing a new plot...")
            var newState = {
                ...state,
                ...action.newPlots,
            }
            console.log(newState)
            return newState
        
        case REMOVE_PLOT:
            return _.omit(state, [action.plotID])
        
        case CHANGE_PLOT_SETTINGS:
            console.log("REDUX: Changing plot settings (not submitting yet)...")

            let plotID = action.extraParams.plotID
            if (!state[plotID]) {
                toast.error("You are trying to change the settings of a plot that does not exist")
                return state
            }

            var newState = {
                ...state,
                [plotID]: {
                    ...state[plotID],
                    unsubmittedSettings: {
                        ...state[plotID].unsubmittedSettings,
                        [action.settingKey]: action.value
                    }
                }
            }
            console.log(newState)
            return newState
        
        case CLEAR_SESSION:
            return defaultState
            
        default:
            return state
    }
}

export default plots