import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import listReactFiles from 'list-react-files'
import * as $ from 'jquery'
require('isomorphic-fetch');


let Token = process.env.REACT_APP_DBX_TOKEN
var Dropbox = require('dropbox').Dropbox;




class App extends Component {

addBlobtoLocalStorage = (imageId, objectURL) => {
  let localStorageImage = JSON.parse(localStorage.getItem(imageId))
  console.log(localStorageImage)
  localStorageImage["ImageBlob"] = objectURL
  console.log("localstorage image is: " + localStorageImage)
  localStorage.setItem(imageId, JSON.stringify(localStorageImage))
} 
  
blobToFile = (theBlob, fileName, imageId) => {
  //A Blob() is almost a File() - it's just missing the two properties below which we will add
  theBlob.lastModifiedDate = new Date();
  theBlob.name = fileName;
  var objectURL = URL.createObjectURL(theBlob);

  //if imageId is passed add blob to localStorage
  if (imageId){
    this.addBlobtoLocalStorage(imageId, objectURL)
  }
  console.log(objectURL)
  let myImage = $('<img class="blob-created">')
  myImage.attr('src', objectURL)
  $('.App').append(myImage)
  return theBlob;
}


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

// //get list of contents per given path
//   var dbx = new Dropbox({ accessToken: Token, fetch: fetch });
//   dbx.filesListFolder({ path: "/camera uploads"})
//     .then(function(response) {
//       console.log(response);
//     })
//     .catch(function(error) {
//       console.log(error);
//     });

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

getLocalStorageThumbnails = (imageId) =>{
  let imageBlob = JSON.parse(localStorage.getItem(imageId)).ImageBlob
  console.log("blob pulled")
  console.log(imageBlob)
  let myImage = $('<img class="blob-created-1">')
  myImage.attr('src', imageBlob)
  $('.App').append(myImage)
}

putInLocalStorage = (imagePath, imageName, imageId, tags) =>{
  localStorage.setItem(imageId, JSON.stringify({
    'imagePath': imagePath,
    'imageName': imageName,
    'tags': tags || ''

  }))
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

readFromLocalStorage = () =>{
// iterate localStorage
for (var i = 0; i < localStorage.length; i++) {

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
  if (key == 'id:hJnbG6_Z4cMAAAAAAABR6g'){
    console.log("key found")
    this.getDropboxThumbnails(imgObj.imagePath,imgObj.imageName)
    this.getLocalStorageThumbnails(key)
  }
}
    
}

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

  componentDidMount() {
    //testing localstorage
    //this.putInLocalStorage("testimage","https://furtheredagogy.files.wordpress.com/2018/02/road-sign-361513_960_720.jpg","id:123",["funny","sad","true"])

    this.readFromLocalStorage()
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
          <div className="open-file">
            <h3>select a directory to start tagging photos</h3>
            <input type="file"></input>
            <a href="/downloads/" >home</a>
            <img src="file:///home/jgman/Desktop/Screenshot%20from%202020-04-25%2021-21-01.png"></img>
            <img src="https://www.dropbox.com/home/Camera%20Uploads?preview=2019-01-30+07.44.59.jpg"></img>
          </div>
        </div>
      );
  }
}
export default App;
