import React, { Component } from 'react';
import * as $ from 'jquery'
require('isomorphic-fetch')

let Token = process.env.REACT_APP_DBX_TOKEN
var Dropbox = require('dropbox').Dropbox;



class ThumbnailBrowser extends Component{

    componentDidMount() {
        //  this.props.clearImagesFromState //need to reset images in state before adding more to
         // this.props.readFromLocalStorage("", 25)
         $('#re-sync').click(this.props.getDropboxFileSearch)
         $('#random').click(() =>{
             this.props.clearImagesFromState()
             this.props.readFromLocalStorage("")
         })
    }

    render () {
        
        return (
            <>
                <div className='thumb-browser-header'>
                    <h3 className="thumbnail-heading">Browse Thumbnails</h3>
                    <div className="click-button-div">
                        <button id="re-sync" title="re-sync Dropbox library"></button>
                        <button id="random" title="show 25 random images"></button>
                    </div>
                </div>
                <div className='thumb-browser'>
                

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
            </>
        )
    }
    
}

export default ThumbnailBrowser