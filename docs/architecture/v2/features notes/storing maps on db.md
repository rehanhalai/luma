#### how we are storing maps in the current version!

- a png with tiles and a json mapping the entire tilemap with different layers and array of indexes

things to handle in total

- a tiles png
- a json file which is the layout of the entire map

since the postgres can store raw json or even JSONB (jason binary) which is more faster and better option for this usecase!

and the tile map...

- we can use our own vps to host these images and create a custom urls like,
  - ex: luma.rehanhalai.com/sprites/boy.webp

with this we can have multiple maps stored on db and server to be accessed on the main menu and let the players play on those maps :>

the visual plan and flow is designed on the [[v2-canvas]]

**_initial planning is going well so far for now_**
