// This is currently not used
import React, { Component } from 'react'

export default class SislDocs extends Component {
    render() {
        
        return (
            <object data={process.env.PUBLIC_URL + "/sisl-docs/html/index.html"} aria-label="Sisl documentation" width="100%" height="100%"/>
        )
    }
}