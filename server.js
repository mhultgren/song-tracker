const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { json } = require('body-parser');

const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://myles:comp355@cluster0.oaecz.mongodb.net/<dbname>?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useUnifiedTopology: true });

const app = express();
const jsonParser = bodyParser.json();
app.use(cors());

let database = null;
let userCollection = null;
let songCollection = null;
let playlistCollection = null;

async function connectDB() {
    await client.connect();
    database = client.db("music");
    
    userCollection = database.collection("users");
    songCollection = database.collection("songs");
    playlistCollection = database.collection("playlists");
    
    console.log("Connected!");
}

connectDB();

// retrieve user information by username
// including songs in library as well as basic playlist information
async function getUserByUsername(req, res) {
    const username = req.params.username;
    
    const userCursor = await userCollection.aggregate([
        {
            $match: 
            {
                _id: username
            }
        },
        {
            $lookup: 
            {
                from: "songs",
                localField: "songs",
                foreignField: "_id",
                as: "userLibrary"
            }
        },
        {
            $lookup:
            {
                from: "songs",
                localField: "topFive",
                foreignField: "_id",
                as: "userTopFive"
            }
        },
        {
            $lookup:
            {
                from: "playlists",
                localField: "playlists",
                foreignField: "_id",
                as: "userPlaylists"
            }
        },
        {
            $project: 
            {
                _id: 1,
                followedUsers: 1,
                userLibrary: 1,
                userTopFive: 1,
                "userPlaylists.name": 1,
                "userPlaylists.playlistUser": 1
            }
        }
    ]);

    let user = await userCursor.toArray();

    const response = user;
    res.json(response);
}

app.get('/users/:username', getUserByUsername);

// similar to above function,
// retrieve user info using email
async function getUserByEmail(req, res) {
    const email = req.params.email;

    const userCursor = await userCollection.aggregate([
        {
            $match: 
            {
                email: email
            }
        },
        {
            $lookup: 
            {
                from: "songs",
                localField: "songs",
                foreignField: "_id",
                as: "userLibrary"
            }
        },
        {
            $lookup:
            {
                from: "songs",
                localField: "topFive",
                foreignField: "_id",
                as: "userTopFive"
            }
        },
        {
            $lookup:
            {
                from: "playlists",
                localField: "playlists",
                foreignField: "_id",
                as: "userPlaylists"
            }
        },
        {
            $project: 
            {
                _id: 1,
                followedUsers: 1,
                userLibrary: 1,
                userTopFive: 1,
                "userPlaylists.name": 1,
                "userPlaylists.playlistUser": 1
            }
        }
    ]);

    let user = await userCursor.toArray();

    const response = user;
    res.json(response);
}

app.get('/emails/:email', getUserByEmail);

// retrieve song(s) by song info
// parameters are: title, artist, album, genre
async function getSongBySongInfo(req, res) {
    const songTitle = req.query.title;
    const songArtist = req.query.artist;
    const songAlbum = req.query.album;
    const songGenre = req.query.genre;

    const query = {};

    if (songTitle !== undefined) query["title"] = {$regex: new RegExp(`^${songTitle}$`, "i")};
    if (songArtist !== undefined) query["artist"] = {$regex: new RegExp(`^${songArtist}$`, "i")};
    if (songAlbum !== undefined) query["album"] = {$regex: new RegExp(`^${songAlbum}$`, "i")};
    if (songGenre !== undefined) query["genre"] = {$regex: new RegExp(`^${songGenre}$`, "i")};

    let songsCursor = await songCollection.find(query);
    let songs = await songsCursor.toArray();

    const response = songs;
    res.json(response);
}

app.get('/song', getSongBySongInfo);

