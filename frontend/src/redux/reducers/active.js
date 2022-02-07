import { 
    SET_ACTIVE_PLOT,
    SET_ACTIVE_TAB,
    CLEAR_SESSION,
    SET_ACTIVE_PAGE,
    SET_SESSION
} from '../actions/actionTypes'

import _ from "lodash"

const defaultState = {plot: undefined, tab: undefined, structs: [], plotables:[], page: "plots"};

const active = (state = defaultState, action) => {
    let newState;
    switch (action.type) {
        case SET_ACTIVE_PLOT:
            console.log("REDUX: Setting active plot...")
            newState = {
                ...state,
                plot: action.plotID,
            }
            console.log(newState)
            return newState

        case SET_ACTIVE_TAB:
            console.log("REDUX: Setting active tab...")
            newState = {
                ...state,
                tab: action.activeTab,
            }
            console.log(newState)
            return newState
        
        case SET_SESSION:

            const activeTabInSession = _.find(action.session.tabs, ["id", state.tab])
            const anyTab = action.session.tabs.length > 0
            
            if (activeTabInSession) {
                return state
            } else if (anyTab){
                return {...state, tab: action.session.tabs[0].id}
            } else {
                return { ...state, tab: null}
            }
        
        case SET_ACTIVE_PAGE:

            newState = {
                ...state,
                page: action.pageName,
            }

            return newState
        
        case CLEAR_SESSION:
            return defaultState
                
        default:
            return state
    }
}

export default active