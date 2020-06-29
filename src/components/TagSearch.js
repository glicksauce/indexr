import React, { Component } from 'react';
import * as $ from 'jquery'
require('isomorphic-fetch')

//let Token = process.env.REACT_APP_DBX_TOKEN
var Dropbox = require('dropbox').Dropbox;



class TagSearch extends Component{

    state = {
        selectedSearchTags: [],
        customSearchTags: []
    }

    //add tag to state/props when clicked
    tagOnClick = (tag, isCustomTagSearch, bypassImageRender) =>{
        console.log("tag is ", tag, " " + typeof tag)
        //console.log(event.target.id)
        //console.log(isCustomTagSearch)

        //set search tags to whatever is in state and then find our new tag element in array
        let newSearchTags = Object.values(this.state.selectedSearchTags)
        let parseSearchTag = newSearchTags.indexOf(tag)

        //if tag is found in state than remove that tag from state aka toggle it
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

            //only add the tag if it isn't empty
            if (tag != ""){
                newSearchTags.push(tag)
            }
        }

        //set State, THEN call function to search and render tags
        this.setState({
            selectedSearchTags: newSearchTags
        }, () =>{
            if (!bypassImageRender) {
                // console.log("reading from db with tags: " + this.state.selectedSearchTags)
                // this.props.readFromDatabase(this.state.selectedSearchTags)
                this.renderImagesFromTags()
            } else {
                console.log("bypassed!")
            }
        })
                
        //console.log(newSearchTags)
    }

    customTagOnChange = (event) =>{
        event.target.id = event.target.value
        console.log("event is ", event.target.value)


        //if custom box is cleared out return everything
        if (event.target.id == ''){
            this.tagOnClick('', true)
        }

        let newValue = event.target.id.split(" ")

        //sets cusutomSearchTags to whatever is in custom tag search field
        this.setState({
            customSearchTags: newValue
        })

        this.renderImagesFromTags()

        // newValue.forEach((value,index) => {
        //     if (value != ""){
        //         if (index == newValue.length -1){ //bypass render images unless on last loop through
        //             this.tagOnClick(value, true)
        //         } else{
        //             this.tagOnClick(value, true, true)
        //         }
        //     }   

        // })
    }

        //renders images in 'browse thumbnails' section from tags set in state
        renderImagesFromTags = () => {
            //clear existing images before rendering new ones
            this.props.clearImagesFromState()

            let tagsToRender = ''

            if (this.state.isCustomTagSearch != ''){
                tagsToRender = this.state.selectedSearchTags.concat(this.state.customSearchTags)
                console.log("tags to render: " + tagsToRender)
            } else {
                tagsToRender = this.state.selectedSearchTags
            }

            this.props.readFromDatabase(tagsToRender)
        }

    // renderTagsUsed = (tags) =>{
    //     console.log("tags are : ", tags)

    //     Object.keys(tags).forEach((key) => {
    //         //console.log(key)
    //         let $tag = $('<h5>')
    //             .text(key + " (" + tags[key] + ")")
    //             .attr("id", key)
    //         $tag.click(() => this.tagOnClick(key))
    //         $('.tags-used').append($tag)
    //     })

    //     let $customTag = $('<input>')
    //     $customTag.change(this.customTagOnChange)
    //     .attr("class","custom-tag-input")
    //     .attr("placeholder","custom tag search")
    //     $('.tags-used').prepend($customTag)
        
    // }

    componentDidMount() {

        $('.custom-tag-input').change(this.customTagOnChange)
        // get tags from back-end
        // this.props.getTagsFromDatabase()
        // .then(result => {
            // this.renderTagsUsed(result)
        // })
        //$('#smoke').css("background", "blue")
    }
    render () {

        return(
            <>  
                <div className='tag-search-header'>
                    <h3>Tag Search</h3>
                    <h6>select tag to add to 'AND' search</h6>
                </div>
                <div className='tag-search'>
                    <div className="tags-used"></div>
                        <input className="custom-tag-input" placeholder="custom tag search"></input>
                        {Object.keys(this.props.tagsObj).map((key,index) => 
                           <h5 key={key,index} id={key} onClick={() => this.tagOnClick(key)}>{key + " (" + this.props.tagsObj[key] + ")"}</h5> 
                        )}
                </div>
            </>
        )
    }
    
}

export default TagSearch