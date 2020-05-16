# indexr

### An advanced image viewing app that allows user to custom tag their localally stored images. User can search by tags (or exclude by tag) to quickly find the image they were thinking of

## Technologies Used

### 
Postgresql datatbase  
Ruby/Rails  
React (create-react-app)  
React Router (for user authentication)  
Javascript (localstorage)  

## New technologies
This project relies on parsing a user's local directory to find images (with a stretch goal to automatically parse sub-directories as well). This will involve learning some Web API's like [FileSystemDirectoryEntry]: (https://developer.mozilla.org/en-US/docs/Web/API/FileSystemDirectoryEntry/createReader)

## Back End  
### Tables  
A minimum of two tables in a one-to-many relationship, Users < Album

### CRUD Actions
- Create: Done after directory is loaded each image in array is added
- Read: When viewing albums of tagged images
- Update: When adding (or removing) tags to images in album
- Destroy: when deleting albums or images from an album

### Data Flow
Read local file director for files > array of images passed into state/props > tagged images are stored in local storage > authenticated users can save their tags into database.

### User stories
- Mel's son brings home his first date for dinner. Mel wants to show date embarassing pictures of son as a boy but has trouble finding the image. Her albums are sorted by year. But it takes a long time to search through each directory for the right picture. Mel however uses indexr and with a quick search of "temper tantrum" she brings up the images she needed to entertain her guests

## MVP  
- Backend and frontend hosted on Heroku (or similiar)
- User can select a local directory and see images in that directory
- Tagging: user can 'tag' photos with key words. 
- Tags are saved to state,localstorage, and DB
- Viewing: user can enter a tag and view images with that tag
- Sorting user can perform sorts like (images with least/most amount of tags, exclude by tag, etc.)

## Stretch Goals and future improvements
- Autotagging: images are tagged based on the directory they are located in
- User creation and authentication using React Router (or similiar)
- Authenticated user can save their localstorage into DB
- App can work with storage on mobile devices
- User can also tag non-local images (images from a website)
