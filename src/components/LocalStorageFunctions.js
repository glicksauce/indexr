// readFromLocalStorage = (tags, resultsQty, isRandom) =>{
//   let resultsCount = 0
//     console.log("rendering " + tags)

//     //default of results to return
//     if (resultsQty == undefined){
//       resultsQty = 25
//     }

//     // iterate localStorage
//     for (var i = 0; resultsCount < resultsQty && i<localStorage.length; i++) {
//         if (resultsCount >= resultsQty) {
//           break
//         }

//         //if isRandom is on get a random key from localStorage otherwise just pull in order
//         if (isRandom) {
//           let randomInt = Math.floor(Math.random() * localStorage.length)
//           console.log("random int is ", randomInt)
//           var key = localStorage.key(randomInt)
//         } else {
//           var key = localStorage.key(i);
//         }

//         // use key name to retrieve the corresponding value
//         var value = localStorage.getItem(key);

//         let imgObj = JSON.parse(localStorage.getItem(key))
//         // console.log the iteration key and value
//         //console.log(imgObj)
//         //console.log('Key: ' + key + ', Value: ' + value);  

//         //query based on tags 
//         // tags param of "" indicates to search all tags
//         if (tags == "") {
//           console.log("got in here")
//           this.getDropboxThumbnails(imgObj.imagePath,imgObj.imageName)   
//           resultsCount += 1       
//         } else if (imgObj.tags.length > 0) {
//             //if (imgObj.tags.some(result => tags.indexOf(result) >= 0)) { //'OR' SEARCH FUNCTION
//             if (tags.every(result => imgObj.tags.indexOf(result) >= 0)) { //'AND' SEARCH FUNCTION     
//               console.log("tag search in localstorage found tags: " + tags + " inside imgObj: " + imgObj.tags)       
//               this.getDropboxThumbnails(imgObj.imagePath,imgObj.imageName)  
//               resultsCount += 1
//               //this.getDropboxThumbnails(imgObj.imagePath,imgObj.imageName)  
//             }
//         }

//     }

//     //update thumbnail count
//     let totalImages = localStorage.length
//     $('.thumbnail-heading').text("Showing " + resultsCount + " of " + totalImages + " images in library")
        
// }

//=========================
//LOCALSTORAGE REQUESTS
//=========================

// putInLocalStorage = (imagePath, imageName, imageId, client_modified_date, tags, allowRepeats) =>{

//   //if skipDuplicates isn't passed it is assigned false
//   if (allowRepeats == 'undefined') {
//     allowRepeats = true
//   }

//   //only run if allowRepeats is set to true or if item is not already in localstorage
//   if (allowRepeats || localStorage.getItem(imageId) == null) {
//       localStorage.setItem(imageId, JSON.stringify({
//         'imagePath': imagePath,
//         'imageName': imageName,
//         'client_modified_date': client_modified_date,
//         'tags': tags || ''
//     }))
//   }
// }
/*


thumbnailOnClick = (id) =>{
  //console.log(id + " clicked")

  //pull image from localstorage
  let clickedImage = JSON.parse(localStorage.getItem(id))
  //console.log(clickedImage)

  //pass image to load in main section
  this.loadFullImage(clickedImage)
}

*/
    // //pull item from localstorage, convert tags to array then re-set tags in local storage
    // let localStorageObj = JSON.parse(localStorage.getItem(imageId))
    // let tagsArray = tags.split(" ")
    // //console.log(tagsArray)
    // localStorageObj.tags = tagsArray
    // localStorage.setItem(imageId, JSON.stringify(localStorageObj))

    
// getTagsFromLocalStorage = () =>{
//   let tagsObj = {}

//   for (var i = 0; i < localStorage.length; i++) {
//     let key = localStorage.key(i)
//     let value = JSON.parse(localStorage.getItem(key))

//     if (value.tags) {
//         Object.values(value.tags).forEach( tag => {
//           //console.log("geTagsFromLocalStroage tag is: ", tag)

//           if (tag in tagsObj){
//             tagsObj[tag] += 1
//           } else { 
//             tagsObj[tag] = 1
//           }
//       })
//     }
//     //let formattedTags = (Object.values(value.tags))
//     //tagsArray.push(formattedTags)
//   }
//   //console.log("tags in use are: " + tagsArray)
//   //console.log("tags obj is : " + Object.keys(tagsObj))

//   this.setState({
//     tagsObj: tagsObj
//   })

//   return tagsObj
// }