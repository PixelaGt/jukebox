import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/components/home/home'
import SpotifyCallback from '@/components/spotify-callback/callback'
import Playback from '@/components/playback/playback';

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    },
    {
      path: '/callback',
      name: 'spotify-callback',
      component: SpotifyCallback
    },
    {
      path: '/playback',
      name: 'Playback',
      component: Playback
    }
  ]
})
