//to do - readfromdirectory. kind of works. it will load all subdirectories as well, might need to limit

import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import listReactFiles from 'list-react-files'
import * as $ from 'jquery'
import ThumbnailBrowswer from "./components/ThumbnailBrowser.js"
import TagSearch from "./components/TagSearch.js"
import Oauth from "./components/Oauth.js"
import { getNodeText } from '@testing-library/react';
require('isomorphic-fetch');


//let Token = process.env.REACT_APP_DBX_TOKEN
let sessionAccessToken;
let sessionAccountId;
var Dropbox = require('dropbox').Dropbox;


class App extends Component {
//=========================
//State
//=========================
state = {
  tagsObj: {}, //object of tags in use
  selectedSearchTags: [], //search terms selected
  thumbnailArray: [],
  tagSearchParams: '', //string of current search params
  selectedImagePath: '' //file location of main image
}

clearImagesFromState = () =>{
  this.setState({
    thumbnailArray: []
  })
}

//=========================
//Get access_id and Dropbox User Id from cookies
//=========================
getTokenFromCookies = () =>{
  let tempToken = decodeURIComponent(document.cookie).split(";")
    tempToken.forEach(token => {
      if (token.indexOf('access_token=') != -1){
        sessionAccessToken= token.substring(14)
      }
    })

  console.log("sessionAccessToken is: " + sessionAccessToken)
  return sessionAccessToken
}

getAccountIdFromCookies = () =>{
  let tempToken = decodeURIComponent(document.cookie).split(";")

  tempToken.forEach(token => {
    if (token.indexOf('account_id=') != -1){
      sessionAccountId= token.substring(11)
    }
  })

   console.log("sessionAccountId is: " + sessionAccountId)
  return sessionAccountId
}

//=========================
//DROPBOX SDK FUNCTIONS
//=========================

//pass Token to get username
getDropboxUserName = (userAccessToken) => {
  var dbx = new Dropbox({ accessToken: userAccessToken, fetch: fetch });
  let dbxAccount = dbx.usersGetCurrentAccount()
    .then(function(response) {
      console.log(response);
      return response
    })
    .catch(function(error) {
      console.log(error);
    });
    return dbxAccount
}


//get thumbnails per given path to file
getDropboxThumbnails = (path, imageName) => {
  var dbx = new Dropbox({ accessToken: sessionAccessToken, fetch: fetch });
  dbx.filesGetThumbnail({ path: path, format: "jpeg", size: "w256h256", mode: "bestfit"})
  .then(response => {
  //console.log(response)
  //get the image BlobURL of the image
  let imageBlobURL = this.blobToFile(response.fileBlob, imageName, response.id)

  //add to state
  const tempThumbnailArray = [...this.state.thumbnailArray]
  tempThumbnailArray.push({
    'imageName': imageName, 
    'imageBlobUrl': imageBlobURL,
    'imageId': response.id
  })
  this.setState({
    thumbnailArray: tempThumbnailArray
  })

  //render thumbnail
  // this.showThumbnailImage(imageBlobURL, response.id)
  //console.log(response.fileBlob);
  })
  //.then(img => this.blobToFile(img.fileBlob, "image1"))
  .catch(function(error) {
  console.log(error);
  });
}

getDropboxHighQualityThumb = async(path, imageName, test) => {
  console.log("path and imagename " + path + " " + imageName + " ")
  console.log(test)
  var dbx = new Dropbox({ accessToken: sessionAccessToken, fetch: fetch });
  let answer = await dbx.filesGetThumbnail({ path: path, format: "jpeg", size: "w2048h1536", mode: "fitone_bestfit"})
  .then(response => {
    return response
  })
  //.then(img => this.blobToFile(img.fileBlob, "image1"))
  .catch(function(error) {
  console.log(error);
  });
  return answer
}

//files search. can search ".jpg" for all jpg files. Seems to be a 100 result limit but there is a "more: true" and start: 101 result paassed:
getDropboxFileSearch = (startIndex, imgQuery, iterations) => {
  
  //initialize startIndex if not in params
  if (typeof startIndex != 'number'){
    startIndex = 0
  }
  //initialize isMore - whether or not there are more results to search
  let isMore = false
  
  //initialize filetypes for search param "all" indicates to use all of these extenesions in search
  if (typeof imgQuery == 'undefined' || imgQuery == "all") {
    imgQuery = ['.jpg', '.png', '.gif', '.tiff', '.jpeg', '.bmp']
  }

  //if imgQuery param comes in as string, try to convert it to array for upcoming 'foreach' statement
  if (typeof imgQuery == 'string'){
    imgQuery = imgQuery.split()
  }

  //iterate through each img ext to query
  console.log(imgQuery)
  imgQuery.forEach(imgExt => {
      var dbx = new Dropbox({ accessToken: sessionAccessToken, fetch: fetch });
      dbx.filesSearch({ path: "", query: imgExt, start: startIndex})
        .then((response) => {
              response.matches.forEach((item,index) => {
                  if (item.match_type['.tag'] == "filename") {
                    //console.log(item)
                    this.putInLocalStorage(item.metadata.path_lower, item.metadata.name, item.metadata.id, item.metadata.client_modified, false) //last item 'false' means don't allow repeats
                    this.putInDatabase(sessionAccessToken, item.metadata.path_lower, item.metadata.name, item.metadata.id, item.metadata.client_modified)
                    //this.getDropboxThumbnails(item.metadata.path_lower,item.metadata.name)
                  }
                  
                  console.log(response.more, response.start)
              })
              
            //console.log(response);
            isMore = response.more
            startIndex = response.start
            console.log("imgExt, response.more, response.start:", imgExt, response.more, response.start)
        })
        .then((iterate) =>{
            //recursive run this again if there are more responses to process
              console.log("in iterate section, ismore and startindex: and iterations ", isMore, startIndex, iterations)
              if (isMore == true) {
                  if (typeof iterations == 'number') {
                    iterations -= 1
                      if (iterations > 0){
                        this.getDropboxFileSearch(startIndex, imgExt.split(), iterations)
                      }
                  } else {
                    this.getDropboxFileSearch(startIndex, imgExt.split())
                  }
              }
        })
        .catch(function(error) {
          console.log(error);
        });
    })
}

putInDatabase = (sessionAccessToken, imagePath, imageName, imageId, client_modified_date, tags) =>{

    let BaseURL = process.env.REACT_APP_BACKEND

        //format params as object
          let postParams = {
            'dbx_user_id': sessionAccountId,
            'dbx_image_id': imageId,
            'image_path': imagePath,
            'image_name': imageName,
            'client_modified_date': client_modified_date
          }

          fetch(BaseURL + 'users/' + sessionAccountId + "/albums/",{
            body: JSON.stringify(postParams),
            method: 'POST',
            headers: {
              'Accept': 'application/json, text/plain, */*',
              'Content-Type': 'application/json'
            }
          })
          .then(res => (res.json()))
          .then(data => console.log(data))
          // .then(() => console.log(obj))
          .catch(error => console.log(error))

  }

readFromDatabase = (tags, maxResultsQty, isRandom) =>{
  let BaseURL = process.env.REACT_APP_BACKEND
  let dropboxUserId
  let resultsCount = 0
  console.log("react backend is " + process.env.REACT_APP_BACKEND)

  //if isRandom is on get a random key from localStorage otherwise just pull in order
  // if (isRandom) {
  //   let randomInt = Math.floor(Math.random() * localStorage.length)
  //   console.log("random int is ", randomInt)
  //   var key = localStorage.key(randomInt)
  // } else {
  //   var key = localStorage.key(i);
  // }

    //default of results to return
    if (maxResultsQty == undefined){
      maxResultsQty = 25
    }

    //case: no tag params are given, get a random image:
    if (tags == "") {

      //call function to display search params
      this.showTagSearchParams("showing " + maxResultsQty + " random images")

      //iterate through maxresultsQty param
      for (resultsCount; resultsCount<maxResultsQty; resultsCount++){

        console.log("no tags given")
        fetch(BaseURL + 'users/' + sessionAccountId + "/albums/random_album_id/",{
          method: 'GET',
          headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
          }
        })
        .then(res => res.json())
        .then(data => {
          this.getDropboxThumbnails(data.image_path, data.image_name)
          // resultsCount += 1     
        })
      }
    } else {

      //case: tag params are provided
      console.log("db tags params are: ", tags)
      //call function to display search params
      this.showTagSearchParams("showing images with tags: " + tags)

      fetch(BaseURL + 'users/' + sessionAccountId + "/albums/" + tags + "/tags_search" ,{
        method: 'GET',
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'Content-Type': 'application/json'
        }
      })
      .then(res => (res.json()))
      .then(data => {
          console.log("db found images are ", data)
          console.log(data, data.length)
          data.forEach(result => {
            console.log("db result result is: ", result.album_tags)
            if (result.image_path) {
              this.getDropboxThumbnails(result.image_path, result.image_name)
            }
          })
      })
      .catch(error => console.log(error))

    }

  // // $('.thumbnail-heading').text("Showing " + resultsCount + " of " + totalImages + " images in library")
        
}

