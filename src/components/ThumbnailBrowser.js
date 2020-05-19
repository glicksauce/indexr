import React, { Component } from 'react';
import * as $ from 'jquery'
require('isomorphic-fetch')

let Token = process.env.REACT_APP_DBX_TOKEN
var Dropbox = require('dropbox').Dropbox;



class ThumbnailBrowser extends Component{

    componentDidMount() {
        this.props.readFromLocalStorage(25)
    }
    render () {
        return(
            
            <div className='thumb-browser'>
                <h3>Browse Thumbnails</h3>
            </div>
        )
    }
    
}

export default ThumbnailBrowser