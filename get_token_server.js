const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const urlencode = require('urlencode');
const PropertiesReader = require('properties-reader');
const prop = PropertiesReader('./app.properties');
const getProperty = (pty) => {return prop.get(pty);}
const capture_token = require(getProperty("capture.token.js.file.path"));

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

const keycloak_url = getProperty("keycloak.url");
const server_port = getProperty("server.port");
const server_url = getProperty("server.protocol")+"://"+getProperty("server.host")+":"+server_port;

app.get('/auth', function(req, res) {
    const token_type = req.query.token_type || 'access';
    const client_id = req.query.client_id || getProperty("client.id");
    const client_secret = req.query.client_secret || getProperty("client.secret");
    let scope = 'openid';
    if(token_type === 'offline'){
        scope = 'offline_access';
    }
    const redirect_uri = urlencode(server_url+"/auth.html?token_type="+token_type+"&client_id="+client_id+"&client_secret="+client_secret);
    res.status(302).redirect(keycloak_url+"/auth?client_id="+client_id+"&redirect_uri="+redirect_uri+"&response_mode=fragment&response_type=code&scope="+scope)
})

app.get('/token', function(req, res) {
    const client_id = req.query.client_id;
    const client_secret = req.query.client_secret;
    const redirect_uri = server_url+"/auth.html?token_type="+req.query.token_type+"&client_id="+client_id+"&client_secret="+client_secret;
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
        const token = JSON.parse(response.body);
        let resObj = {};
        resObj[ req.query.token_type + "_token" ] = req.query.token_type === 'access' ? token.access_token : token.refresh_token;
        res.send(resObj);
    });
})

app.post('/token', function(req, res) {
   
    const client_id = req.body.client_id || getProperty("client.id");
    const client_secret = req.body.client_secret || getProperty("client.secret");
    const token_type = req.body.token_type;
    
    const url = server_url+'/auth?token_type='+token_type+'&client_id='+client_id+"&client_secret="+client_secret;
    getToken(res, url, req.body.username, req.body.password);
   
})

async function getToken (res, url, username, password) {
    tokenJson = await capture_token(url, username, password);
    res.send(tokenJson);
}

app.use(express.static('public'))

var server = app.listen(server_port, function () {
  console.log("Server listening on "+ server_url);
});


