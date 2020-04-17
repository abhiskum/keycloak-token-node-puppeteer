Command line and web server approch to fetch tokens from Keycloak server. 

High level flow
            Open headless browser - puppeteer
            Open /auth url in the headless browser 
            Wait for login screen
            Enter credentials and submit form
            Keycloak will validate credentials 
            Redirect to redirect uri i.e. /auth.html
            auth.html page will read code from url fragment and call /token endpoint
            /token endpoint will fetch actual token from from SSO using code and return in response
            Wait for token response from /token endpoint 
            Read token value from browser 
            Write token in response body and close browser 

# app.properties             
    server.protocol=http
    server.host=localhost
    server.port=3000
    keycloak.url=
    client.id=
    client.secret=
 
# Server mode

## Command to start server
   node get_token_server.js

## Fetch token using API
### Using browser - /auth  
### Using CURL -  POST /token 
    curl --location --request POST 'http://localhost:3000/token' \
         --header 'Content-Type: application/x-www-form-urlencoded' \
         --data-urlencode 'username=<username>' \
         --data-urlencode 'password=<password>' \
         --data-urlencode 'token_type=<access/refresh/offline>' 
  
# Command line mode

## Command to get token
USER=<username> PASS=<password> TOKEN_TYPE=<access/refresh/offline> node get_token_cmd.js

## High level command line flow
    Start web server with endpoints 
        /auth
        /auth.html
        /token
    Open headless browser - puppeteer
    Open /auth url in the headless browser 
    Wait for login screen
    Enter credentials and submit form
        Keycloak will validate credentials 
        Redirect to redirect uri i.e. /auth.html
        auth.html page will read code from url fragment and call /token endpoint
        /token endpoint will fetch actual token from from SSO using code and return in response
    Wait for token response from /token endpoint 
    Read token value from browser 
    Print token on console and close browser