<template>
  <div class="about">
    <div class="container">
      <div class="content">
        <h3 class="is-size-3">WebDrop.Space</h3>
        <p>Easily share files & messages across devices !</p>
      </div>
      <b-tabs v-model="tab" expanded>
        <b-tab-item label="Help" class="content">
          <p>3 easy steps to share !</p>
          <ol>
            <li>Connect your devices to the same WiFi (or join with room link/code)</li>
            <li>Open this website (WebDrop.Space) on your devices</li>
            <li>Choose files and share !</li>
          </ol>
          <h3 class="content is-size-5">Features</h3>
          <ul>
            <li>Send files over local network & Internet</li>
            <li>Auto discover devices on local network</li>
            <li>Resume interrupted downloads</li>
            <li>Auto copy messages sent</li>
          </ul>
          <p>Go to <router-link to="/settings">settings</router-link> to configure WebDrop to your needs.</p>
          <h3 class="content is-size-4">FAQ</h3>
          <ul>
            <li>Do I need to wait for devices to get discovered before adding files ?</li><br/>
            <p><b>Ans:</b>&nbsp;<b>No</b>, you can add files even if the device count is <b>0</b>. When a new device joins the room, they will receive the already added files in the room.</p>

            <li>Devices are not detected on Windows</li><br/>
            <p><b>Ans:</b>&nbsp;Windows Firewall sometime block P2P (WebRTC) connections. Users have reported this problem and disabling the firewall has helped solve this.</p>

            <li>Isn't file passed through internet ? Wouldn't it be slow ?</li><br/>
            <p><b>Ans:</b>&nbsp;Internet is only required for discovering devices. Your devices are connected <b>Peer To Peer</b>. This P2P connection can be made through your local network using the same WiFi hotspot, thus increasing transfer speed ! Files are not shared through internet unless you use "Share via Internet" feature.</p>

            <li>How to transfer files to someone over the internet ?</li><br/>
            <p><span style="display: inline-block;vertical-align: top;"><b>Ans:</b>&nbsp;Click the "globe" icon</span>&nbsp;<span style="display: inline-block;vertical-align: bottom;"><earth-icon></earth-icon></span>&nbsp;<span style="vertical-align: top;">on navbar, share the room code or invite link with your friends. Once your friends join your room, you can share files with them. Remember, you'll have to keep WebDrop open until transfer is complete.</span></p>

            <li>Will you know the files being sent ?</li><br/>
            <p><b>Ans:</b>&nbsp;No ! Absolutely not ! P2P connection made ensures that you and only the other connected devices will know the data/files passed between each other.</p>

            <li>Are files passed through any intermediary servers ?</li><br/>
            <p><b>Ans:</b>&nbsp;Public WebTorrent trackers are used to make P2P connections. Everything else including file transfer happens in you & your recepient's device and browser. <a href="https://github.com/subins2000/p2pt#how-does-it-work-" target="_blank">Know More</a></p>

            <li>Error: Can't connect to Trackers!</li><br/>
            <p><b>Ans:</b>&nbsp;There are some unknown issues with some routers and internet service providers (ISP) for making P2P connections between devices. Try changing your internet connection or browser. Some ISPs purposefully block Torrent services :(</p>
          </ul>
          <p class="has-text-centered">WebDrop is a <a href="https://github.com/subins2000/WebDrop" target="_blank">Free & Open Source (FOSS)</a> software 🔍❤️</p>
        </b-tab-item>
        <b-tab-item label="About">
          <center class="content">
            <p>Made by <a href="https://twitter.com/SubinSiby" target="_blank">Subin Siby</a></p>
            <p>Suggestions ? Feedback ? I'd love to hear it !<br/><a href="https://subinsb.com/contact/">Ping me</a></p>
            <p>WebDrop is a <a href="https://en.wikipedia.org/wiki/Free_Software" target="_blank">സ്വതന്ത്ര/free/libre</a> software [AGPL-3] 🔍❤️</p>
            <b-field class="is-grouped is-grouped-centered">
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
            </b-field><br/>
            <p>Check out this <a href="https://dots.subinsb.com" target="_blank">Dots game</a> which is also P2P.</p>
            <p><a href="https://subinsb.com/projects/">See my other projects</a></p>
            <img src="https://WebDrop.Space/favicon.png" />
            <p>May the web be with you</p>
          </center>
        </b-tab-item>
      </b-tabs>
    </div>
  </div>
</template>

<script>
import EarthIcon from 'vue-material-design-icons/Earth.vue'

export default {
  name: 'About',

  components: {
    EarthIcon
  },

  data () {
    return {
      tab: ''
    }
  }
}
</script>
