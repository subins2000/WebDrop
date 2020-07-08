const GoogleFontsPlugin = require('@beyonk/google-fonts-webpack-plugin')

module.exports = {
  pwa: {
    workboxOptions: {
      skipWaiting: true
    }
  },
  pluginOptions: {
    webpackBundleAnalyzer: {
      openAnalyzer: false
    },
    prerenderSpa: {
      registry: undefined,
      renderRoutes: [
        '/',
        '/grid'
      ],
      useRenderEvent: true,
      headless: true,
      onlyProduction: true
    }
  },
  configureWebpack: {
    plugins: [
      new GoogleFontsPlugin({
        fonts: [
          { family: 'Ubuntu', variants: ['300', '400'] }
        ]
      })
    ]
  }
}
