<template>
  <div class="about">
    <div class="container">
      <div class="content">
        <h3 class="is-size-3">ShareThisFile.Online</h3>
        <b-tabs v-model="tab" expanded>
          <b-tab-item label="Help">
            <p>3 easy steps to share !</p>
            <ol>
              <li>Connect your devices to the same WiFi or hotspot</li>
              <li>Open this website on your devices</li>
              <li>Choose files and share !</li>
            </ol>
            <h3 class="content is-size-4">FAQ</h3>
            <ul>
              <li>Isn't file passed through internet ? Wouldn't it be slow ?</li>
              <p><b>Ans:</b>&nbsp;Internet is only required for discovering devices. Your devices are connected <b>Peer To Peer</b>. This P2P connection can be made through LAN using the same WiFi hotspot, thus increasing transfer speed ! Files are not shared through internet unless you use "Share via Internet" feature.</p>
              <li>Will you know the files being sent ?</li>
              <p><b>Ans:</b>&nbsp;No ! Absolutely not ! P2P connection made ensures that you and only the other connected devices will know the data/files passed between each other.</p>
              <li>Is A Server Being Used ?</li>
              <p><b>Ans:</b>&nbsp;Only public WebTorrent trackers are used to share files and make P2P connections. Everything else happens in your device and browser. <a href="https://github.com/subins2000/p2pt#how-does-it-work-" target="_blank">Know More</a></p>
              <li>Error: Can't connect to Trackers!</li>
              <p><b>Ans:</b>&nbsp;There are some unknown issues with some routers and internet service providers (ISP) for making P2P connections to other users. Try changing your internet connection or browser. Some ISPs purposefully block Torrent services :(</p>
            </ul>
            <p class="has-text-centered">WebDrop is a <a href="https://github.com/subins2000/WebDrop" target="_blank">Free & Open Source (FOSS)</a> software. 🔍❤️</p>
          </b-tab-item>
          <b-tab-item label="About">
            <center class="content">
              <p>Made by <a href="https://twitter.com/SubinSiby" target="_blank">Subin Siby</a></p>
              <p>WebDrop is <a href="https://en.wikipedia.org/wiki/Free_Software" target="_blank">സ്വതന്ത്ര/free/libre</a> software [AGPL-3]</p>
              <b-field grouped position="is-centered">
                <div class="control">
                  <a href="https://subinsb.com/donate" target="_blank">
                    <b-button type="is-warning" size="is-medium">Donate</b-button>
                  </a>
                </div>
                <div class="control">
                  <a href="https://github.com/subins2000/WebDrop" target="_blank">
                    <b-button type="is-success" size="is-medium">Source Code</b-button>
                  </a>
                </div>
              </b-field>
            </center>
          </b-tab-item>
        </b-tabs>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'About',

  data () {
    return {
      tab: ''
    }
  }
}
</script>
