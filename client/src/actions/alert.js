import {SET_ALERT, REMOVE_ALERT} from './types'
import uuid from 'uuid'

// setAlert is function to be exported
// This will dispatch more than one action type from setAlert Function
// We can use this because of thunk middleware
export const setAlert = (msg, alertType) => dispatch => {
    // Now we will use uuid import that gives uuid on the fly
    // goto clients folder and npm i uuid
    const id = uuid.v4()

    dispatch({
        type: SET_ALERT,
        payload: {msg, alertType, id}
    })
}