import React, { Component } from 'react'
import { ChromePicker } from 'react-color';

export default class ColorPicker extends Component {

    constructor(props){
        super(props)

        this.state ={
            tempcolor: undefined
        }
    }

    toggleColorPicker = () => {
        this.setState({ displayColorPicker: !this.state.displayColorPicker })
    };
    
    render() {

        let colorPicker = this.state.displayColorPicker ? (
            <div style={{position: "absolute", bottom: 60}}>
                <ChromePicker
                    color={this.state.tempcolor || this.props.value || 'black'}
                    onChange={(color) => {this.setState({tempcolor: color.hex})}}
                    onChangeComplete={(color) => {this.props.onChange(color.hex); this.setState({tempcolor: undefined})}}
                    {...this.props.inputField.params}/>
            </div>
        ) : null;

        return (
            <div style={{position: "relative",display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center"}}>
                <div style={{paddingBottom: 10}}>{this.props.setting.name}</div>
                <div 
                    className="z-depth-2"
                    onClick={this.toggleColorPicker}
                    style={{width: 30, height: 30, borderRadius: 30, background: this.props.value}}/>
                
                {colorPicker}
            </div>
        )
    }
}
