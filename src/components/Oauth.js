import React, { Component } from 'react';
import * as $ from 'jquery'
require('isomorphic-fetch')

let Token = process.env.REACT_APP_DBX_TOKEN
var Dropbox = require('dropbox').Dropbox;



class Oauth extends Component{

    //credit to: https://github.com/dropbox/dropbox-sdk-js/blob/master/examples/javascript/utils.js
    parseQueryString = (str) => {
            var ret = Object.create(null);
            console.log("string is ", str, ret)
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
    

    componentDidMount() {
        let urlAccessToken = this.parseQueryString(window.location.hash).access_token;

        console.log("Access Token is: ", urlAccessToken)
        console.log(urlParams2)

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
                    <p>This example takes the user through Dropbox's API OAuth flow using <code>Dropbox.getAuthenticationUrl()</code> method [<a href="http://dropbox.github.io/dropbox-sdk-js/Dropbox.html#getAuthenticationUrl">docs</a>] and then uses the generated access token to list the contents of their root directory.</p>
                    <a href="" id="authlink" className="button">Authenticate</a>
                    <p className="info">Once authenticated, it will use the access token to list the files in your root directory.</p>
                </div>
                
            </div>
        )
    }
    
}

export default Oauth