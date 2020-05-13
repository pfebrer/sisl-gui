import { 
    SET_ACTIVE_PLOT,
    SET_ACTIVE_TAB,
    CLEAR_SESSION,
    CHANGE_PLOT_SETTINGS,
    SET_ACTIVE_STRUCTS,
    SET_ACTIVE_PLOTABLES,
    DEACTIVATE_STRUCT,
    SET_ACTIVE_PAGE,
    DEACTIVATE_PLOTABLE,
    SET_STRUCTURES,
    SET_PLOTABLES,
    SET_SESSION
} from '../actions/actionTypes'

import _ from "lodash"

const defaultState = {plot: undefined, tab: undefined, structs: [], plotables:[], page: "plots"};

const active = (state = defaultState, action) => {
    switch (action.type) {
        case SET_ACTIVE_PLOT:
            console.log("REDUX: Setting active plot...")
            var newState = {
                ...state,
                plot: action.plotID,
            }
            console.log(newState)
            return newState

        case SET_ACTIVE_TAB:
            console.log("REDUX: Setting active tab...")
            var newState = {
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
        
        case SET_ACTIVE_STRUCTS:
            
            var newState = {
                ...state,
                structs: action.structs,
            }

            return newState
        
        case SET_STRUCTURES:

            return { ...state, structs: []}
        
        case DEACTIVATE_STRUCT:

            let structsToDeactivate = Array.isArray(action.structID) ? action.structID : [action.structID]

            var newState = {
                ...state,
                structs: state.structs.filter( structID => !structsToDeactivate.includes(structID) ),
            }

            return newState
        
        case SET_ACTIVE_PAGE:

            var newState = {
                ...state,
                page: action.pageName,
            }

            return newState
        
        case SET_ACTIVE_PLOTABLES:
        
            var newState = {
                ...state,
                plotables: action.plotables,
            }

            return newState
        
        case SET_PLOTABLES:

            return { ...state, plotables: [] }
        
        case DEACTIVATE_PLOTABLE:

            let plotablesToDeactivate = Array.isArray(action.plotableID) ? action.plotableID : [action.plotableID]
    
            var newState = {
                ...state,
                plotables: state.plotables.filter( plotableID => !plotablesToDeactivate.includes(plotableID) ),
            }

            return newState
        
        case CLEAR_SESSION:
            return defaultState
                
        default:
            return state
    }
}

export default active