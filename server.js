const express = require('express');
const cors = require('cors');
const ytdl = require('ytdl-core');
const YoutubeMusicApi = require('youtube-music-api')
const api = new YoutubeMusicApi()
const app = express();
// app.use('/static', express.static('./static'));
app.use(cors())
const port = process.env.PORT || process.env.VCAP_APP_PORT || 3000;

app.listen(port, () => {
    console.log("SpotifyP backend started on "+port);
});

app.get('/test', (req, res) => {
    res.send('SpotifyP Backend')
})

api.initalize().then(info => {
    app.get('/search', (req, res) => {
        const searchQuery = req.query.searchQuery;
        console.log(searchQuery)
        api.search(searchQuery,'VIDEO', 50).then(result => res.send(result))
    });

    app.get('/getSuggestions', (req, res) => {
        var searchQuery = req.query.searchQuery;
        console.log('suggestion url requested request for ', searchQuery)
        api.getSearchSuggestions(searchQuery).then(result => {
            res.send(result)
        })
    });

    app.get('/getNext', (req, res) => {
        // var searchQuery = req.query.searchQuery;
        var videoId = req.query.videoId;
        // var searchQuery = req.query.searchQuery;
        console.log('suggestion url requested request for ', videoId)
        api.getNext(videoId).then(result => {
            res.send(result)
        })
    });
})

// app.get('/search', (req, res) => {
//     const searchQuery = req.query.searchQuery;
//     console.log(searchQuery)
//     api.initalize().then(info => {
//         api.search(searchQuery,'VIDEO', 50).then(result => res.send(result))
//     })
// });

app.get('/getStreamingURL', (req, res) => {
    var url = req.query.url;
    console.log('stream url requested request for ', url)
    ytdl.getInfo(url, { filter: 'audio' }).then(info => {
        const format = ytdl.chooseFormat(info.formats, { filter: 'audio' });
        res.send(format.url)
    })
});

app.get('/download', (req, res) => {
    var url = req.query.url;
    console.log('download request for ', url)
    res.header("Content-Disposition", 'attachment; filename="Video.mp4');
    ytdl(url, { filter: 'audioonly' }).pipe(res);
});