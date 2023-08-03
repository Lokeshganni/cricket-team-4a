const express = require("express");
const app = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;
const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at PORT 3000");
    });
  } catch (e) {
    console.log(`DB ERROR: ${e.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

// API 1 to get list of all players

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

app.get("/players/", async (req, res) => {
  const getPlayersQuery = `
    SELECT * FROM cricket_team;`;
  const playersArray = await db.all(getPlayersQuery);
  res.send(
    playersArray.map((eachObject) =>
      convertDbObjectToResponseObject(eachObject)
    )
  );
});

//API 2 to post player details

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  //   console.log(playerDetails);
  const { playerName, jerseyNumber, role } = playerDetails;
  const addPlayerQuery = `
  INSERT INTO cricket_team(player_name,jersey_number,role)
  VALUES(
      '${playerName}',
      ${jerseyNumber},
      '${role}');`;
  const addPlayerRes = await db.run(addPlayerQuery);
  const playerId = addPlayerRes.lastID;
  response.send("Player Added to Team");
});

// API 3 to get a single player details

app.get("/players/:playerId", async (req, res) => {
  const { playerId } = req.params;
  const getPlayerQuery = `
    SELECT * FROM cricket_team WHERE player_id=${playerId};`;
  const playerArray = await db.get(getPlayerQuery);
  res.send(convertDbObjectToResponseObject(playerArray));
});

// API 4 to update player details

app.put("/players/:playerId", async (req, res) => {
  const { playerId } = req.params;
  const playerDetailsToUpdate = req.body;
  console.log(playerDetailsToUpdate);
  const { playerName, jerseyNumber, role } = playerDetailsToUpdate;
  const updatePlayerQuery = `
    UPDATE cricket_team
    SET 
        player_name='${playerName}',
        jersey_number=${jerseyNumber},
        role='${role}'
    WHERE player_id=${playerId};`;
  await db.run(updatePlayerQuery);
  res.send("Player Details Updated");
});

// API 5 to delete player

app.delete("/players/:playerId", async (req, res) => {
  const { playerId } = req.params;
  const deletePlayerQuery = `
    DELETE FROM cricket_team WHERE player_id=${playerId};`;
  await db.run(deletePlayerQuery);
  res.send("Player Removed");
});

module.exports = app;