// get playlist information
// parameters are: name, username
async function getPlaylistInfo(req, res) {
    const playlistName = req.query.name;
    const userID = req.query.username;

    let playlistsCursor = await playlistCollection.aggregate([
        {
            $match:
            {
                name: playlistName,
                playlistUser: userID
            }
        },
        {
            $lookup:
            {
                from: "songs",
                localField: "songs",
                foreignField: "_id",
                as: "playlistSongs"
            }
        },
        {
            $project:
            {
                playlistSongs: 1
            }
        }
    ]);
    let playlist = await playlistsCursor.toArray();

    const response = playlist;
    res.json(response);
}

app.get('/playlist', getPlaylistInfo);

// post request to add song to database
// pass song info through body
async function addSong(req, res) {
    const songTitle = req.body.title;
    const songArtist = req.body.artist;
    const songAlbum = req.body.album;
    const songGenre = req.body.genre;

    if (songTitle === undefined || songArtist === undefined || songAlbum === undefined || songGenre === undefined) {
        res.json("Missing information. Please try again.");
        return;
    }

    const result = await songCollection.insertOne({
        title: songTitle,
        artist: songArtist,
        album: songAlbum,
        genre: songGenre
    });

    const response = [
        {insertedId: result.insertedId}
    ];

    res.json(response);
}

app.post('/addSong', jsonParser, addSong);

// create playlist using post request
// send playlist info through body
async function createPlaylist(req, res) {
    const playlistName = req.body.name;
    const playlistUser = req.body.username;

    if (playlistName === undefined || playlistUser === undefined) {
        res.json("Missing information. Please try again.")
        return;
    }
    
    // check if user already has playlist of same name
    const playlistQuery = {};
    playlistQuery['name'] = playlistName;
    playlistQuery['playlistUser'] = playlistUser;

    let playlistsCursor = await playlistCollection.find(playlistQuery);
    let playlists = await playlistsCursor.toArray();

    if (playlists.length == 0) {
        const result = await playlistCollection.insertOne({
            name: playlistName,
            playlistUser: playlistUser,
            songs: []
        });

        const response = [
            {insertedId: result.insertedId}
        ];

        const filter = {_id: playlistUser};
        const updatedDocument = {
            $push:{
                playlists: {
                    $each: [result.insertedId]
                }
            }
        };

        const userResult = userCollection.updateOne(filter, updatedDocument);

        res.json(response);
    } else {
        res.json("User cannot create two playlists of same name.");
    }
}

app.post('/addPlaylist', jsonParser, createPlaylist);

// add song to playlist using post request
// send playlist info through body
// as well as song info (in dictionary)
async function addToPlaylist(req, res) {
    const playlistName = req.body.name;
    const playlistUser = req.body.user;
    const songTitle = req.body.title;
    const songArtist = req.body.artist;
    const songAlbum = req.body.album;
    const songGenre = req.body.genre;

    if (playlistName === undefined || playlistUser === undefined || songTitle === undefined || songArtist === undefined || songAlbum === undefined || songGenre === undefined) {
        res.json("Missing information. Please try again.");
        return;
    }

    // check to see if song exists
    const songQuery = {};
    songQuery['title'] = {$regex: new RegExp(`^${songTitle}$`, "i")};
    songQuery['artist'] = {$regex: new RegExp(`^${songArtist}$`, "i")};
    songQuery['album'] = {$regex: new RegExp(`^${songAlbum}$`, "i")};

    let songsCursor = await songCollection.find(songQuery);
    let songs = await songsCursor.toArray();

    // if song exists,
    // get song id and add song id to playlist
    if (songs.length == 1) {
        let songID = songs[0]['_id'];
        
        const filter = {
            name: playlistName,
            playlistUser: playlistUser
        };

        const updatedDocument = {
            $push:{
                songs: {
                    $each: [songID]
                }
            }
        };

        const result = await playlistCollection.updateOne(filter, updatedDocument);

        const response = [
            {matchedCount: result.matchedCount},
            {modifiedCount: result.modifiedCount}
        ];

        res.json(response);

    } else {
        // if song does not exist,
        // add song to database and add id to playlist

        const songResult = await songCollection.insertOne({
            title: songTitle,
            artist: songArtist,
            album: songAlbum,
            genre: songGenre
        });

        let songID = songResult.insertedId;
        
        const filter = {
            name: playlistName,
            playlistUser: playlistUser
        };

        const updatedDocument = {
            $push:{
                songs: {
                    $each: [songID]
                }
            }
        };

        const result = await playlistCollection.updateOne(filter, updatedDocument);

        const response = [
            {matchedCount: result.matchedCount},
            {modifiedCount: result.modifiedCount}
        ];

        res.json(response);
    }
}