//loads given number of images from database that match directory passed
readDirectoryFromDatabase = (directory, maxResultsQty) =>{
  let BaseURL = process.env.REACT_APP_BACKEND
  let dropboxUserId
  let resultsCount = 0
  console.log("react backend is " + process.env.REACT_APP_BACKEND)

  //chop the image file off the end of the directory:
  //Credit to https://stackoverflow.com/questions/8374742/regex-last-occurrence
  let regExDirSearch = /\/(?:.(?!\/))+$/
  let choppedFilePath = directory.match(regExDirSearch)
  let parsedDirectory = directory.substring(0,choppedFilePath.index +1) //only displays string up to file path
  console.log("spliced dir is ", parsedDirectory)

    //default of results to return
    if (maxResultsQty == undefined){
      maxResultsQty = 20
    }

    //encode directory as URI component so it can pass as param
    let URLParsedDirectory = encodeURIComponent(parsedDirectory)

      //call function to display search params
      this.showTagSearchParams("showing " + maxResultsQty + " images from: " + directory)

      fetch(BaseURL + 'users/' + sessionAccountId + "/albums/directory_search/" + URLParsedDirectory,{
        method: 'GET',
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'Content-Type': 'application/json'
        }
      })
      .then(res => res.json())
      .then(data => {
        console.log("directory results: ")
        console.log(data)

      //iterate through maxresultsQty param
      for (resultsCount; resultsCount<maxResultsQty&&resultsCount<data.length; resultsCount++){        
          this.getDropboxThumbnails(data[resultsCount].image_path, data[resultsCount].image_name)
      }     
      })
    
}

