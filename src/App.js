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


let Token = process.env.REACT_APP_DBX_TOKEN
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
//DROPBOX SDK FUNCTIONS
//=========================

//pass Token to get username
getDropboxUserName = () => {
  var dbx = new Dropbox({ accessToken: Token, fetch: fetch });
  dbx.usersGetCurrentAccount()
    .then(function(response) {
      console.log(response);
    })
    .catch(function(error) {
      console.log(error);
    });
}

//get list of contents including subfolders
getDropboxFolderContents = () => {
  var dbx = new Dropbox({ accessToken: Token, fetch: fetch });
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
  var dbx = new Dropbox({ accessToken: Token, fetch: fetch });
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
  var dbx = new Dropbox({ accessToken: Token, fetch: fetch });
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
getDropboxFileSearch = () => {
  var dbx = new Dropbox({ accessToken: Token, fetch: fetch });
  dbx.filesSearch({ path: "", query: ".jpg", start: 2001})
  .then((response) => {
        response.matches.forEach((item,index) => {
            if (item.match_type['.tag'] == "filename") {
              console.log(item)
              this.putInLocalStorage(item.metadata.path_lower, item.metadata.name, item.metadata.id, item.metadata.client_modified)
              //this.getDropboxThumbnails(item.metadata.path_lower,item.metadata.name)
            }
        })
    //console.log(response);
  })
  .catch(function(error) {
    console.log(error);
  });
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
  $('.left-container-image-container').prepend(myImage)

  $('.tags-main').val(Object.values(localStorageObj.tags).join(' '))

  $('.image-path').val(localStorageObj.imagePath)

  $('.image-date').val(localStorageObj.client_modified_date)

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
  }
}
  componentDidMount() {
    this.getDropboxUserName()
    $('.tags-main').change(this.handleChange)
    //this.loadFullImage()
    //testing localstorage
    //this.putInLocalStorage("testimage","https://furtheredagogy.files.wordpress.com/2018/02/road-sign-361513_960_720.jpg","id:123",["funny","sad","true"])

    // this.readFromLocalStorage()
    //this.getDropboxThumbnails()
    // this.getDropboxFolderContents()

    //function to scan dropbox for image files
     //this.getDropboxFileSearch()
    // console.log(Dropbox)

    // var button = Dropbox.createChooseButton(options);
    // document.getElementById("root").appendChild(button);

    // fetch('/albums/1')                                        
    // .then(response => response.json())  
    // .then (res => console.log(res))
    // .catch(err => console.log(err)) 
  //   this.readDirectory('home/jgman/Dropbox/Picturues/Jays_picks')
  //window.open()
    //listReactFiles('/home/jgman/Dropbox/Picturues/Jays_picks').then(files => console.log(files))

    // function getroutes(list){ 
    //   list.forEach(function(element) { 
    //       app.get("/"+ element, function(req, res) { 
    //           res.sendFile(__dirname + "/public/extracted/" + element); 
    //      }); 
    //  }); 
    // }
  } 

  render () {
    return (
        <div className="App">
          <header className="App-header">
            <h1>Welcome to indexr</h1>
            <Oauth
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


//testing stuff goes here:

//dropbox get downloadable link:
// var dbx = new Dropbox({ accessToken: Token, fetch: fetch });
// dbx.filesGetTemporaryLink({ path: '/data/my pictures/2008/2008-11-18 hawaii/north shore/img_2515.jpg'})
// .then(response => {
// console.log(response.link)
// let myImage = $('<img class="blob-created">')
// myImage
// .attr('src', 'https://dl.dropboxusercontent.com/apitl/1/AaEMsky_eqv9rg04p_M7iQTdQiUWXX6QK915tdTslWf_SD_BX1w96iDSY_t21YCcFek6lDf83v5jXaT0QCpRwbTPOcYZmXaDqemovId-9lTXRVwdkDnGVOmM-z4v8t0HmgMByI6rNNhWUZTXwcBLrFrX5AbxEb1LhE38AkvDMEnCPG0DzH5yIKBzNpA7zTvPCviYgPuKaqv1KP438l1Ycd3JvwQlBNdUHtpaPDecWUgogxXExuFwPs-dvhcbAZ8PnXNUQO_oB6xVfsRrBD8n8fLRp4Rkq8Kqb1w6Az0IbPBWa37qKUDZhKIPFaDv1pmkerBeO_-RMKpbTKHI4ipQAcJWH6CaDgq2KI57j1UwhNK0bEKNU3JHb8AJ8ubJEQ55Flb5RBRy7FT3R-whNcaC-v2at6HKx6qmj-Z7tOUPChOQKo9avzWMB3-L33_niZOH72A')
// .attr('class', 'full-image')
// $('.App').append(myImage)
// // this.blobToFile(response.fileBlob, "testImageName", response.id)
// //console.log(response.fileBlob);
// })
// //.then(img => this.blobToFile(img.fileBlob, "image1"))
// .catch(function(error) {
// console.log(error);

//sample id is: id: "id:hJnbG6_Z4cMAAAAAAACbzA"

 

  // readDirectory(directory) {
  //   let dirReader = directory.createReader();
  //   let entries = [];
  
  //   let getEntries = function() {
  //     dirReader.readEntries(function(results) {
  //       if (results.length) {
  //         entries = entries.concat(Array.from(results));
  //         getEntries();
  //       }
  //     }, function(error) {
  //       /* handle error -- error is a FileError object */
  //     });
  //   };
  
  //   getEntries();
  //   return entries;
  // }

  // //get list of contents per given path
//   var dbx = new Dropbox({ accessToken: Token, fetch: fetch });
//   dbx.filesListFolder({ path: "/camera uploads"})
//     .then(function(response) {
//       console.log(response);
//     })
//     .catch(function(error) {
//       console.log(error);
//     });


//feature does not work at this time
// addBlobtoLocalStorage = (imageId, objectURL) => {
//   let localStorageImage = JSON.parse(localStorage.getItem(imageId))
//   console.log(localStorageImage)
//   localStorageImage["imageBlob"] = objectURL
//   console.log("localstorage image is:")
//   console.log(localStorageImage)
//   localStorage.setItem(imageId, JSON.stringify(localStorageImage))
// }

// //not possible at this time
// getLocalStorageThumbnails = (imageId) =>{
//   let imageBlob = JSON.parse(localStorage.getItem(imageId)).imageBlob
//   console.log("blob pulled")
//   console.log(imageBlob)
//   let myImage3 = new Image()
//   myImage3.src = imageBlob
//   $('.App').append(myImage3)
// }