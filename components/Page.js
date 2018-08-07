import React from 'react'
import Link from 'next/link'
import { inject, observer } from 'mobx-react'
import Clock from './Clock'
import ReactPlayer from 'react-player'

const feathers = require('@feathersjs/feathers');
const rest = require('@feathersjs/rest-client');
const socketio = require('@feathersjs/socketio-client');
const io = require('socket.io-client');


const { ws, api } = require('../config');

@inject('store') @observer
class Page extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      url: '',
      name: 'office-1-street'
    }
  }
  componentDidMount () {

    this.props.store.start()
    this.socket = io(ws, {
      transports: ['websocket'],
      forceNew: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax : 5000,
      reconnectionAttempts: 99999
    });
    const app = feathers();
    const restClient = rest(api)
    app.configure(restClient.fetch(window.fetch));

    // Connect to the `http://feathers-api.com/messages` service
    const livestreamService = app.service('livestream');
    this.livestreamService = livestreamService;

    this.init();
  }

  init = async () => {
    this.refetch();
    // // api
    // console.log('calling livestream');
    // const url = await this.livestreamService.get(1, {
    //   connection: {
    //     followRedirect: false
    //   }
    // });
    // console.log('URL', url)

    // Sockets
    this.socket.on( 'connect', function () {
      console.log( 'connected to server' );
    });

    this.socket.on( 'disconnect', function () {
      console.log( 'disconnected to server' );
    });
    console.log('init!');
    this.socket.emit('get', 'livestream', "Andrew", (error, data) => {
      console.log('DATA', data);
    });
  }

  componentWillUnmount () {
    this.props.store.stop();
  }

  refetch = () => {
    console.log('setting url');
    const { name } = this.state;
    this.setState({ url: `${api}/livestream.m3u8?name=${name}&timestamp=${Date.now()}` })
  }

  render () {
    // https://video-dev.github.io/streams/x36xhzz/x36xhzz.m3u8
    // const url = "https://video-dev.github.io/streams/x36xhzz/x36xhzz.m3u8";
    // const url = `${api}/livestream/${name}`;
    const { url } = this.state;
    return (
      <div>
        <h1>{this.props.title}</h1>
        <Clock lastUpdate={this.props.store.lastUpdate} light={this.props.store.light} />
        <nav>
          <Link href={this.props.linkTo}><a>Navigate</a></Link>
        </nav>
        <div>
          {url && (
            <ReactPlayer
              url={url}
              playing
              onEnded={this.refetch}
              controls
              file={{ forceHLS: true, liveDurationInfinity: true }}
            />
          )}
        </div>
      </div>
    )
  }
}

export default Page
