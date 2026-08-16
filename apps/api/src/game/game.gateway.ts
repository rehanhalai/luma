import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import {Server, Socket} from "socket.io"

export interface Player {
  id: number;
  name : string;  
  x:number;
  y:number;
}
@WebSocketGateway()
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect{
  @WebSocketServer()
  server!: Server;
  
  private players = new Map<string,Player>()
  private readonly Max_Width = 800;
  private readonly Max_Height = 600;

  // on connection
 handleConnection(client: Socket, data : {name: string}) {
  console.log(`player ${client.id} connected to socket server`)

  const newPlayer: Player = {
    id: Number(client.id),
    name : data.name,
    x: Math.floor(Math.random() * (this.Max_Width -100 )),
    y:Math.floor(Math.random() * (this.Max_Height -100 ))
  }

  this.players.set(client.id,newPlayer)
  client.emit("Players", Array.from(this.players.values()))
  client.broadcast.emit("playerJoined",newPlayer)
 } 

  // on move
  @SubscribeMessage("movement")
  handleMovement(
    @ConnectedSocket() client : Socket,
    @MessageBody() data :{x: number, y : number}
  ) {
    if (this.players.get(client.id)){
      const validX = Math.max(0,Math.min(this.Max_Width , data.x))
      const validY = Math.max(0,Math.min(this.Max_Height , data.y))
      
      client.broadcast.emit('playerMoved', {
        id: client.id,
        x: validX,
        y:validY
      });
    }
  }

  // on disconnection
  handleDisconnect(client: Socket) {
    this.players.delete(client.id)
    this.server.emit('playerLeft',client.id)
  }
}
