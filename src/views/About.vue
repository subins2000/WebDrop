<template>
  <div class="about">
    <b-navbar class="navbar is-warning has-text-white" :mobile-burger="false">
      <template slot="brand">
        <b-navbar-item tag="router-link" :to="{ path: '/' }">
          <h1 class="is-size-4">WebDrop</h1>
        </b-navbar-item>
        <b-navbar-item tag="div">
          Share Files Easily Across Devices !
        </b-navbar-item>
      </template>
    </b-navbar>
    <div class="container">
      <div class="content">
        <h3 class="is-size-3">ShareThisFile.Online</h3>
        <p>3 steps to share files !</p>
        <ol>
          <li>Connect your devices to the same WiFi or hotspot</li>
          <li>Make sure internet is available</li>
          <li>Choose the device and send !</li>
        </ol>
        <h3 class="content is-size-4">FAQ</h3>
        <ul>
          <li>Is file passed through internet ? Wouldn't it be slow ?</li>
          <p><b>Ans:</b>&nbsp;Internet is only required for discovering devices. Your devices are connected <b>Peer To Peer</b>. This P2P connection can be made through LAN using the same WiFi hotspot, thus increasing transfer speed ! Files are not shared through internet, though that is also possible too.</p>
          <li>Will you know the files being sent ?</li>
          <p><b>Ans:</b>&nbsp;No ! Absolutely not ! P2P connection made ensures that you and only the other connected devices will know the data/files passed between each other.</p>
          <li>Is A Server Being Used ?</li>
          <p><b>Ans:</b>&nbsp;Only public WebTorrent trackers are used to share files and make P2P connections. Everything else happens in your device and browser. <a href="https://github.com/subins2000/p2pt#how-does-it-work-" target="_blank">Know More</a></p>
        </ul>
      </div>
    </div>
  </div>
</template>
