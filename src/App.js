import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import listReactFiles from 'list-react-files'
import * as $ from 'jquery'
import ThumbnailBrowswer from "./components/ThumbnailBrowser.js"
import { getNodeText } from '@testing-library/react';
require('isomorphic-fetch');


let Token = process.env.REACT_APP_DBX_TOKEN
var Dropbox = require('dropbox').Dropbox;


class App extends Component {

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
  this.blobToFile(response.fileBlob, imageName, response.id)
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
  dbx.filesSearch({ path: "", query: ".jpg", start: 1001})
  .then((response) => {
        response.matches.forEach((item,index) => {
            if (item.match_type['.tag'] == "filename") {
              //console.log(item.metadata.id)
              this.putInLocalStorage(item.metadata.path_lower, item.metadata.name, item.metadata.id)
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

putInLocalStorage = (imagePath, imageName, imageId, tags) =>{
  localStorage.setItem(imageId, JSON.stringify({
    'imagePath': imagePath,
    'imageName': imageName,
    'tags': tags || ''

  }))
}

readFromLocalStorage = (resultsQty) =>{

    //default of results to return
    if (resultsQty == undefined){
      resultsQty = 20
    }
    // iterate localStorage
    for (var i = 0; i < resultsQty; i++) {

      // set iteration key name
      var key = localStorage.key(i);

      // use key name to retrieve the corresponding value
      var value = localStorage.getItem(key);

      let imgObj = JSON.parse(localStorage.getItem(key))
      // console.log the iteration key and value
      //console.log(imgObj)
      //console.log('Key: ' + key + ', Value: ' + value);  

      //query based on tags 
      // if (imgObj.tags.includes("funny")) {
      //   this.getDropboxThumbnails(imgObj.imagePath,imgObj.imageName)
      // }

      //testing reading by id
        this.getDropboxThumbnails(imgObj.imagePath,imgObj.imageName)

    }
        
}

//=========================
//BLOB AND IMAGE RENDERING
//=========================

//takes a blob and renders image. If imageid is passed it will save that to localstorage  
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

  //console.log(objectURL)
  let myImage = $('<img class="blob-created">')
  myImage
  .attr('src', objectURL)
  .attr('class', 'thumb-image')
  $('.thumb-browser').prepend(myImage)
  //return theBlob;
  return objectURL
}

//=========================
//MOUSE FUNCTIONS
//=========================

loadFullImage = async() =>{
  
  let imageMain = await this.getDropboxHighQualityThumb('/data/my pictures/2008/2008-11-18 hawaii/north shore/img_2515.jpg', 'TestImage')
  console.log(imageMain)

  let imageBlob = this.blobToFile(imageMain.fileBlob, imageMain.name)
  console.log(imageBlob)

  let myImage = $('<img class="image-main">')
  myImage
  .attr('src', imageBlob)
  .attr('class', 'full-image')
  $('.left-container').append(myImage)
  
}

  componentDidMount() {
    this.loadFullImage()
    //testing localstorage
    //this.putInLocalStorage("testimage","https://furtheredagogy.files.wordpress.com/2018/02/road-sign-361513_960_720.jpg","id:123",["funny","sad","true"])

    // this.readFromLocalStorage()
    //this.getDropboxThumbnails()
    // this.getDropboxFolderContents()
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
          </header>
          <div className="container">
            <h3>select a directory to start tagging photos</h3>
            <div className="left-container">

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