import { createSlice } from '@reduxjs/toolkit'

import type { Session } from '../../interfaces'

const defaultState: Session = {
    nodes: {},
    node_classes: {},
    paths: [],
    logs: ""
}

export const sessionSlice = createSlice({
    name: 'session',
    initialState: defaultState,
    reducers: {
        setCurrentSession: (state, action) => {
            return action.payload.session
        },
        clearSession: (state) => {
            return defaultState
        }
    },
})

// Action creators are generated for each case reducer function
export const { setCurrentSession, clearSession } = sessionSlice.actions

export default sessionSlice.reducer