# Garuda Game Forum API
The Garuda Game Forum API is an API that allows the user to do the following things:
- Register as user at Garuda Game Forum
- Login at Garuda Game Forum
- Refresh Access Token at Garuda Game Forum
- Logout from Garuda Game Forum
- Create a thread at Garuda Game Forum
- Create a comment at a thread at Garuda Game Forum
- Delete a comment from a thread at Garuda Game Forum
- View Detail of a thread at Garuda Game Forum
- Reply to a comment at a thread at Garuda Game Forum
- Delete a reply from a comment at Garuda Game Forum
- Like and Dislike a comment at Garuda Game Forum

Notes: 
- The Garuda Game Forum API uses postgresql as it's database and it has also implemented token based authentication using JWT. 
- The development of Garuda Game Forum API is implemented using clean architecture, where the source codes are divided into 4 layers:
  - **Entities:**
  The layer to keep data entities, which are used when the business needs to manage complex data structures.
  - **Use Case:**
  The layer for business logic flow.
  - **Interface Adapter:** 
  Mediator or liaison between the framework layer and the use case layer.
  - **Frameworks:**
  The outermost layer which is related to the framework.
- The Garuda Game Forum API have also implemented automation testing with 100% coverage using jest. The automation testing includes both unit testing for business logics in entities and use case layer and also integration test for database interaction with repository.

## Live Demo
https://jordy-forum-api.herokuapp.com/  

Note:  
This is just the base url for the api deployed at heroku. As for the front end application, it will be developed in the future.
# Setup
## Installation
Run the following commands in the terminal.
```
  git clone https://github.com/jordyf15/garuda-game-forum-api.git
  npm install
  # After setting up database in postgressql and provided the required environment variables
  npm run migrate up
  npm run migrate:test up
```
## Scripts
- To start on production enviroment use `npm run start`
- To start on development environment use `npm run start:dev`
- To run automation test use `npm run test:watch`
- To do migration for production database use `npm run migrate <migrate command>`
- To do migration for testing database use `npm run migrate:test <migrate command>`

## Environment Variables
These variables need to be provided in a `.env` file in the root folder.
- **HOST**: The host of the server.
- **PORT**: The port of the server.
- **PGHOST**: The host for the production postgres database.
- **PGUSER**: The name of the user used to access the production postgres database.
- **PGDATABASE**: The name of the production postgres database.
- **PGPASSWORD**: The password for the user used to access the production postgres database.
- **PGPORT**: The port of the production postgres database.
- **PGHOST_TEST**: The host for the testing postgres database.
- **PGUSER_TEST**: The name of the user used to access the testing postgres database.
- **PGDATABASE_TEST**: The name of the testing postgres database.
- **PGPASSWORD_TEST**: The password for the user used to access the testing postgres database.
- **PGPORT_TEST**: The port of the testing postgres database.

- **ACCESS_TOKEN_KEY**: The key that will be used to make the access token for authentication
- **REFRESH_TOKEN_KEY**: The key that will be used to make the refresh token which are used for refreshing expired access token
- **ACCESS_TOKEN_AGE**: The age of access token before they expired in seconds.
  
Other than environment variables, a config files is also needed, it should be located in config/database folder with the name test.json. Below is the content of the config files:
```
{
  "user": The name of the user used to access the testing postgres database,
  "password": The password for the user used to access the testing postgres database,
  "host": The host for the testing postgres database,
  "port": The port of the testing postgres database,
  "database": The name of the testing postgres database
}

```

## Endpoint details
1. Register
- Route: `{base_url}/users`
- Method: POST
- Request Body: 
```
{
  "username": string,
  "password": string,
  "fullname": string
}
```
- Response (if request is successful): 
  - Status Code: 201
  - Response Body: 
