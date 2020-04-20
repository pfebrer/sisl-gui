import React, { Component } from 'react'
import { connect } from 'react-redux'
import LoadingChip from './LoadingChip'

export class LoadingTracker extends Component {
    
    render() {

        return (
            <div className={"loadingTracker" + (Object.values(this.props.loading.plots).length == 0 ? " empty" : "")}>
                {Object.values(this.props.loading.plots).map(loadingInfo => <LoadingChip info={loadingInfo}/>)}
            </div>
        )
    }
}

const mapStateToProps = state => ({
    loading: state.loading
})

export default connect(mapStateToProps, null)(LoadingTracker);
