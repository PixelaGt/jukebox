// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import VueCookie from 'vue-cookie'

Vue.config.productionTip = false

Vue.use(VueCookie)
/* eslint-disable no-new */
new Vue({
  el: '#app',
  data: {
    spotifyCredentials: null,
    spotifySDKReady: false
  },
  router,
  components: { App },
  template: '<App/>',
  created() {
    window.onSpotifyWebPlaybackSDKReady = () => {
      this.spotifySDKReady = true;
      if (this.$cookie.get('spotify_credentials')) {
        const cookie = this.$cookie.get('spotify_credentials');
        this.spotifyCredentials = JSON.parse(cookie);
        this.$router.push('playback');
      }
      this.$emit('spotify_ready');
    };
  },

  methods: {
    initializePlayer() {
      if (this.spotifySDKReady) {
        const player = new Spotify.Player({
          name: 'Pixela Jukebox',
          getOAuthToken: callback => {
            callback(this.spotifyCredentials.access_token);
          }
        });

        return player;
      }
    }
  }
})
