<template src="./playback.html"></template>
<style lang="scss" scoped src="./playback.scss"></style>
<script>
import axios from 'axios'
import play from '@/assets/svg/play.svg';
import pause from '@/assets/svg/pause.svg';
import Messages from './playback-message/playback-message.vue'

let timer = null;
const spotifyApi = axios.create({
  headers: {
    'Content-Type': 'application/json'
  }
})

export default {
  components: {
    Messages
  },

  data() {
    return {
      currentSong: null,
      currentArtist: null,
      id: null,
      duration: 0,
      nextSong: null,
      player: null,
      playing: false,
      position: 0,
      songs: []
    }
  },

  created() {
    if (! this.$root.spotifyCredentials) {
      this.$router.push('/');
      return;
    }

    this.player = this.$root.initializePlayer();

    if ( this.player ) {
      this.connect()
    } else  {
      this.$on('spotify_ready', this.connect)
    }
  },

  computed: {
    artists() {
      const artistNames = this.currentSong.artists.map( artist => artist.name )
      return artistNames.join(' ')
    },

    artistImage() {
      if(!this.currentArtist) return 'http://cdn01.ib.infobae.com/adjuntos/162/imagenes/014/014/0014014674.jpg';
      return this.currentArtist.images[0];
    },

    ellapsedTime() {
      return (this.position / this.duration) * 100;
    }
  },

  methods: {
    addPlayerListeners() {
      this.player.addListener('ready', ({ device_id }) => {
        console.log('Connected with Device ID', device_id);
        this.id = device_id;
        this.player.getCurrentState().then(state => {
          if (!state) {
            this.playNextSong()
          }
        })
      });

      this.player.addListener('player_state_changed', this.updatePlayback);
    },

    connect() {
      spotifyApi.defaults.headers.common['Authorization'] = `Bearer ${this.$root.spotifyCredentials.access_token}`
      this.addPlayerListeners()
      this.loadSongs()
      this.player.connect().then(success => {
        if (success) {
          console.log('The Web Playback SDK successfully connected to Spotify!');
        }
      })
    },

    toggle() {
      this.player.togglePlay().then(() => {
        this.playing = ! this.playing
      })
    },

    updatePlayback({ track_window, duration, position }) {
      const trackInfo = track_window.current_track
      let { next_tracks: [nextSong] } = track_window;

      this.duration = duration
      this.position = position
      if (!this.currentSong || (this.currentSong.id !== trackInfo.id)) {
        spotifyApi.get(`https://api.spotify.com/v1/tracks/${trackInfo.id}`).then(response => {
          this.currentSong = response.data;
          this.playing = true;
          this.updateProgress();
          this.setArtist(this.currentSong.artists[0]);
        })
      }

      if (!nextSong) {
        this.popNextSong()
      }
      else if (this.nextSong.id !== nextSong.id) {
        this.nextSong = nextSong;
      } else {
        this.nextSong = null;
      }
    },

    setArtist(artist) {
      spotifyApi.get(`https://api.spotify.com/v1/artists/${artist.id}`).then(response => {
        this.currentArtist = response.data;
      });
    },

    loadSongs() {
      this.$root.db.collection('jukebox').where('status', '==', 'enqueued')
        .get().then(data => {
          data.forEach((doc) => {
            const key = doc.id
            this.songs.push({key, ...doc.data()})
          });
          if(!this.nextSong) this.popNextSong()
        })
    },

    playNextSong() {
      const nextSong = this.nextSong;
      spotifyApi.put(`https://api.spotify.com/v1/me/player/play?device_id=${this.id}`, {
        uris: [ this.nextSong.uri ]
      })
      if ( nextSong.source ) {
        this.$root.db.collection('jukebox').doc(nextSong.key)
          .update({status: 'playing'})
          .then(res => {
            this.popNextSong()
          })
          .catch(err => {
            console.log("Error adding document: ", err);
          })
      }
    },

    popNextSong() {
      const nextSong = this.songs.shift()
      if (!nextsong) return this.nextSong = null;
      this.nextSong = {
        ...nextSong,
        album: {
          name: nextSong.album,
          images: [{
            url: nextSong.imageURL
          }]
        },
        source: 'jukebox'
      }
    },

    updateProgress() {
      if (timer) clearInterval(timer)

      timer = setInterval(() => {
        this.position += 1000
      })
    }
  },

  filters: {
    time(value) {
      // Pad to 2 or 3 digits, default is 2
      function pad(n) {
        return ('00' + n).slice(-2);
      }

      let ms = value % 1000;
      value = (value - ms) / 1000;
      let secs = value % 60;
      value = (value - secs) / 60;
      let mins = value % 60;

      return pad(mins) + ':' + pad(secs);
    }
  }
}
</script>
