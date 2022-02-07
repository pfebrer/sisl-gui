import { CLEAR_SESSION, SET_SESSION } from '../actions/actionTypes'

const defaultState = {}

const session = (state = defaultState, action) => {
    let newState;
    switch (action.type) {
        case SET_SESSION:
            newState = action.session

            return newState
        
        case CLEAR_SESSION:
            return defaultState

        default:
            return state
    }
}

export default session