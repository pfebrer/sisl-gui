import { 
    START_LOADING_PLOT,
    END_LOADING_PLOT
} from '../actions/actionTypes'

import _ from 'lodash';

const loading = (state = {plots:{}}, action) => {
    switch (action.type) {
        case START_LOADING_PLOT:
            console.log("REDUX: Setting active plot...")
            var newState = {
                ...state,
                plots: {
                    ...state.plots,
                    [action.plot.id]: {
                        ...action.plot,
                        from: new Date()
                    }
                }
            }
            console.log(newState)
            return newState
        
        case END_LOADING_PLOT:
            console.log("REDUX: Changing plot settings (not submitting yet)...")
            var newState = {
                ...state,
                plots: _.omit(state.plots, [action.plotID]),
            }
            console.log(newState)
            return newState
                
        default:
            return state
    }
}

export default loading