getTagsFromDatabase = async() => {
  let BaseURL = process.env.REACT_APP_BACKEND
  let dropboxUserId

  return await Promise.resolve(fetch(BaseURL + 'users/' + sessionAccountId + "/user_album_tags",{
    method: 'GET',
    headers: {
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/json'
    }
    })
    .then(res => res.json())
    .then(data => {
      //set state to tags that were just pulled
      this.setState({
        tagsObj: data
      })
      return data
    })
  )
}

//=========================
//BLOB AND IMAGE RENDERING
//=========================
clearThumbnails = () =>{
  $('.thumb-image').remove()
}

//takes a blob and renders image 
blobToFile = (theBlob, fileName, imageId) => {
  //A Blob() is almost a File() - it's just missing the two properties below which we will add
  theBlob.lastModifiedDate = new Date();
  theBlob.name = fileName;
  var objectURL = URL.createObjectURL(theBlob);
  //console.log("blobtofile is: ", objectURL)

  //UPDDATE: PROBABLY NOT POSSIBLE TO PARSE BLOBS FROM LOCALSTORAGE COMMENTING THIS OUT FOR NOW
  // if (imageId){
  //   this.addBlobtoLocalStorage(imageId, objectURL)
  // }

  //return theBlob;
  return objectURL
}

