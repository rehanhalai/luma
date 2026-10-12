as mentioned in [[v2-canvas]] visual way, each map will have their own socket room where any player can join them

#### things to change on current version

- change the socket configs
- create socket room for each map
- a user should join any map and then only the room for that map be created if there is non
- if there is a session/room running, make the user join that room
- events to edit
  - join
    - check if there is already a room hosted
    - if yes, join the user to that room or create a new room and connect user
    - emit the message to himselft / all users in the map
  - movement
    - have to calculate boudnaries both client and server side
    - broadcast to only thie own room
  - left
    - broadcast the player left message
    - close the room if player <= 0
