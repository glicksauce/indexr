// //get list of contents including subfolders
// getDropboxFolderContents = () => {
//   var dbx = new Dropbox({ accessToken: sessionAccessToken, fetch: fetch });
// dbx.filesListFolder({ path: "/camera uploads"})
// .then(function(response) {
//   console.log(response);
// })
// .catch(function(error) {
//   console.log(error);
// });
// }

// //render thumbnail image
// showThumbnailImage = (blobURL, id) =>{
//   let myImage = $('<img>')
//   myImage
//   .attr('src', blobURL)
//   .attr('class', 'thumb-image')
//   .attr('id', id)
//   $('.thumb-browser').append(myImage)

//   //add event for when clicked
//   myImage.click(() => this.thumbnailOnClick(id))
// }


// updateTagsInDatabase = (imageId, tags) =>{

//   let BaseURL = process.env.REACT_APP_BACKEND
//   let dropboxUserId

//       tags.forEach(tag => {
//         //format params as object
//         let postParams = {
//           'dbx_user_id': sessionAccountId,
//           // 'image_id': imageId,
//           'tag_string': tag.toLowerCase()
//         }

//         //calls will crete a new tag or return tag that has slready been created
//         console.log(JSON.stringify(postParams))
//         fetch(BaseURL + 'users/' + sessionAccountId + "/albums/" +imageId + "/tags",{
//           body: JSON.stringify(postParams),
//           method: 'POST',
//           headers: {
//             'Accept': 'application/json, text/plain, */*',
//             'Content-Type': 'application/json'
//           }
//         })
//         .then(res => (res.json()))
//         .then(data => {
//           console.log("backend tag return is : ", data)

//           //delete all album_tags for this image id
//           fetch(BaseURL + 'users/' + sessionAccountId + "/albums/" +imageId + "/destroy_album_tags",{
//             method: 'DELETE',
//             headers: {
//               'Accept': 'application/json, text/plain, */*',
//               'Content-Type': 'application/json'
//             }
//             })
            
//           //add album tags for all tags for this image id
//           let albumTagsParams = {
//             'tag_id':data.id
//           }

//           console.log("albumTagParams are: ", albumTagsParams)
//           fetch(BaseURL + 'users/' + sessionAccountId + "/albums/" +imageId + "/album_tags",{
//             body: JSON.stringify(albumTagsParams),
//             method: 'POST',
//             headers: {
//               'Accept': 'application/json, text/plain, */*',
//               'Content-Type': 'application/json'
//             }
//             })
//         })
//         // .then(() => console.log(obj))
//         .catch(error => console.log(error))
//       })

// }








// new custom tag on change:
// customTagOnChange = (event) =>{
//   event.target.id = event.target.value

//   //if custom tag box is cleared reset tags state to null
//   if (event.target.id == '') {
//       this.setState({
//           selectedSearchTags: []
//       })
//   }

//   let newValue = event.target.id.split(" ")
//   newValue.forEach((value,index) => {
//       if (value != ""){
//           if (index == newValue.length -1){ //bypass render images unless on last loop through
//               this.tagOnClick(value, true)
//           } else{
//               this.tagOnClick(value, true, true)
//           }
//       }   

//   })
// }

// old customtagonchange:
// customTagOnChange = (event) =>{
//   let existingValue = event.target.id.split(" ")
//   existingValue.forEach((value,index) => {
//       if (value != ""){
//           if (index == existingValue.length -1){ //bypass render images unless on last loop through
//               this.tagOnClick(value, true)
//           } else{
//               this.tagOnClick(value, true, true)
//           }
//       }   

//   })
  
//   event.target.id = event.target.value

//   let newValue = event.target.id.split(" ")
//   newValue.forEach((value,index) => {
//       if (value != ""){
//           if (index == existingValue.length -1){ //bypass render images unless on last loop through
//               this.tagOnClick(value, true)
//           } else{
//               this.tagOnClick(value, true, true)
//           }
//       }   

//   })
// }


//testing stuff goes here:
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