showContainer = () =>{
  console.log("showing container")
  $('.container').fadeIn(3)
}

loadFullImage = async(imageObject) =>{
  //console.log("loadFullImage imageObject is: " + imageObject)

  let imageMain = await this.getDropboxHighQualityThumb(imageObject.image_path, imageObject.image_name, imageObject)
  //console.log("image main ", imageMain.id)

  let imageBlob = this.blobToFile(imageMain.fileBlob, imageMain.name)
  //console.log(imageBlob)

  //remove any existing image first
  $('.full-image').remove()

  let myImage = $('<img>')
  myImage.attr({
  'src': imageBlob,
  'class': 'full-image',
  'data-id': imageMain.id
  })
  
  //get tags from obj and pass to input field
  let tagStringArray = []
  imageObject.tags.forEach(tag => {
    tagStringArray.push(tag.tag_string)
  })
  // $('.tags-main').val(Object.values(imageObject.tags).join(' '))
  $('.tags-main').val(tagStringArray.join(' '))

  //get image path from obj and pass to field
  $('.image-path').text(imageObject.image_path)

  //pass image path of image into state
  this.setState({
    selectedImagePath: imageObject.image_path
  })

  //get image date from obj and pass to field
  $('.image-date').val(imageObject.client_modified_date)

  //add handle change so tag gets updated when changed
  //myImage.change(this.handleChange)
  $('.left-container-image-container').prepend(myImage)
}

showTagSearchParams = (tagParamsString) => {
  let functionTagSearchParams = tagParamsString
  this.setState({
    tagSearchParams: functionTagSearchParams
  })
}

//=========================
//MOUSE FUNCTIONS
//=========================

thumbnailOnClick = (dbx_image_id) =>{
  let BaseURL = process.env.REACT_APP_BACKEND

  //fetch image details by dbx_image_id from db
  fetch(BaseURL + 'users/' + sessionAccountId + "/albums/" + dbx_image_id ,{
    method: 'GET',
    headers: {
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/json'
    }
  })
  .then(res => res.json())
  .then(data => {
    console.log("res is ")
    console.log(data)
    //pass image to load in main section
    //need to convert to res.json() or it passes promise instead? Also only pass the first result because json encapsulation sticks an array inside an object?
    this.loadFullImage(data[0])
  })

}

//when the folder icon in main section is clicked
folderIconOnClick = () => {
  this.clearImagesFromState()
  this.readDirectoryFromDatabase(this.state.selectedImagePath)
}

//=========================
//Handle Changes and database updates
//=========================

handleChange = (event) => {
  //(event.target.id, event.target.value)
  //this.setState({[event.target.id] : event.target.value})
  //console.log(event.target.value)
  this.tagsUpdate($('.full-image').attr('data-id'), event.target.value)
}

tagsUpdate = (imageId, tags) => {
  //only do this if args are passed
  if (imageId) {
    //console.log(imageId, tags)

    //adding tags to image in database
    console.log("adding to db: ", imageId, tags)
    this.updateTagsInDatabase(imageId, tags.split(" "))

  }
}

