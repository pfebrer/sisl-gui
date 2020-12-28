import React from "react"
import { render, fireEvent, waitFor, screen } from '@testing-library/react'

import { InputField, INPUT_FIELDS } from "../../InputField"

describe("Input fields work with undefined values", () => {
    Object.keys(INPUT_FIELDS).forEach(key => {
        test(key, () => {
            render(<InputField setting={{inputField:{type: key, params: {}}}}/>)
        })
    })
})

