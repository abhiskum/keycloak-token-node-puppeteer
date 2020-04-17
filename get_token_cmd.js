const express = require('express');
const request = require('request');
const urlencode = require('urlencode');
const PropertiesReader = require('properties-reader');
const prop = PropertiesReader('./app.properties');
const getProperty = (pty) => {return prop.get(pty);}
const capture_token = require('./capture_token.js');

const app = express();

const keycloak_url = getProperty("keycloak.url");
const server_port = getProperty("server.port");
const server_url = getProperty("server.protocol")+"://"+getProperty("server.host")+":"+server_port;
const client_id = process.env.CLIENT_ID || getProperty("client.id");
const client_secret = process.env.CLIENT_SECRET || getProperty("client.secret");

app.get('/auth', function(req, res) {
    let scope = 'openid';
    if(process.env.TOKEN_TYPE === 'offline'){
        scope = 'offline_access';
    }
    const redirect_uri = urlencode(server_url+"/auth.html?token_type="+process.env.TOKEN_TYPE);
    res.status(302).redirect(keycloak_url+"/auth?client_id="+client_id+"&redirect_uri="+redirect_uri+"&response_mode=fragment&response_type=code&scope="+scope)
})


app.get('/token', function(req, res) {
    const redirect_uri = server_url+"/auth.html?token_type="+process.env.TOKEN_TYPE;
    var options = {
        'method': 'POST',
        'strictSSL': false,
        'url': keycloak_url+'/token',
        'headers': {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        form: {
            'client_id': client_id,
            'client_secret': client_secret,
            'grant_type': 'authorization_code',
            'code': req.query.code,
            'redirect_uri': redirect_uri
        }
    };
    request(options, function(error, response) {
        if (error) throw new Error(error);
        const token = JSON.parse(response.body)
        let resObj = {};
        resObj[ req.query.token_type + "_token" ] = req.query.token_type === 'access' ? token.access_token : token.refresh_token;
        res.send(resObj);
    });
})


app.use(express.static('public'))

var server = app.listen(server_port, async () => {
    let local_auth_url = server_url+'/auth?token_type='+process.env.TOKEN_TYPE;
    tokenJson = await capture_token(local_auth_url, process.env.USER, process.env.PASS);
    console.log(tokenJson);
    server.close();
})
