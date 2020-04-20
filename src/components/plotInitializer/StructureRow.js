import React, { Component } from 'react'
import Icon from 'react-materialize/lib/Icon'
import { connect } from 'react-redux'
import { deactivateStruct, setActiveStructs } from '../../redux/actions'

class StructureRow extends Component {

    render() {

        const struct = this.props.structure
        const groupActive = this.props.groupActive

        return (
            <div style={{display: "flex", flexDirection: "row", justifyContent: "flex-start", alignItems: "center", marginTop: 10, marginBottom: 10}}>
                <div 
                    style={{color: "darkred", cursor: "pointer", display: "flex", justifyContent: "center", alignItems:"center"}}
                    onClick={() => this.props.deactivateStruct(struct.id)}>
                    <Icon>remove</Icon>
                </div>
                <div 
                    style={{cursor: groupActive ? "default" : "pointer", marginRight: 20, marginLeft: 20, padding: 10, backgroundColor: groupActive ? "whitesmoke" : "#ccc", borderRadius: 3}}
                    onClick={groupActive ? undefined : this.props.moveStructToActiveGroup}>
                    {struct.name.replace(".fdf", "")}
                </div>
                <div data-tip={struct.path}>{".../" + struct.path.split("/").slice(-2,-1)[0]}</div>
            </div>
        )
    }
}

const mapStateToProps = state => ({
    active: state.active
})

const mapDispatchToProps = {
    deactivateStruct,
    setActiveStructs
}

export default connect(mapStateToProps, mapDispatchToProps)(StructureRow);
