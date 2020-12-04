const { ObjectID } = require('mongodb');

const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://myles:comp355@cluster0.oaecz.mongodb.net/<dbname>?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useUnifiedTopology: true });

async function connectDB() {
    await client.connect();
    const database = client.db("music");
    
    const userCollection = database.collection("users");
    const songCollection = database.collection("songs");
    const playlistCollection = database.collection("playlists");
    
    console.log("Connected!");

    // const result = await userCollection.insertOne({
    //     _id: "mhultgren",
    //     email: "myleshultgren@gmail.com",
    //     songs: [
    //         ObjectID("5fbaca68aa702948b414d946"),
    //         ObjectID("5fbacc5325ca4a4af4e97e1b"),
    //         ObjectID("5fbacc5325ca4a4af4e97e1e")
    //     ],
    //     topTen: [

    //     ],
    //     playlists: [

    //     ]
    // });

    // const songDocuments = [
    //     {
    //         name: "One Mo'Gin",
    //         artist: "D'Angelo",
    //         album: "Voodoo",
    //         genre: [
    //             "Soul"
    //         ]
    //     },
    //     {
    //         name: "Decks Dark",
    //         artist: "Radiohead",
    //         album: "A Moon Shaped Pool",
    //         genre: [
    //             "Alternative",
    //             "Rock"
    //         ]
    //     },
    //     {
    //         name: "Parisian Goldfish",
    //         artist: "Flying Lotus",
    //         album: "Los Angeles",
    //         genre: [
    //             "Electronic"
    //         ]
    //     },
    //     {
    //         name: "House of Cards",
    //         artist: "Radiohead",
    //         album: "In Rainbows",
    //         genre: [
    //             "Alternative",
    //             "Rock"
    //         ]
    //     }
    // ];

    // const result = await songCollection.insertMany(songDocuments);
    
    // const result = userCollection.aggregate([
    //     {
    //         $lookup: {
    //             "from": "songs",
    //             "localField": "songs",
    //             "foreignField": "_id",
    //             "as": "exampleSongs"
    //         }
    //     }
    // ]);

    // const songss = await result.toArray();
    // console.log(JSON.stringify(songss));

    // const result = await playlistCollection.insertOne({
    //     name: "Example Playlist",
    //     playlistUser: "mhultgren",
    //     songs: [
    //         ObjectID("5fbaca68aa702948b414d946"),
    //         ObjectID("5fbacc5325ca4a4af4e97e1e"),
    //         ObjectID("5fbacc5325ca4a4af4e97e1b"),
    //         ObjectID("5fbacc5325ca4a4af4e97e1c"),
    //         ObjectID("5fbacc5325ca4a4af4e97e1d")
    //     ]
    // });

    // const filter = {_id: "mhultgren"};
    // const updatedDocument = {
    //     $push:{
    //         songs: {
    //             $each: [ObjectID("5fbacc5325ca4a4af4e97e1c"), ObjectID("5fbacc5325ca4a4af4e97e1d")]
    //         }
    //     }
    // };

    // const result = await userCollection.updateOne(filter, updatedDocument);

    client.close();
}

connectDB();
