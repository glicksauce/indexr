# indexr

### An advanced image viewing app that allows user to custom tag images stored in their Dropbox account. User can search by tags to quickly find the image(s) they were searching for.

## Project Links  
### Backend
Github: https://github.com/glicksauce/indexr_api  
Hosted API DB: https://indexr-api.herokuapp.com/

### Frontend
Github: https://github.com/glicksauce/indexr  
App: https://indexr-client.herokuapp.com/

## Project Deliverables v1  (~5/16/2020)
- User can select a local directory and see images in that directory
- Tagging: user can 'tag' photos with key words. 
- Tags are saved to state,localstorage, and DB
- Viewing: user can enter a tag and view images with that tag
- Sorting user can perform sorts like (images with least/most amount of tags, exclude by tag, etc.)

## Project Deliverables v2 (~5/19/2020)
- Due to security issues of parsing images directly from local directories, changed scope to pull images from user's Dropbox account instead. Using Dropbox SDK to sync to accounts
- Tags are saved to both localstorage and postgresql background

## Technologies Used

### 
Postgresql database  
Ruby/Rails  
React (create-react-app)  
Dropbox SDK: https://www.dropbox.com/developers/documentation/javascript#documentation  
OAuth 2.0 (for authentication to Dropbox)  
Javascript (localstorage)  

## Learning New technologies
 * ### Working with 3rd party Software Developer Kits (SDK). Dropbox SDK's are just shortcuts to run complex RESTful API requests. Dropbox documentation is very complete: https://dropbox.github.io/dropbox-sdk-js/Dropbox.html
  
 * ### Using OAuth 2.0 to authenticate user's to their Dropbox account:
Dropbox had a good explanation of how their Oauth functions work:
https://www.dropbox.com/developers/reference/oauth-guide  
![] (/public/oauth2-web-diagram.png)

1) Connect button is pressed. This redirects user to Dropbox login and includes my app's key as a parameter
2) User logs into Dropbox and grants access to integrate with my app
3) User is redirected back to my webpage along with an access token that grants my app access to their acccount
4) Access token is required for most SDK functions, my app stores this as a cookie which is also used to check if user is logged in or not

## Back End  
### Tables  
#### Two tables in a one-to-many relationship, Users < Album
##### Users Table
- custom set primary key to 'dbx_id' which is the user's id according to Dropbox. 
- also have 'last_access_token' which is the most recent access token user has received

##### Albums Table
- custom set primary key to 'image_id' which is the unique id assigned to each image by dropbox. I am making the assumption that this id is unique even among different user's Dropbox accounts
- also have 'dbx_user_id' to tie images back to the user,     
- 'image_path': where in the user's Directory image can be found,  
- 'image_name': name of the image,  
- 'client_modified_date': using this as the image date,  
- 'tags': an array of strings used to identify the image 

The next improvement involves creating a new table "tags" and a many-to-many relationship of tags to images to improve search and sorting functionality

### Data Flow
- Dropbox authenticated users have their access token stored as a cookie
- Access token is used with Dropbox SDK functions to do a file search in user's Dropbox account. Search is for image files (".jpg", ".png", ".gif" etc...)
- File results are stored both in localstorage and backend. Tag search queries are currently performed on the front end from localstorage. Once backend has the tags table and relationship in place all queries will be able to be performed on the backend and localstorage use can be phased out
- No images are stored locally, only image paths. Each image render requires an API query to Dropbox which returns the image back as a fileBlob. The fileBlob is then converted to an image and rendered on the page. 
- State and props: Used to hold things passed between React modules. Available tags, Selected tags, thumbnail images rendered, and main image rendered
- When main image is rendered it shows tags currently assigned to it. Each tag is seperated by a space. When tag is edited a handlechange function takes the new value and puts it both into localstorage and the database


## Future improvements pipeline
- Creation of tags table and moving search queries to backend
- Autotagging: images are tagged based on the directory they are located in
- User can set tags to 'exclude' from search
- User can search images by date
- User can search images by path
- User can also tag images outside of Dropbox

### User stories
- Mel's son brings home his first date for dinner. Mel wants to show date embarassing pictures of son as a boy but has trouble finding the image. Her albums are sorted by year. But it takes a long time to search through each directory for the right picture. Mel however uses indexr and with a quick search of "temper tantrum" she brings up the images she needed to entertain her guests