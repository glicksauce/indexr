import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import listReactFiles from 'list-react-files'
import * as $ from 'jquery'
require('isomorphic-fetch');


let Token = process.env.REACT_APP_DBX_TOKEN
var Dropbox = require('dropbox').Dropbox;




class App extends Component {

  
blobToFile = (theBlob, fileName) => {
  //A Blob() is almost a File() - it's just missing the two properties below which we will add
  theBlob.lastModifiedDate = new Date();
  theBlob.name = fileName;
  var objectURL = URL.createObjectURL(theBlob);
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
    this.blobToFile(response.fileBlob, imageName)
    //console.log(response.fileBlob);
  })
  //.then(img => this.blobToFile(img.fileBlob, "image1"))
  .catch(function(error) {
    console.log(error);
  });
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
              //onsole.log(item.metadata.id)
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
    //this.getDropboxThumbnails()
    // this.getDropboxFolderContents()
     this.getDropboxFileSearch()
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
