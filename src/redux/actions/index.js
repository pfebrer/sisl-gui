import { 
    ADD_PLOTS,
    REMOVE_PLOT,
    ADD_TABS,
    SET_STRUCTURES,
    SET_TAB_PLOTS,
    SET_SESSION_TABS,
    SET_ACTIVE_PLOT,
    SET_ACTIVE_TAB,
    CLEAR_SESSION,
    SET_SESSION,
    SET_ACTIVE_STRUCTS,
    DEACTIVATE_STRUCT,
    START_LOADING_PLOT,
    END_LOADING_PLOT,
    SET_ACTIVE_PAGE,
    DEACTIVATE_PLOTABLE,
    SET_ACTIVE_PLOTABLES,
    SET_PLOTABLES
} from './actionTypes'

export const setCurrentSession = (session) => {

    return {
        type: SET_SESSION,
        session
    }
}
    
export const addPlots = (newPlots, tabsIDs) => ({
    type: ADD_PLOTS,
    newPlots,
    tabsIDs
})

export const removePlot = (plotID, tabID) => ({
    type: REMOVE_PLOT,
    plotID,
    tabID
})

export const changeSettings = (actionType, settingKey, value) => ({
    type: actionType, //Valid action types are all of type CHANGE_<something>_SETTINGS
    settingKey,
    value
})

export const addTabs = (newTabs) => ({
    type: ADD_TABS,
    newTabs
})

export const setNewStructures = (newStructures) => ({
    type: SET_STRUCTURES,
    newStructures
})

export const setTabPlots = (tabID, plots) => ({
    type: SET_TAB_PLOTS,
    tabID,
    plots
})

export const setSessionTabs = (tabs) => ({
    type: SET_SESSION_TABS,
    tabs
})

export const setActivePlot = (plot) => ({
    type: SET_ACTIVE_PLOT,
    activePlot: plot
})

export const setActiveTab = (tab) => ({
    type: SET_ACTIVE_TAB,
    activeTab: tab
})

export const clearSession = () => ({
    type: CLEAR_SESSION,
})

export const setActiveStructs = (structs) => ({
    type: SET_ACTIVE_STRUCTS,
    structs: structs
})

export const deactivateStruct = (structID) => ({
    type: DEACTIVATE_STRUCT,
    structID
})

export const informLoadingPlot = (plot) => ({
    type: START_LOADING_PLOT,
    plot
})

export const informLoadedPlot = (plotID) => ({
    type: END_LOADING_PLOT,
    plotID
})

export const setActivePage = (pageName) => ({
    type: SET_ACTIVE_PAGE,
    pageName
})

export const setNewPlotables = (newPlotables) => ({
    type: SET_PLOTABLES,
    newPlotables
})

export const setActivePlotables = (plotables) => ({
    type: SET_ACTIVE_PLOTABLES,
    plotables
})

export const deactivatePlotable = (plotableID) => ({
    type: DEACTIVATE_PLOTABLE,
    plotableID
})



