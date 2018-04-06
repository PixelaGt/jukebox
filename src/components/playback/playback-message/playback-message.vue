<template lang="html" src="./playback-message.html"></template>
<style src="./message.scss" lang="scss"></style>
<script>
export default {
  data() {
    return {
      currentMessage: null,
      currentIndex: 0,
      messages: []
    }
  },

  filters: {
    date(value) {
      const date = new Date(value);
      const options = { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
      return date.toLocaleDateString('es-GT', options)
    }
  },

  computed: {
    avatar() {
      const slug = this.currentMessage.name.replace(' ', '-')
      return `https://api.adorable.io/avatars/96/${slug}.png`
    }
  },

  created() {
    this.rotateMessages()
  },

  firestore() {
    return {
      messages: this.$root.db.collection("messages")
    }
  },

  methods: {
    rotateMessages() {
      setInterval(() => {
        this.currentMessage = this.messages[this.currentIndex]
        if (this.currentIndex === this.messages.length - 1) {
          this.currentIndex = 0;
        } else {
          this.currentIndex++;
        }
      }, 5000);

    }
  }
}
</script>
