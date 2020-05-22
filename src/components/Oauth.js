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
    

    componentDidMount() {
        //see if access token can be parsed from URL
        let urlAccessToken = this.parseQueryString(window.location.hash).access_token;
        let authError = this.parseQueryString(window.location.hash).error
        console.log("Access Token is: ", urlAccessToken)
        console.log("access error is: " + authError)

        if (urlAccessToken != undefined){
          this.setAccessTokenAsCookie(urlAccessToken)
        }

        this.props.getTokenFromCookies()
        // this.props.readFromLocalStorage("", 25)
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
            
            <div className='auth-window'>
                <input
                    type="submit"
                    value="connect"
                    onClick={this.dropboxAuthenticate}
                />

                <div id="pre-auth-section">
                    <a href="" id="authlink" className="button"></a>
                </div>
                
            </div>
        )
    }
    
}

export default Oauth