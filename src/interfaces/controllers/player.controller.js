export function createPlayerController(playerUseCases) {
    return {
  
      async register({ body }) {
        const result = await playerUseCases.register(body);
  
        return created(result);
      },
  
      async login({ body }) {
        const result = await playerUseCases.login(body);
  
        return ok(result);
      },
  
      // GET /players
      async getPlayers() {
        const result = await playerUseCases.getAllPlayers();
  
        return ok(result);
      },
  
      // GET /players/:id
      async getPlayerById({ params }) {
        const result = await playerUseCases.getPlayerById(params.playerId);
  
        return ok(result);
      },
  
      // GET /me
      async getMe({ user }) {
        if (!user) {
          throw new Error("Unauthorized");
        }
      
        const result = await playerUseCases.getPlayerById(user.playerId);
      
        return ok(result);
      },
  
      // GET /admin/players/list
      async listPlayers() {
        const result = await playerUseCases.getAllPlayers();
  
        return ok(result);
      },
  
      // PATCH /admin/players/:playerId/avatar
      async updatePlayerAvatar({ params, body }) {
        const { avatarUrl } = body;
  
        const result = await playerUseCases.updatePlayerAvatar(
          params.playerId,
          avatarUrl
        );
  
        return ok(result);
      },
  
      // DELETE /admin/players/delete/:playerId
      async deletePlayer({ params }) {
        const result = await playerUseCases.deletePlayer(params.playerId);
  
        return ok(result);
      }
    };
  }
  
  function ok(data) {
    return {
      statusCode: 200,
      body: { data },
    };
  }
  
  function created(data) {
    return {
      statusCode: 201,
      body: { data },
    };
  }