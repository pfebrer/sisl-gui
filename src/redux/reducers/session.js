import { CLEAR_SESSION, SET_SESSION, CHANGE_SESSION_SETTINGS} from '../actions/actionTypes'
import _ from "lodash"

const defaultState = {}

const session = (state = defaultState, action) => {

    switch (action.type) {
        case SET_SESSION:
            console.log("REDUX: Setting current session...")
            var newState = action.session
            console.log(newState)

            return newState
        
        case CHANGE_SESSION_SETTINGS:
            console.log("REDUX: Changing current session settings (not submitting yet)...")
            var newState = {
                ...state,
                settings: {
                    ...state.settings,
                    [action.settingKey]: action.value
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

export default session