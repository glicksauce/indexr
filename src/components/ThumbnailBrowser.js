import React, { Component } from 'react';
import * as $ from 'jquery'
require('isomorphic-fetch')

let Token = process.env.REACT_APP_DBX_TOKEN
var Dropbox = require('dropbox').Dropbox;



class ThumbnailBrowser extends Component{

    componentDidMount() {
        //  this.props.clearImagesFromState //need to reset images in state before adding more to
         // this.props.readFromLocalStorage("", 25)
         $('.refresh-icon-div').click(this.props.getDropboxFileSearch)
    }

    render () {
        
        return (

            <div className='thumb-browser'>
                <h3 className="thumbnail-heading">Browse Thumbnails</h3>
                    <div className="refresh-icon-div">
                        <button title="re-sync Dropbox library"></button>
                    </div>
                {this.props.thumbnailArray ? 
                    this.props.thumbnailArray.map(thumbnail =>
                    <a key={thumbnail.imageId} href="#page_header">
                        <div 
                            className="thumb-image"
                            onClick={() => this.props.onClick(thumbnail.imageId)}
                        >
                            <img src={thumbnail.imageBlobUrl}></img>
                        </div>
                    </a>
                    )
                : null }
            </div>
        )
    }
    
}

export default ThumbnailBrowser