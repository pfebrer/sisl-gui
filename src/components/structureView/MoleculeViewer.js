import React, { Component } from 'react'
import Speck from 'speck-renderer';

export default class MoleculeViewer extends Component {

    componentDidMount(){
        const speck = new Speck({ canvasContainerID: "speck-root", canvasID: "speck-canvas" });
    }
    
    render() {
        return (
            <div id="speck-root" style={{...this.props.style, justifyContent: "center", alignItems:"center", display:"flex"}}>
                <canvas id="speck-canvas" style={{width:800, height:800}}/>
            </div>
        )
    }
}
