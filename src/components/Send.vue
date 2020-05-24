<template>
  <div>
    <b-navbar class="navbar selected is-active has-text-white has-shadow" :mobile-burger="false">
      <template slot="brand">
        <b-navbar-item>
          <b-button v-on:click="back">WebDrop</b-button>
        </b-navbar-item>
        <b-navbar-item>
          Send
        </b-navbar-item>
      </template>
    </b-navbar>
  </div>
</template>

<script>
export default {
  name: 'Send',

  props: [
    'back',
    'userSelected'
  ],

  methods: {
    
  }
}
</script>
