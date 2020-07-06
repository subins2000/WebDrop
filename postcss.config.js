const IN_PRODUCTION = process.env.NODE_ENV === 'production'

module.exports = {
  plugins: [
    IN_PRODUCTION && require('@fullhuman/postcss-purgecss')({
      content: ['./public/**/*.html', './src/**/*.vue'],
      defaultExtractor (content) {
        const contentWithoutStyleBlocks = content.replace(
          /<style[^]+?<\/style>/gi,
          ''
        );
        return (
          contentWithoutStyleBlocks.match(
            /[A-Za-z0-9-_/:]*[A-Za-z0-9-_/]+/g
          ) || []
        );
      },
      whitelistPatterns: [
        /card$/,
        /field$/,
        /has-text-white$/,
        /is-grouped$/,
        /navbar/,
        /progress$/,
        /tab$/
      ],
      whitelistPatternsChildren: [
        /checkbox$/,
        /modal/,
        /notices$/,
        /switch$/,
        /tabs$/,
      ]
    })
  ]
}
