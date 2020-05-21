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
    tagOnClick = (tag, isCustomTagSearch, bypassImageRender) =>{
        console.log("tag is ", tag, " " + typeof tag)
        //console.log(event.target.id)
        //console.log(isCustomTagSearch)
        //set search tags to whatever is in state and then find our new tag element in array
        let newSearchTags = Object.values(this.state.selectedSearchTags)
        let parseSearchTag = newSearchTags.indexOf(tag)

        if (parseSearchTag != -1){ //toggle off
            //console.log(Object.values(this.state.selectedSearchTags))
            //console.log(parseSearchTag)
            //console.log(newSearchTags)
            newSearchTags.splice(parseSearchTag,1)

            if (!isCustomTagSearch){
                $('#' + tag).css("color", "black")
            }
        } else { //toggle on
            if (!isCustomTagSearch) {
                $('#' + tag).css("color", "blue")
            }
            newSearchTags.push(tag)
        }

        this.props.clearThumbnails()
        this.setState({
            selectedSearchTags: newSearchTags
        }, () =>{
            if (!bypassImageRender) {
                this.props.readFromLocalStorage(newSearchTags)
            } else {
                console.log("bypassed!")
            }
        })
                
        //console.log(newSearchTags)
    }

    customTagOnChange = (event) =>{
        let existingValue = event.target.id.split(" ")
        existingValue.forEach((value,index) => {
            if (value != ""){
                if (index == existingValue.length -1){ //bypass render images unless on last loop through
                    this.tagOnClick(value, true)
                } else{
                    this.tagOnClick(value, true, true)
                }
            }   

        })
        
        event.target.id = event.target.value

        let newValue = event.target.id.split(" ")
        newValue.forEach((value,index) => {
            if (value != ""){
                if (index == existingValue.length -1){ //bypass render images unless on last loop through
                    this.tagOnClick(value, true)
                } else{
                    this.tagOnClick(value, true, true)
                }
            }   

        })
    }

    renderTagsUsed = (tags) =>{
        console.log("tags are : ", typeof tags)

        Object.keys(tags).forEach((key) => {
            console.log(key)
            let $tag = $('<h5>')
                .text(key + " (" + tags[key] + ")")
                .attr("id", key)
            $tag.click(() => this.tagOnClick(key))
            $('.tags-used').append($tag)
        })

        let $customTag = $('<input>')
        $customTag.change(this.customTagOnChange)
        .attr("class","custom-tag-input")
        .attr("placeholder","custom tag search")
        $('.tags-used').prepend($customTag)
        
    }

    componentDidMount() {
       
        let tagsObj = this.props.getTagsFromLocalStorage()
        this.renderTagsUsed(tagsObj)
        //$('#smoke').css("background", "blue")
    }
    render () {
        
        return(
            
            <div className='tag-search'>
                <h3>Tag Search</h3>
                <h4>Tags Used:</h4>
                <h6>select tag to add to 'AND' search</h6>
                <div className="tags-used"></div>
            </div>
        )
    }
    
}

export default TagSearch