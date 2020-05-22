import React, { Component } from 'react';
import * as $ from 'jquery'
require('isomorphic-fetch')

let Token = process.env.REACT_APP_DBX_TOKEN
var Dropbox = require('dropbox').Dropbox;



class Oauth extends Component{

    componentDidMount() {
        // this.props.readFromLocalStorage("", 25)
    }

    dropboxAuthenticate = () =>{
        console.log('authenticating...')
        console.log(process.env)
        var dbx = new Dropbox({fetch: fetch });
        dbx.setClientId(process.env.REACT_APP_DBX_CLIENT_ID)
        console.log(dbx.getAuthenticationUrl(process.env.REACT_APP_DBX_REDIRECT_URI))
            // .then(function(response) {
            //     console.log(response);
            //   })
            //   .catch(function(error) {
            //     console.log(error);
            //   });
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