updateTagsInDatabase = (imageId, tags) =>{

  let BaseURL = process.env.REACT_APP_BACKEND
  let dropboxUserId

      tags.forEach(tag => {
        //format params as object
        let postParams = {
          'dbx_user_id': sessionAccountId,
          // 'image_id': imageId,
          'tag_string': tag.toLowerCase()
        }
        console.log("postParams are ", postParams)

        //delete all album_tags for this image id
        fetch(BaseURL + 'users/' + sessionAccountId + "/albums/" +imageId + "/destroy_album_tags",{
          method: 'DELETE',
          headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
          }
          })
          .then(res =>{
                //calls will crete a new tag or return tag that has slready been created
                console.log(JSON.stringify(postParams))
                fetch(BaseURL + 'users/' + sessionAccountId + "/albums/" +imageId + "/tags",{
                  body: JSON.stringify(postParams),
                  method: 'POST',
                  headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                  }
                })
                .then(res => res.json())
                .then(data => {
                    console.log("backend tag return is : ", data)
                      
                    //add album tags for all tags for this image id
                    let albumTagsParams = {
                      'tag_id':data.id
                    }

                    console.log("albumTagParams are: ", albumTagsParams)
                    fetch(BaseURL + 'users/' + sessionAccountId + "/albums/" +imageId + "/album_tags",{
                      body: JSON.stringify(albumTagsParams),
                      method: 'POST',
                      headers: {
                        'Accept': 'application/json, text/plain, */*',
                        'Content-Type': 'application/json'
                      }
                      })
                })
                .then(updateTagsSearch =>{
                  //force TagSearch.js to reload:
                  this.getTagsFromDatabase()
                  .then(data => console.log("new tagsearch tags are ", data))
                })
                .catch(error => {
                  console.log(error)
                  this.getTagsFromDatabase()
                })
            })

          })

       
}

//=========================
//ComponentDidMount
//=========================
  componentDidMount() {
    //  this.readFromLocalStorage("",25)
    //this.updateTagsInDatabase('id:Jo_ZZoosmRAAAAAAAAAAFw', ['fun','run'])
    //this.getDropboxUserName()
    $('.tags-main').change(this.handleChange)

    //get search tags into state:
    this.getTagsFromDatabase()
    
    // this.putInDatabase(sessionAccessToken, '', '', 'id:test12', '2002-10-18T18:56:22Z', '')

  } 

  render () {
    return (
        <div className="App">
            <Oauth
              getTokenFromCookies = {this.getTokenFromCookies}
              getAccountIdFromCookies = {this.getAccountIdFromCookies}
              getDropboxFileSearch = {this.getDropboxFileSearch}
              getDropboxUserName = {this.getDropboxUserName}
              showContainer = {this.showContainer}
            />
          <div className="container">
            <h3>select a thumbnail to preview and add tags</h3>
            <div className="left-container">
              <a id="main_img_anchor"></a>
              <div className="left-container-image-container">
                
              </div>
              <div className="tag-section">
                  <div className="line line-1">
                    <h3 className="label">tags:</h3>
                    <input className="tags-main" placeholder="tags go here" type="text"></input>
                  </div>
                  <div className="line line-2">
                    <h3 className="label">image path:</h3>
                    <div className="no-edit image-path"></div>
                      <button onClick={this.folderIconOnClick} title='load this directory' className='folder-icon'></button>
                  </div>
                  <div className="line line-3">
                    <h3 className="label">date:</h3>
                    <input className="no-edit image-date" readOnly="readonly"></input>
                  </div>
                </div>
            </div>
            <div className="middle-container">
              <TagSearch
                tagsObj = {this.state.tagsObj}
                getTagsFromDatabase = {this.getTagsFromDatabase}
                readFromDatabase = {this.readFromDatabase}
                clearThumbnails = {this.clearThumbnails}
                clearImagesFromState = {this.clearImagesFromState}
                
              />
            </div>
            <div className="right-container">
              <ThumbnailBrowswer 
              readFromDatabase = {this.readFromDatabase}
              thumbnailArray = {this.state.thumbnailArray}
              onClick = {this.thumbnailOnClick}
              clearImagesFromState = {this.clearImagesFromState}
              getDropboxFileSearch = {this.getDropboxFileSearch}
              showTagSearchParams = {this.showTagSearchParams}
              tagSearchParams = {this.state.tagSearchParams}
              />
            </div>

          </div>

        </div>
      );
  }
}
export default App;

