// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import VueCookie from 'vue-cookie'
import VueFire from 'vuefire'
import firebase from 'firebase'
import config from './config.json'
import 'firebase/firestore'

firebase.initializeApp(config.firebase)
const db = firebase.firestore()

Vue.config.productionTip = false

Vue.use(VueCookie)
Vue.use(VueFire)
/* eslint-disable no-new */
new Vue({
  el: '#app',
  data: {
    spotifyCredentials: null,
    spotifySDKReady: false,
    db
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
