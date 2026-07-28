let io = null;

export function setRealtimeServer(socketServer) {
  io = socketServer;
}

export function emitRealtimeEvent(event) {
  if (!event || !io) {
    return false;
  }

  io.to(event.room).emit(event.name, event.payload);
  return true;
}
