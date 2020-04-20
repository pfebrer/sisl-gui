import { ADD_PLOTS, CLEAR_SESSION, REMOVE_PLOT } from '../actions/actionTypes'
import _ from "lodash"

const defaultState = {};

const plots = (state = defaultState, action) => {
    switch (action.type) {
        case ADD_PLOTS:
            console.log("REDUX: Storing a new plot...")
            let newState = {
                ...state,
                ...action.newPlots,
            }
            console.log(newState)
            return newState
        
        case REMOVE_PLOT:
            return _.omit(state, [action.plotID])
        
        case CLEAR_SESSION:
            return defaultState
            
        default:
            return state
    }
}

export default plots