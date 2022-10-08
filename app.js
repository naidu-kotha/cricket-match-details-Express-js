const express = require("express");
const app = express();
app.use(express.json());

const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

const path = require("path");
const dbPath = path.join(__dirname, "cricketMatchDetails.db");

let db = null;


// Initialization
const initializeDbAndServer = async() => {
    try {
        db = await open({
            filename: dbPath,
            driver: sqlite3.Database,
        });
        app.listen(3000, () => {
            console.log("Server Running at http://localhost:3000");
        });
    } catch(e) {
        console.log(`DBError: ${e.message}`);
    };
};

initializeDbAndServer();

// Get All Players API
app.get("/players/", async(request, response) => {
    const getPlayersQuery = `
    SELECT
      player_id as playerId,
      player_name as playerName
    FROM
      player_details;`;

    const players = await db.all(getPlayersQuery);

    response.send(players);
});

// Get Player by Player Id API
app.get("/players/:playerId/", async(request, response) => {
    const { playerId } = request.params;

    const getPlayerQuery = `
    SELECT
      player_id as playerId,
      player_name as playerName
    FROM
      player_details
    WHERE
      player_id = ${playerId};`;
    
    const player = await db.get(getPlayerQuery);

    response.send(player);
})

module.exports = app;