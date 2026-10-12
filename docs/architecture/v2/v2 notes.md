##### **_date : 18th August, 2026_**

just completed the first version of the luma. where we added some intial featuers such as

- other players real-time location via web socket.
- character avtar using sprite sheet
- a custom made map where the user can roam with real collision physics

##### now for the v2 here is the list of featuers that we are going to implement.

- main menu to choose the map from (Lobby)
- store multiple maps on the server side
- choose avatar before starting the game
- enter a username before joining the room and use it as name tag through entire session
- implement db to store data such as avatar, maps

an visual architecture will be designed in the [[v2-canvas]].

##### **_date: 23rd September,2026_**

its been a long since i last opened this project, well i was working on this SIH project called Locus. currently got some free time so thought lets do something that i actually love :)

well know i don't have that azure VPS that i used to, for hosting stuff on the server. and i don't have any desire to buy one for this. will have to look for some options specially for hosting initial things such as maps, avatars/sprites

let's change our root from VPS based development to local first for now, once we might have something to show we will look for some hosting options. till then, FIGHT REHAN!!!

##### **_date: 28th September,2026_**

got busy again, lets start with splitting the backend and making it ready for multi room feature.

##### **_date: 29th September,2026_**

- changed the ORM from drizzle to Prisma for better simplicity and resources on the internet.
- found a new way to break down taks/goals into smaller checkpoints for better planning!
- added maps,avatars with seed file for easier setups
  - turned avatar/sprite images into webp
  - kept the assets on client side instead of hosting it somewhere.

##### **_date: 30th September,2026_**

- moved the db/types from backend to a shared package for other apps/package to use the types from it.

##### **_date: 1st oct,2026_**

- completed the multi room featuer and the avatar selection on luma
- name tags for each palyer
- create a bot simulation using ai to generate real player like traffic on the rooms.
  - was good but needed some tweaks.
- while doing the bot simulation, found out about lack of collision detetion on the server side.
  - moved the map json data from client side to the db using the postgre's json type
  - added the collision detection in server to have server side collision detection check

##### **_date: 2nd oct,2026_**

- learned about invariants, assert in TS.
- reduced the find all room response payload and extracted the map details to saperate module.
- [[100-200 players]] : did some stress testing and made a report with things to improve.
