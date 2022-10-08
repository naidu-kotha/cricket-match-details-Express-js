

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


// Convert Player Details DBObject To Response Object
const convertPlayerDetailsDBObjectToResponseObject = (dbObject) => {
    return {
        playerId: dbObject.player_id,
        playerName: dbObject.player_name,
    };
};



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
});


// Update player by Player Id API
app.put("/players/:playerId/", async(request, response) => {
    const { playerId } = request.params;

    const { playerName } = request.body;

    const UpdatePlayerQuery = `
    UPDATE
      player_details
    SET
      player_name = '${playerName}'
    WHERE
      player_id = ${ playerId };`;

    await db.run(UpdatePlayerQuery);

    response.send("Player Details Updated");
});


// Get Matches by Match Id API
app.get("/matches/:matchId/", async(request, response) => {
    const { matchId } = request.params;

    const getMatchQuery = `
    SELECT
      match_id as matchId,
      match,
      year
    FROM
      match_details
    WHERE
      match_id = ${ matchId };`;
    
    const match = await db.get(getMatchQuery);

    response.send(match);
});


// Get All Matches of Player by Player Id API
app.get("/players/:playerId/matches/", async(request, response) => {
    const { playerId } = request.params;

    const getMatchesQuery = `
    SELECT
      match_details.match_id as matchId,
      match,
      year
    FROM
      match_details NATURAL
      JOIN player_match_score
    WHERE
      player_match_score.player_id = ${ playerId };`;

    const matchesArray = await db.all(getMatchesQuery);

    response.send(matchesArray);
});


// Get All Players in a Match API
app.get("/matches/:matchId/players", async(request, response) => {
    const { matchId } = request.params;

    const getPlayersOfMatchQuery = `
    SELECT
      *
    FROM
      player_details INNER
      JOIN player_match_score ON 
      player_details.player_id = player_match_score.player_id
    WHERE
      player_match_score.match_id = '${matchId}';`;

    const playersInMatchArray = await db.all(getPlayersOfMatchQuery);

    response.send(
        playersInMatchArray.map((player) => convertPlayerDetailsDBObjectToResponseObject(player))
    );
});


// Get Statistics of Player by Player Id
app.get("/players/:playerId/playerScores/", async(request, response) => {
    const { playerId } = request.params;

    const getPlayerStatisticsQuery = `
    SELECT
      player_details.player_id as playerId,
      player_name as playerName,
      SUM(score) as totalScore,
      SUM(fours) as totalFours,
      SUM(sixes) as totalSixes
    FROM
      player_match_score NATURAL JOIN player_details
    WHERE
      player_details.player_id = ${playerId};`;

    const playerStatistics = await db.get(getPlayerStatisticsQuery);

    response.send(playerStatistics);

});



module.exports = app;