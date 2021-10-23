const express = require('express');
const cors = require('cors');
const ytdl = require('ytdl-core');
const YoutubeMusicApi = require('youtube-music-api')
const api = new YoutubeMusicApi()
const { Client } = require("youtubei");
const youtube = new Client();
const app = express();
// app.use('/static', express.static('./static'));
app.use(cors())
app.use(express.json());
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
        var videoId = req.query.videoId;
        console.log('suggestion url requested request for ', videoId)
        api.getNext(videoId).then(result => {
            res.send(result)
        })
    });
})

app.get('/getStreamingURL', (req, res) => {
    var url = req.query.url;
    console.log('stream url requested request for ', url)
    ytdl.getInfo(url, { filter: 'audioonly' }).then(info => {
        // const format = ytdl.chooseFormat(info.formats, { filter: 'audio' });
        let videoUrl = null;
        let audioUrl = null
        info.formats.forEach(format => {
          if (format.mimeType.startsWith('audio/mp4')) {
            audioUrl = format.url;
          } else if (format.container == 'mp4' && videoUrl == null) {
            videoUrl = format.url;
          }
        });
        res.send(audioUrl != null ? audioUrl : videoUrl)
    })
  });

app.get('/download', (req, res) => {
    var url = req.query.url;
    console.log('download request for ', url)
    res.header("Content-Disposition", 'attachment; filename="Video.mp4');
    ytdl(url, { filter: 'audioonly' }).pipe(res);
});

app.post('/related', async (req, res) => {
    var ids = req.body.ids
    console.log('Getting related for ', ids);
    if (ids) {
        const relatedVids = [];
        for (let index = 0; index < ids.length; index++) {
            const id = ids[index];
            const video = await youtube.getVideo(id);
            const relatedVideos = await video.related;
            const relatedVideo = relatedVideos[0];
            relatedVids.push({
                id: relatedVideo.id,
                videoId: relatedVideo.id,
                title: relatedVideo.title,
                name: relatedVideo.title,
                artist: {name:relatedVideo.channel.name},
                thumbnails: relatedVideo.thumbnails,
                duration: relatedVideo.duration * 1000
            })
        }
        res.send({songs:relatedVids});
    } else [
        res.send({songs:[]})
    ]
})

module.exports = app;