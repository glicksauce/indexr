import React, { Component } from 'react';
import * as $ from 'jquery'
require('isomorphic-fetch')

let Token = process.env.REACT_APP_DBX_TOKEN
var Dropbox = require('dropbox').Dropbox;



class TagSearch extends Component{

    state = {
        selectedSearchTags: []
    }

    //add tag to state/props when clicked
    tagOnClick = (event) =>{
        console.log(event.target.id)

        let newSearchTags = Object.values(this.state.selectedSearchTags)
        let parseSearchTag = newSearchTags.indexOf(event.target.id)

        if (parseSearchTag != -1){ //toggle off
            //console.log(Object.values(this.state.selectedSearchTags))
            console.log(parseSearchTag)
            console.log(newSearchTags)
            newSearchTags.splice(parseSearchTag,1)
        } else { //toggle on
            $('#' + event.target.id).attr("color", "blue")
            newSearchTags.push(event.target.id)
        }

        this.setState({
            selectedSearchTags: newSearchTags
        })
    }

    renderTagsUsed = (tags) =>{
        console.log("tags are : ", typeof tags)

        Object.keys(tags).forEach((key) => {
            console.log(key)
            let $tag = $('<h5>')
                .text(key + " (" + tags[key] + ")")
                .attr("id", key)
            $tag.click(this.tagOnClick)
            $('.tags-used').append($tag)
        })
        
    }

    componentDidMount() {
        let tagsObj = this.props.getTagsFromLocalStorage()
        this.renderTagsUsed(tagsObj)
    }
    render () {
        return(
            
            <div className='tag-search'>
                <h3>Tag Search</h3>
                <h4>Tags Used:</h4>
                <div className="tags-used"></div>
            </div>
        )
    }
    
}

export default TagSearch