app.post('/addToPlaylist', jsonParser, addToPlaylist);

async function addToTopFive(req, res) {
    const userID = req.body.userID;
    const songTitle = req.body.title;
    const songArtist = req.body.artist;
    const songAlbum = req.body.album;
    const songGenre = req.body.genre;

    if (userID === undefined || songTitle === undefined || songArtist === undefined || songAlbum === undefined || songGenre === undefined) {
        res.json("Missing information. Please try again.");
        return;
    }

    // check to see if song exists
    const songQuery = {};
    songQuery['title'] = {$regex: new RegExp(`^${songTitle}$`, "i")};
    songQuery['artist'] = {$regex: new RegExp(`^${songArtist}$`, "i")};
    songQuery['album'] = {$regex: new RegExp(`^${songAlbum}$`, "i")};

    let songsCursor = await songCollection.find(songQuery);
    let songs = await songsCursor.toArray();

    // if song exists,
    // get song id and add song id to playlist
    if (songs.length == 1) {
        let songID = songs[0]['_id'];
        
        const filter = {
            _id: userID
        };

        const updatedDocument = {
            $push:{
                topFive: {
                    $each: [songID]
                }
            }
        };

        const result = await userCollection.updateOne(filter, updatedDocument);

        const response = [
            {matchedCount: result.matchedCount},
            {modifiedCount: result.modifiedCount}
        ];

        res.json(response);

    } else {
        // if song does not exist,
        // add song to database and add id to playlist

        const songResult = await songCollection.insertOne({
            title: songTitle,
            artist: songArtist,
            album: songAlbum,
            genre: songGenre
        });

        let songID = songResult.insertedId;
        
        const filter = {
            _id: userID
        };

        const updatedDocument = {
            $push:{
                topFive: {
                    $each: [songID]
                }
            }
        };

        const result = await userCollection.updateOne(filter, updatedDocument);

        const response = [
            {matchedCount: result.matchedCount},
            {modifiedCount: result.modifiedCount}
        ];

        res.json(response);
    }
}

app.post('/addToTopFive', jsonParser, addToTopFive);

async function removeFromTopFive(req, res) {
    const userID = req.body.userID;
    const songTitle = req.body.title;
    const songArtist = req.body.artist;
    const songAlbum = req.body.album;
    const songGenre = req.body.genre;

    if (userID === undefined || songTitle === undefined || songArtist === undefined || songAlbum === undefined || songGenre === undefined) {
        res.json("Missing information. Please try again.");
        return;
    }

    const songQuery = {};
    songQuery['title'] = songTitle;
    songQuery['artist'] = songArtist;
    songQuery['album'] = songAlbum;
    songQuery['genre'] = songGenre;

    let songsCursor = await songCollection.find(songQuery);
    let songs = await songsCursor.toArray();
    let songID = songs[0]['_id'];

    const filter = {
        _id: userID
    };

    const updatedDocument = {
        $pull: {
            topFive: songID
        }
    };

    const result = await userCollection.updateOne(filter, updatedDocument);

    const response = [
        {matchedCount: result.matchedCount},
        {modifiedCount: result.modifiedCount}
    ];

    res.json(response);
}

app.post('/removeFromTopFive', jsonParser, removeFromTopFive);

