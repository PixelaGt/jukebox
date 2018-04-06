<template src="./playback.html"></template>
<style lang="scss" scoped src="./playback.scss"></style>
<script>
import axios from 'axios'
import play from '@/assets/svg/play.svg';
import pause from '@/assets/svg/pause.svg';

const spotifyApi = axios.create({
  headers: {
    'Content-Type': 'application/json'
  }
})

export default {
  data() {
    return {
      currentSong: null,
      currentArtist: null,
      duration: 0,
      nextSong: null,
      player: null,
      playing: false,
      position: 0
    }
  },

  created() {
    this.player = this.$root.initializePlayer();

    if ( this.player ) {
      this.connect();
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
      });

      this.player.addListener('player_state_changed', this.updatePlayback);
    },

    connect() {
      spotifyApi.defaults.headers.common['Authorization'] = `Bearer ${this.$root.spotifyCredentials.access_token}`
      this.addPlayerListeners();
      this.player.connect().then(success => {
        if (success) {
          console.log('The Web Playback SDK successfully connected to Spotify!');
        }
      })
    },

    toggle() {
      this.player.togglePlay().then(() => {

      })
    },

    updatePlayback({ track_window, duration, position }) {
      const trackInfo = track_window.current_track
      let { next_songs [nextSong] } = track_window;

      this.duration = duration
      this.position = position
      if (!this.currentSong || (this.currentSong.id !== trackInfo.id)) {
        spotifyApi.get(`https://api.spotify.com/v1/tracks/${trackInfo.id}`).then(response => {
          this.currentSong = response.data;
          this.setArtist(this.currentSong.artists[0]);
        })
      }

      if (!this.nextSong || (this.nextSong.id !== nextSong.id)) {
        this.nextSong = nextSong;
      }
    },

    setArtist(artist) {
      spotifyApi.get(`https://api.spotify.com/v1/artists/${artist.id}`).then(response => {
        this.currentArtist = response.data;
      });
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
