import React, { Component } from 'react';
import * as $ from 'jquery'
require('isomorphic-fetch')

let Token = process.env.REACT_APP_DBX_TOKEN
var Dropbox = require('dropbox').Dropbox;



class Oauth extends Component{

    //credit to: https://github.com/dropbox/dropbox-sdk-js/blob/master/examples/javascript/utils.js
    //takes urlparms in string form and returns object
    parseQueryString = (str) => {
            var ret = Object.create(null);
            //console.log("string is ", str, ret)
            if (typeof str !== 'string') {
              return ret;
            }
      
            str = str.trim().replace(/^(\?|#|&)/, '');
      
            if (!str) {
              return ret;
            }
      
            str.split('&').forEach(function (param) {
              var parts = param.replace(/\+/g, ' ').split('=');
              // Firefox (pre 40) decodes `%3D` to `=`
              // https://github.com/sindresorhus/query-string/pull/37
              var key = parts.shift();
              var val = parts.length > 0 ? parts.join('=') : undefined;
      
              key = decodeURIComponent(key);
      
              // missing `=` should be `null`:
              // http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
              val = val === undefined ? null : decodeURIComponent(val);
      
              if (ret[key] === undefined) {
                ret[key] = val;
              } else if (Array.isArray(ret[key])) {
                ret[key].push(val);
              } else {
                ret[key] = [ret[key], val];
              }
            });
      
            
            return ret;
    }

    setAccessTokenAsCookie = (token, expireDays) =>{
      let defaultExpDays = expireDays || 7 //setting cookie to expire in 7 days
      var expDate = new Date()
      expDate.setTime(expDate.getTime() + (defaultExpDays*24*60*60*1000))
      let expires = "expires="+expDate.toUTCString()
      document.cookie = ('access_token=' + token + ';' + expires + ';')
    }

    checkIfUserExists = (dbx_id) =>{
      let BaseURL = process.env.REACT_APP_BACKEND

        //format params as object
        let getParams = {
          'dbx_id': dbx_id,
        }
        console.log("checking if dbx id: " + dbx_id + " is in db")
        let userCheck = fetch(BaseURL + 'users/' + dbx_id,{
          //body: JSON.stringify(getParams),
          method: 'GET',
          headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
          }
        })
        .then(res => (res.json()))
        .then(data => {
          console.log(data)
          if (data.dbx_id == dbx_id) {
            return data
          } else {
            return false
          }
        })
        // .then(() => console.log(obj))
        .catch(error => console.log(error))

        return userCheck
    }

    createUser = (dbx_id, access_token) =>{
        //event.preventDefault()
        let BaseURL = process.env.REACT_APP_BACKEND

        //format params as object
        let postParams = {
          'dbx_id': dbx_id,
          'last_access_token': access_token
        }

        fetch(BaseURL + 'users',{
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
    

    componentDidMount() {
        //see if access token can be parsed from URL
        let urlAccessToken = this.parseQueryString(window.location.hash).access_token;
        let urlAccountId = this.parseQueryString(window.location.hash).account_id
        let authError = this.parseQueryString(window.location.hash).error
        // console.log("URL params are: ",this.parseQueryString(window.location.hash)) 
        // console.log("Access Token is: ", urlAccessToken)
        // console.log("access error is: " + authError)

        if (urlAccessToken != undefined){
          this.setAccessTokenAsCookie(urlAccessToken)
        }

        //loads access token as global variable
        let isAccessToken = this.props.getTokenFromCookies()

        if (isAccessToken) {
          this.checkIfUserExists(urlAccountId)
          .then(res => {
              console.log("user is: ", res)

              //if user does not exist, then create user on backend
              if (!res){
                this.createUser(urlAccountId, urlAccessToken)
              }
            })

          //set username, hide Dropbox connect, show main section
          this.props.getDropboxUserName()
          .then(res =>{
              if (res) {
                let welcomeString = "Welcome " + res.name.familiar_name
                $('.authorized').append('<h2>').text(welcomeString)
                $('.not-authorized').hide()
                this.props.showContainer()
              }
          })
          
          //add pull images from dropbox
          //this.props.getDropboxFileSearch(0, 'all', 1)
        }

    }

    dropboxAuthenticate = () =>{
        console.log('authenticating...')
        //console.log(process.env)

        //pass client id (App Key) and redirect URL and get a link that user can allow app to run
        var dbx = new Dropbox({fetch: fetch });
        dbx.setClientId(process.env.REACT_APP_DBX_CLIENT_ID)
        let dbxLinkURL = dbx.getAuthenticationUrl(process.env.REACT_APP_DBX_REDIRECT_URI)

        console.log(dbxLinkURL)
        window.location = dbxLinkURL
    }

    
    render () {
        return(
          <header className="App-header">
            <h1>Welcome to indexr</h1>
            <div className='auth-window'>
              <div className='not-authorized'>
                <p>Please connect to Dropbox to begin tagging photos</p>
                  <input
                      type="submit"
                      value="connect"
                      onClick={this.dropboxAuthenticate}
                  />

                  <div id="pre-auth-section">
                      <a href="" id="authlink" className="button"></a>
                  </div>
              </div>
              <div className='authorized'>
              </div>
            </div>
          </header>
        )
    }
    
}

export default Oauth