async function addToLibrary(req, res) {
    const userID = req.body.userID;
    const songTitle = req.body.title;
    const songArtist = req.body.artist;
    const songAlbum = req.body.album;
    const songGenre = req.body.genre;

    if (userID === undefined || songTitle === undefined || songArtist === undefined || songAlbum === undefined || songGenre === undefined) {
        res.json("Missing information. Please try again.");
        return;
    }

    // check to see if song exists
    const songQuery = {};
    songQuery['title'] = {$regex: new RegExp(`^${songTitle}$`, "i")};
    songQuery['artist'] = {$regex: new RegExp(`^${songArtist}$`, "i")};
    songQuery['album'] = {$regex: new RegExp(`^${songAlbum}$`, "i")};

    let songsCursor = await songCollection.find(songQuery);
    let songs = await songsCursor.toArray();

    if (songs.length === 1) {
        let songID = songs[0]['_id'];
        
        const filter = {
            _id: userID
        };

        const updatedDocument = {
            $push:{
                songs: {
                    $each: [songID]
                }
            }
        };

        const result = await userCollection.updateOne(filter, updatedDocument);

        const response = [
            {matchedCount: result.matchedCount},
            {modifiedCount: result.modifiedCount}
        ];

        res.json(response);
    } else {
        const songResult = await songCollection.insertOne({
            title: songTitle,
            artist: songArtist,
            album: songAlbum,
            genre: songGenre
        });

        let songID = songResult.insertedId;
        
        const filter = {
            _id: userID
        };

        const updatedDocument = {
            $push:{
                songs: {
                    $each: [songID]
                }
            }
        };

        const result = await userCollection.updateOne(filter, updatedDocument);

        const response = [
            {matchedCount: result.matchedCount},
            {modifiedCount: result.modifiedCount}
        ];

        res.json(response);
    }
}

app.post('/addToLibrary', jsonParser, addToLibrary);

// add user using post request
// send userID and email through body
async function addUser(req, res) {
    const userID = req.body.userID;
    const email = req.body.email;
    
    if (userID === undefined || email === undefined) {
        res.json("Missing information. Please try again.");
        return;
    }

    const result = await userCollection.insertOne({
        _id: userID,
        email: email,
        songs: [],
        topFive: [],
        playlists: [],
        followedUsers: []
    });

    const response = [
        {insertedId: result.insertedId}
    ];

    res.json(response);
}

app.post('/addUser', jsonParser, addUser);

// add followed user's id to main user's
// followedUsers array
async function followUser(req, res) {
    const mainUserID = req.body.mainUserID;
    const followedUserID = req.body.followedUserID;

    if (mainUserID === undefined || followedUserID === undefined) {
        res.json("Missing information. Please try again.");
        return;
    }

    const filter = {
        _id: mainUserID
    };

    const updatedDocument = {
        $push: {
            followedUsers: {
                $each: [followedUserID]
            }
        }
    };

    const result = await userCollection.updateOne(filter, updatedDocument);

    const response = [
        {matchedCount: result.matchedCount},
        {modifiedCount: result.modifiedCount}
    ];

    res.json(response);
}

app.post('/followUser', jsonParser, followUser);

// remove unfollowedUser's id from main user's
// followedUsers array
async function unfollowUser(req, res) {
    const mainUserID = req.body.mainUserID;
    const followedUserID = req.body.followedUserID;

    if (mainUserID === undefined || followedUserID === undefined) {
        res.json("Missing information. Please try again.");
        return;
    }

    const filter = {
        _id: mainUserID
    };

    const updatedDocument = {
        $pull: {
            followedUsers: followedUserID
        }
    };

    const result = await userCollection.updateOne(filter, updatedDocument);

    const response = [
        {matchedCount: result.matchedCount},
        {modifiedCount: result.modifiedCount}
    ];

    res.json(response);
}

app.post('/unfollowUser', jsonParser, unfollowUser);

app.listen(5000, function() {
    console.log("Server running on port 5000");
});