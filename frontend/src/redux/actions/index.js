import { 
    ADD_PLOTS,
    REMOVE_PLOT,
    ADD_TABS,
    SET_TAB_PLOTS,
    SET_SESSION_TABS,
    SET_ACTIVE_PLOT,
    SET_ACTIVE_TAB,
    CLEAR_SESSION,
    SET_SESSION,
    START_LOADING_PLOT,
    END_LOADING_PLOT,
    SET_ACTIVE_PAGE,
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

export const changeSettings = (actionType, settingKey, value, extraParams) => ({
    type: actionType, //Valid action types are all of type CHANGE_<something>_SETTINGS
    settingKey,
    value,
    extraParams // Here the plotID is passed, for example, if the actionType is CHANGE_PLOT_SETTINGS
})

export const addTabs = (newTabs) => ({
    type: ADD_TABS,
    newTabs
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
    plotID: plot ? typeof(plot) == "string" ? plot : plot.id : undefined
})

export const setActiveTab = (tab) => ({
    type: SET_ACTIVE_TAB,
    activeTab: tab
})

export const clearSession = () => ({
    type: CLEAR_SESSION,
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



