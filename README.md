## Keycloak token generation w/o browser using NodeJs and Puppeteer  
  Command line and web server approch to fetch tokens from Keycloak server. 

### High level flow   
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

### Add app.properties with following properties            
    server.protocol=http
    server.host=localhost
    server.port=3000
    keycloak.url=http://<host>:<port>/auth/realms/<realm>/protocol/openid-connect
    client.id=<client_id>
    client.secret=<client_secret>
 
### Running in web server mode
   * Command to start server
      
       node get_token_server.js

   * Fetch token using API         
      Using browser - /auth  
      Using CURL -  POST /token 
              
              curl --location --request POST 'http://localhost:3000/token' \
                   --header 'Content-Type: application/x-www-form-urlencoded' \
                   --data-urlencode 'username=<username>' \
                   --data-urlencode 'password=<password>' \
                   --data-urlencode 'token_type=<access/refresh/offline>' 

               curl --location --request POST 'http://localhost:3000/token' \
                    --header 'Content-Type: application/x-www-form-urlencoded' \
                    --data-urlencode 'username=<username>' \
                    --data-urlencode 'password=<password>' \
                    --data-urlencode 'client_id=backend-service' \
                    --data-urlencode 'client_secret=secret' \
                    --data-urlencode 'token_type=<access/refresh/offline>' 
  
### Command line mode
   * Command to get token
   
               USER=<username> PASS=<password> TOKEN_TYPE=<access/refresh/offline> node get_token_cmd.js
               USER=<username> PASS=<password> CLIENT_ID=<client_id> CLIENT_SECRET=<client_secret> TOKEN_TYPE=<access/refresh/offline> node get_token_cmd.js
