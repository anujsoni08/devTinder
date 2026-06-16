#DevTinder APIs

## authRouter

- POST /signup
- POST /login
- POST /logout

## profileRouter

- GET /profile/view
- PATCH /profile/edit
- PATCH /profile/password

## connectionRequestRouter

- POST /request/send/:status/:userId
  Status: ignored, interested

- POST /request/review/:status/:requestId
  Status: accepted, rejected

## userRouter

- GET /user/connections
- GET /user/requests/received
- GET /user/feed
