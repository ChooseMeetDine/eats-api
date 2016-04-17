# Version v0.2.0 (2016-04-11)
## New Features
### Users
| Function | Action |
| --- | --- |
| Register new user | HTTP-POST to /users |
| Get all users | HTTP-GET /users |
| Get single user | HTTP-GET /users/:id |

### Restaurants
| Function | Action |
| --- | --- |
| Create restaurant | HTTP-POST to /restaurants |
| Get restaurants | HTTP-GET /restaurants |

### Polls
| Function | Action |
| --- | --- |
| Create poll | HTTP-POST to /polls |
| Get your polls | HTTP-GET /polls |
| Get single poll | HTTP-GET /polls/:id |
| Add restaurant to poll | HTTP-POST /polls/:id/restaurants |
| Vote in a poll | HTTP-POST /polls/:id/votes |

### Authentication
| Function | Action |
| --- | --- |
| Authenticate | HTTP-POST to /auth |
| Get token for anonymous usage | HTTP-GET /auth/anonymous |

### Realtime updates
Realtime updates to polls are available by using the poll-id as event identifier while using a web socket connection to the server

### Further documentation of current functions
Visit /docs for a complete documentation of the API in it's current state
