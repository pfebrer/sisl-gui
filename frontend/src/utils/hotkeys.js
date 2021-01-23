
export const GLOBAL_HOT_KEYS = {

    //HELP
    SHOW_AVAIL_HOTKEYS:{
        name: "Show available hotkeys",
        sequence: "shift+?"
    },

    //NAVIGATION
    GO_TO_SETTINGS: {
        name: "Go to settings",
        sequence: "shift+s",
    },
    GO_TO_DASHBOARD: {
        name: "Go to the plot's dashboard",
        sequence: "shift+d",
    },
    GO_TO_MOLECULEVIEWER: {
        name: "Go to the molecule viewer",
        sequence: "shift+m",
    },

    //SESSION
    SAVE_SESSION: {
        name: "Save session",
        sequences: ["ctrl+shift+s", "ctrl+alt+s"]
    },
    LOAD_SESSION: {
        name: "Load session",
        sequences: ["ctrl+shift+l", "ctrl+alt+l"]
    }

}

export const ADDITIONAL_GLOBAL_HOT_KEYS = {
    settings: {

    },
    plots:{
        

    }
}

export const SETTINGS_HOT_KEYS = {

}

export const TABS_HOT_KEYS = {
    global: {
        // TAB NAVIGATION
        MOVE_TO_NEXT_TAB: {
            name: "Move to next tab",
            sequence: "shift+t+right",
        },
        MOVE_TO_PREVIOUS_TAB: {
            name: "Move to previous tab",
            sequence: "shift+t+left",
        },
        NEW_TAB: {
            name: "New tab",
            sequence: "shift+t",
            action: "keyup"
        },
        TRY: "shift+t+r"
    }
}

export const PLOTS_HOT_KEYS = {
    global: {
        // TAB NAVIGATION
        MOVE_TO_NEXT_TAB: {
            name: "Move to next tab",
            sequence: "shift+right",
        },
        MOVE_TO_PREVIOUS_TAB: {
            name: "Move to previous tab",
            sequence: "shift+left",
        },
    }
}

export const PLOT_CARD_HOT_KEYS = {

    GO_TO_PLOT_SETTINGSEDITING: {
        name: "Edit current plot's settings",
        sequence: "s"
    },
    GO_TO_PLOT_LAYOUTEDITING: {
        name: "Edit current plot's layout",
        sequence: "e"
    },
    GO_TO_PLOT_METHODS: {
        name: "Go to current plot methods",
        sequence: "m"
    },
    FULL_SCREEN: {
        name: "See current plot in full screen in a different browser's tab",
        sequence: "f"
    },
    REMOVE_PLOT: {
        name: "Remove current plot",
        sequences: ["del","backspace"]
    },
    UNDO_PLOT_SETTINGS: {
        name: "Undo current plot settings",
        sequence: "ctrl+z"
    },

}

export const STRUCTURE_PICKER_HOT_KEYS = {

}

export const SETTING_CONTAINER_HOT_KEYS = {

    MOVE_EXPANDED_UP:{
        name: "Expand the previous settings group",
        sequence: "up"
    },
    MOVE_EXPANDED_DOWN:{
        name: "Expand the next settings group",
        sequence: "down"
    }

}

export const SETTING_GROUP_HOT_KEYS = {

    SUBMIT_SETTINGS:{
        name: "Submit this group's settings",
        sequence: "shift+enter"
    },
    
}

export const PLOT_TWEAKING_HOT_KEYS = {
    global:{
        UNDO_SETTINGS: {
            name:"Undo settings",
            sequence: "ctrl+z"
        },

        SUBMIT_ALL_SETTINGS: {
            name: "Submit all settings",
            sequence: "shift+enter"
        }
    }
}