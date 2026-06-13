import React, { Component } from 'react'
import socket from '@configs/socket'
import { socketReceive } from '@actions/common'
import { connect } from 'react-redux'

class SocketOn extends Component {
  componentDidMount() {
    this.init()
  }

  init = () => {
    const callback = (res) => {
      this.props.dispatch(socketReceive(res))
    };
    socket.on('dispatch', callback);
  }

  render() {
    return null
  }
}

const mapStateToProps = (state) => ({
})

export default connect(mapStateToProps)(SocketOn)
