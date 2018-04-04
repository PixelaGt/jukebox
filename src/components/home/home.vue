<template src="./splash.html"></template>
<style lang="scss" scoped src="./splash.scss"></style>

<script>
import facebook from '@/assets/svg/facebook.svg';
import twitter from '@/assets/svg/twitter.svg';
import behance from '@/assets/svg/behance.svg';
import github from '@/assets/svg/github.svg';
import youtube from '@/assets/svg/youtube.svg';

export default {
  components: {
    // Particles
  },
  methods: {
    login() {
      let params = 'client_id=86e3e3b0d7b84b78bc214e7ea334c813&response_type=token&redirect_uri=http://localhost:8080/callback';
      let options = 'menubar=no,location=no,resizable=no,scrollbars=no,status=no,left=100,top=10,width=400,height=500';
      window.open('https://accounts.spotify.com/authorize?'+params, 'Spotify',options);

      window.addEventListener('message', (event) => {
       let hash = JSON.parse(event.data);
       console.log(hash);
      }, false)

    }
  }
}
</script>
