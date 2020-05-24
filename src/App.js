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
var Dropbox = require('dropbox').Dropbox;


class App extends Component {
//=========================
//State
//=========================
state = {
  tagsObj: {}, //array of tags in use
  selectedSearchTags: [] //search terms selected
}

//=========================
//Get access token from cookies
//=========================
getTokenFromCookies = () =>{
  let tempToken = decodeURIComponent(document.cookie)

  let indexToken = tempToken.indexOf("access_token=")
  sessionAccessToken = tempToken.substring(13)

  console.log("temp token is: ", tempToken)
  console.log("index of is: " + indexToken)
  console.log("sessionAccessToken is: " + sessionAccessToken)
  return true
}

//=========================
//DROPBOX SDK FUNCTIONS
//=========================

//pass Token to get username
getDropboxUserName = () => {
  var dbx = new Dropbox({ accessToken: sessionAccessToken, fetch: fetch });
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

//get list of contents including subfolders
getDropboxFolderContents = () => {
  var dbx = new Dropbox({ accessToken: sessionAccessToken, fetch: fetch });
dbx.filesListFolder({ path: "/camera uploads"})
.then(function(response) {
  console.log(response);
})
.catch(function(error) {
  console.log(error);
});
}

//get thumbnails per given path to file
getDropboxThumbnails = (path, imageName) => {
  var dbx = new Dropbox({ accessToken: sessionAccessToken, fetch: fetch });
  dbx.filesGetThumbnail({ path: path, format: "jpeg", size: "w256h256", mode: "bestfit"})
  .then(response => {
  //console.log(response)
  //get the image BlobURL of the image
  let imageBlobURL = this.blobToFile(response.fileBlob, imageName, response.id)

  //render thumbnail
  this.showThumbnailImage(imageBlobURL, response.id)
  //console.log(response.fileBlob);
  })
  //.then(img => this.blobToFile(img.fileBlob, "image1"))
  .catch(function(error) {
  console.log(error);
  });
}

getDropboxHighQualityThumb = async(path, imageName) => {
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
  if (typeof imgQuery == undefined || imgQuery == "all") {
    imgQuery = ['.jpg', '.png', '.gif', '.tiff', '.jpeg', '.bmp']
  }

  //if imgQuery param comes in as string, try to convert it to array for upcoming 'foreach' statement
  if (typeof imgQuery == 'string'){
    imgQuery = imgQuery.split()
  }

  //iterate through each img ext to query
  imgQuery.forEach(imgExt => {
      var dbx = new Dropbox({ accessToken: sessionAccessToken, fetch: fetch });
      dbx.filesSearch({ path: "", query: imgExt, start: startIndex})
        .then((response) => {
              response.matches.forEach((item,index) => {
                  if (item.match_type['.tag'] == "filename") {
                    //console.log(item)
                    this.putInLocalStorage(item.metadata.path_lower, item.metadata.name, item.metadata.id, item.metadata.client_modified)
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

//=========================
//LOCALSTORAGE REQUESTS
//=========================

putInLocalStorage = (imagePath, imageName, imageId, client_modified_date, tags) =>{
  localStorage.setItem(imageId, JSON.stringify({
    'imagePath': imagePath,
    'imageName': imageName,
    'client_modified_date': client_modified_date,
    'tags': tags || ''

  }))
}

putInDatabase = (sessionAccessToken, imagePath, imageName, imageId, client_modified_date, tags) =>{

  //localStorage.setItem(imageId, JSON.stringify({
    let BaseURL = process.env.REACT_APP_BACKEND
    let dropboxUserId


        const postImg = () =>{

        //format params as object
          let postParams = {
            'dbx_user_id': dropboxUserId,
            'image_id': imageId,
            'image_path': imagePath,
            'image_name': imageName,
            'client_modified_date': client_modified_date,
            'tags': tags || ''
          }

          fetch(BaseURL + 'users/' + dropboxUserId + "/albums/",{
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

        this.getDropboxUserName()
        .then(res =>{
          dropboxUserId = res.account_id
          //console.log("dbx id is: ", dropboxUserId)
          postImg()
        })

  }


clearThumbnails = () =>{
  $('.thumb-image').remove()
}

readFromLocalStorage = (tags, resultsQty) =>{
  let resultsCount = 0
    console.log("rendering " + tags)
    //default of results to return
    if (resultsQty == undefined){
      resultsQty = 5
    }
    // iterate localStorage
    for (var i = 0; resultsCount < resultsQty && i<localStorage.length; i++) {
        if (resultsCount >= resultsQty) {
          break
        }
        // set iteration key name
        var key = localStorage.key(i);

        // use key name to retrieve the corresponding value
        var value = localStorage.getItem(key);

        let imgObj = JSON.parse(localStorage.getItem(key))
        // console.log the iteration key and value
        //console.log(imgObj)
        //console.log('Key: ' + key + ', Value: ' + value);  

        //query based on tags 
        // tags param of "" indicates to search all tags
        if (tags == "") {
          console.log("got in here")
          this.getDropboxThumbnails(imgObj.imagePath,imgObj.imageName)   
          resultsCount += 1       
        } else if (imgObj.tags.length > 0) {
            //if (imgObj.tags.some(result => tags.indexOf(result) >= 0)) { //'OR' SEARCH FUNCTION
            if (tags.every(result => imgObj.tags.indexOf(result) >= 0)) { //'AND' SEARCH FUNCTION    
              console.log("got in this one")  
              console.log(imgObj, tags)       
              this.getDropboxThumbnails(imgObj.imagePath,imgObj.imageName)  
              resultsCount += 1
              //this.getDropboxThumbnails(imgObj.imagePath,imgObj.imageName)  
            }
        }

    }

    //update thumbnail count
    let totalImages = localStorage.length
    $('.thumbnail-heading').text("Showing " + resultsCount + " of " + totalImages + " images in library")
        
}

readFromDatabase = (tags, maxResultsQty) =>{
  let BaseURL = process.env.REACT_APP_BACKEND
//   let resultsCount = 0
//     console.log("rendering " + tags)

//     //default of results to return
//     if (resultsQty == undefined){
//       maxResultsQty = 5
//     }
//     // iterate dbcount
//     for (var i = 0; resultsCount < maxResultsQty; i++) {
//         if (resultsCount >= maxResultsQty) {
//           break
//         }
//         // set iteration key name
//         var key = localStorage.key(i);

//         // use key name to retrieve the corresponding value
//         var value = localStorage.getItem(key);

//         let imgObj = JSON.parse(localStorage.getItem(key))
//         // console.log the iteration key and value
//         //console.log(imgObj)
//         //console.log('Key: ' + key + ', Value: ' + value);  

            const patchImg = () =>{

              //format params as object
                let postParams = {
                  // 'dbx_user_id': dropboxUserId,
                  // 'image_id': imageId,
                  'tags': tags
                }
                console.log(JSON.stringify(postParams))
                fetch(BaseURL + 'users/' + dropboxUserId + "/albums/tagsearch/album/" +tags,{
                  body: JSON.stringify(postParams),
                  method: 'GET',
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

              this.getDropboxUserName()
              .then(res =>{
                dropboxUserId = res.account_id
                //console.log("dbx id is: ", dropboxUserId)
                patchImg()
              })
//         let imgOb = fetch 
//         //query based on tags 
//         // tags param of "" indicates to search all tags
//         if (tags == "") {
//           console.log("got in here")
//           this.getDropboxThumbnails(imgObj.imagePath,imgObj.imageName)   
//           resultsCount += 1       
//         } else if (imgObj.tags.length > 0) {
//             //if (imgObj.tags.some(result => tags.indexOf(result) >= 0)) { //'OR' SEARCH FUNCTION
//             if (tags.every(result => imgObj.tags.indexOf(result) >= 0)) { //'AND' SEARCH FUNCTION    
//               console.log("got in this one")  
//               console.log(imgObj, tags)       
//               this.getDropboxThumbnails(imgObj.imagePath,imgObj.imageName)  
//               resultsCount += 1
//               //this.getDropboxThumbnails(imgObj.imagePath,imgObj.imageName)  
//             }
//         }

//     }

//     //update thumbnail count
//     let totalImages = localStorage.length
//     $('.thumbnail-heading').text("Showing " + resultsCount + " of " + totalImages + " images in library")
        
}

getTagsFromLocalStorage = () =>{
  let tagsObj = {}

  for (var i = 0; i < localStorage.length; i++) {
    let key = localStorage.key(i)
    let value = JSON.parse(localStorage.getItem(key))

    if (value.tags) {
        Object.values(value.tags).forEach( tag => {
          //console.log("geTagsFromLocalStroage tag is: ", tag)

          if (tag in tagsObj){
            tagsObj[tag] += 1
          } else { 
            tagsObj[tag] = 1
          }
      })
    }
    //let formattedTags = (Object.values(value.tags))
    //tagsArray.push(formattedTags)
  }
  //console.log("tags in use are: " + tagsArray)
  //console.log("tags obj is : " + Object.keys(tagsObj))

  this.setState({
    tagsObj: tagsObj
  })

  return tagsObj
}

//=========================
//BLOB AND IMAGE RENDERING
//=========================

//render thumbnail image
showThumbnailImage = (blobURL, id) =>{
  let myImage = $('<img>')
  myImage
  .attr('src', blobURL)
  .attr('class', 'thumb-image')
  .attr('id', id)
  $('.thumb-browser').append(myImage)

  //add event for when clicked
  myImage.click(() => this.thumbnailOnClick(id))
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

//=========================
//MOUSE FUNCTIONS
//=========================

//
thumbnailOnClick = (id) =>{
  //console.log(id + " clicked")

  //pull image from localstorage
  let clickedImage = JSON.parse(localStorage.getItem(id))
  //console.log(clickedImage)

  //pass image to load in main section
  this.loadFullImage(clickedImage)
}

loadFullImage = async(localStorageObj) =>{
  console.log(localStorageObj)

  let imageMain = await this.getDropboxHighQualityThumb(localStorageObj.imagePath, localStorageObj.imageName)
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
  $('.tags-main').val(Object.values(localStorageObj.tags).join(' '))

  //get image path from obj and pass to field
  $('.image-path').val(localStorageObj.imagePath)

  //get image date from obj and pass to field
  $('.image-date').val(localStorageObj.client_modified_date)

  //add handle change so tag gets updated when changed
  //myImage.change(this.handleChange)
  $('.left-container-image-container').prepend(myImage)
}

//=========================
//Handle Changes and localStorage updates
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

    //pull item from localstorage, convert tags to array then re-set tags in local storage
    let localStorageObj = JSON.parse(localStorage.getItem(imageId))
    let tagsArray = tags.split(" ")
    //console.log(tagsArray)
    localStorageObj.tags = tagsArray
    localStorage.setItem(imageId, JSON.stringify(localStorageObj))

    //adding tags to image in database
    console.log("adding to db: ", imageId, tags)
    this.updateTagsInDatabase(imageId, tags.split(" "))
  }
}

updateTagsInDatabase = (imageId, tags) =>{

  let BaseURL = process.env.REACT_APP_BACKEND
  let dropboxUserId


      const patchImg = () =>{

      //format params as object
        let postParams = {
          // 'dbx_user_id': dropboxUserId,
          // 'image_id': imageId,
          'tags': tags
        }
        console.log(JSON.stringify(postParams))
        fetch(BaseURL + 'users/' + dropboxUserId + "/albums/" +imageId,{
          body: JSON.stringify(postParams),
          method: 'PATCH',
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

      this.getDropboxUserName()
      .then(res =>{
        dropboxUserId = res.account_id
        //console.log("dbx id is: ", dropboxUserId)
        patchImg()
      })

}

  componentDidMount() {
    //this.updateTagsInDatabase('id:Jo_ZZoosmRAAAAAAAAAAFw', ['fun','run'])
    this.getDropboxUserName()
    $('.tags-main').change(this.handleChange)

  } 

  render () {
    return (
        <div className="App">
          <header className="App-header">
            <h1>Welcome to indexr</h1>
            <Oauth
              getTokenFromCookies = {this.getTokenFromCookies}
              getDropboxFileSearch = {this.getDropboxFileSearch}
            />
          </header>
          <div className="container">
            <h3>select a thumbnail to preview and add tags</h3>
            <div className="left-container">
              <div className="left-container-image-container">
                <div className="tag-section">
                  <h3>tags</h3>
                  <input className="tags-main" placeholder="tags go here" type="text"></input>
                  <h3 className="line-2">image path</h3>
                  <input className="no-edit image-path"></input>
                  <h3 className="line-3">date</h3>
                  <input className="no-edit image-date"></input>
                </div>
              </div>
            </div>
            <div className="middle-container">
              <TagSearch
                tagsObj = {this.state.tagsObj}
                getTagsFromLocalStorage = {this.getTagsFromLocalStorage}
                readFromLocalStorage = {this.readFromLocalStorage}
                clearThumbnails = {this.clearThumbnails}
              />
            </div>
            <div className="right-container">
              <ThumbnailBrowswer 
              readFromLocalStorage = {this.readFromLocalStorage}
              />
            </div>
            {/* <input type="file"></input>
            <a href="/downloads/" >home</a>
            <img src="file:///home/jgman/Desktop/Screenshot%20from%202020-04-25%2021-21-01.png"></img>
            <img src="https://www.dropbox.com/home/Camera%20Uploads?preview=2019-01-30+07.44.59.jpg"></img> */}
          </div>

        </div>
      );
  }
}
export default App;