```
{
  "status": "success",
  "data": {
      "addedUser": {
          "id": string,
          "username": string,
          "fullname": string
      }
  }
}
```
2. Login
- Route: `{base_url}/authentications`
- Method: POST
- Request Body: 
```
{
  "username": string,
  "password": string
}
```
- Response (if request is successful):
  - Status Code: 201
  - Response Body: 
```
{
    "status": "success",
    "data": {
        "accessToken": string,
        "refreshToken": string
    }
}
```
3. Refresh Access Token
- Route: `{base_url}/authentications`
- Method: PUT
- Request Body: 
```
{
  "refreshToken": string
}
```
- Response (if request is successful):
  - Status Code: 200
  - Response Body:
```
{
  "status": "success",
  "data": {
      "accessToken": string
  }
}
```
4. Logout
- Route: `{base_url}/authentications`
- Method: DELETE
- Request Body:
```
{
  "refreshToken": string
}
```
- Response (if request is successful):
  - Status Code: 200
  - Response Body:
```
{
  "status": "success"
}
```
5. Get Thread Detail
- Route: `{base_url}/threads/{threadId}`
- Method: GET
- Request Body: -
- Response (if request is successful):
  - Status Code: 200
  - Response Body:
```
{
  "status": "success",
  "data": {
      "thread": {
          "id": string,
          "title": string,
          "body": string,
          "date": string,
          "username": string,
          "comments": [
              {
                  "id": string,
                  "username": string,
                  "date": string,
                  "replies": [
                      {
                          "id": string,
                          "content": string,
                          "date": string,
                          "username": string
                      }
                  ],
                  "content": string,
                  "likeCount": 1
              },
              {
                  "id": string,
                  "username": string,
                  "date": string,
                  "replies": [],
                  "content": string,
                  "likeCount": number
              }
          ]
      }
  }
}
```

**Important Note:**
The following resource endpoints will require a valid access token in the authorization header. So you need to login first to obtained the access token and put it in the authorization header like this:
```
Authorization: Bearer {access_token}
```
6. Create Thread
- Route: `{base_url}/threads`
- Method: ``POST
- Request Body:
```
{
  "title": string,
  "body": string
}
```
- Response (if request is successful):
  - Status Code: 201 
  - Response Body:
```
{
  "status": "success",
  "data": {
      "addedThread": {
          "id": string,
          "title": string,
          "owner": string
      }
  }
}
```
7. Add comment on a thread
- Route: `{base_url}/threads/{threadId}/comments`
- Method: POST
- Request Body:
```
{
  "content": string
}
```
- Response (if request is successful):
  - Status Code: 201
  - Response Body:
```
{
  "status": "success",
  "data": {
      "addedComment": {
          "id": string,
          "content": string,
          "owner": string
      }
  }
}
```
8. Delete Comment on a thread
- Route: `{base_url}/threads/{threadId}/comments/{commentId}`
- Method: DELETE 
- Request Body: -
- Response (if request is successful):
  - Status Code: 200
  - Response Body:
```
{
  "status": "success"
}
```
9. Add Reply to a Comment
- Route: `{base_url}/threads/{threadId}/comments/{commentId}/replies`
- Method: POST
- Request Body:
```
{
  "content": string
}
```
- Response (if request is successful):
  - Status Code: 201
  - Response Body:
```
{
  "status": "success",
  "data": {
      "addedReply": {
          "id": string,
          "content": string,
          "owner": string
      }
  }
}
```
10. Delete Reply in a Comment
- Route: `{base_url}/threads/{threadId}/comments/{commentId}/replies/{replyId}`
- Method: DELETE
- Request Body: -
- Response (if request is successful):
  - Status Code: 200
  - Response Body:
```
{
  "status": "success"
}
```
11. Like and Dislike comment
- Route: `{base_url}/threads/{threadId}/comments/{commentId}/likes`
- Method: PUT
- Request Body: -
- Response (if request is successful):
  - Status Code: 200
  - Response Body:
```
{
  "status": "success"
}
```
