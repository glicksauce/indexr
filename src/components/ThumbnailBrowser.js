import React, { Component } from 'react';
import * as $ from 'jquery'
require('isomorphic-fetch')

let Token = process.env.REACT_APP_DBX_TOKEN
var Dropbox = require('dropbox').Dropbox;



class ThumbnailBrowser extends Component{

    componentDidMount() {
        //  this.props.readFromLocalStorage("", 25)
    }

    render () {
        
        return (
            <>
            {this.props.thumbnailArray ? 
                // <h3 className="thumbnail-heading">Browse Thumbnails</h3>
                this.props.thumbnailArray.map(thumbnail =>
                <div key={thumbnail.imageId}>
                    <img src={thumbnail.imageBlobUrl}></img>
                </div>
                )
            :
            <div className='thumb-browser'>
                <h3 className="thumbnail-heading">Browse Thumbnails</h3>
            </div>
            }
            </>   
        )
    }
    
}

export default ThumbnailBrowser