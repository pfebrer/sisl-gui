import { CLEAR_SESSION, SET_SESSION, CHANGE_SESSION_SETTINGS, SET_PLOTABLE_PLOTS, DEACTIVATE_PLOTABLE} from '../actions/actionTypes'

const defaultState = {}

const session = (state = defaultState, action) => {
    let newState;
    switch (action.type) {
        case SET_SESSION:
            console.log("REDUX: Setting current session...")
            console.warn(action.session)
            newState = action.session
            console.log(newState)

            return newState
        
        case CHANGE_SESSION_SETTINGS:
            console.log("REDUX: Changing current session settings (not submitting yet)...")
            newState = {
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

        case DEACTIVATE_PLOTABLE:

            action.chosenPlots = []

            newState = {
                ...state,
                plotables: {
                    ...state.plotables,
                    [action.plotableID]: {
                        ...state.plotables[action.plotableID],
                        chosenPlots: action.chosenPlots
                    }
                }
            }

            return newState

        case SET_PLOTABLE_PLOTS:

            newState = {
                ...state,
                plotables: {
                    ...state.plotables,
                    [action.plotableID]: {
                        ...state.plotables[action.plotableID],
                        chosenPlots: action.chosenPlots
                    }
                }
            }

            return newState

        default:
            return state
    }
}

export default session