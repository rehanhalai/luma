features that the v1 will have

- spawn character at randome place when they joing the room (there will be only a single global room for now)
- move around the map.
- collision detection for map boundry

first thing that we will need is a web socket connection.

#### web socket events

- on connection
  - take a temp username from the user and create a connection
  - spawn player at random cordinates (on a valid location)
  - emit a event to broadcast the cordinates,avatar, name of the new player
- on movement
  - verify and emit the movement event to broadcase the new cordinates of the player with other players
- on disconnection
  - remove the player avatar/character from the map
  - emit a event to broadcase the disconnection message and to remove the disconnected player's avatar to disappear

**_date : 17th August 2026_**

the v1 is successfull and i have also added custom avatar with walking animation using a sprite sheet from pinterest :>
and also emitting the movements for others to animate and did some code splitting because the MainGame class was already hitting ~200 lines of code!

now lets do some map things.
for maps, i have found out that we can create custom maps via tilemaps editors to create a custom tilemap (ex: Tiled). and we are gonna create one :>. though we have downloaded a simple tileset to create a custom tilemap!

**_date: 18h August 2026_**

THE MAP IS DONE!!
i have created a simple tilemap using the tiled app. :)

![[Pasted image 20260818200740.png]]
