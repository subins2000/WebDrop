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
      keyframes: true,
      whitelist: [],
      whitelistPatterns: [
        /card/,
        /field/,
        /modal/,
        /has-text-/,
        /is-grouped/,
        /navbar/,
        /tab/
      ],
      whitelistPatternsChildren: [
        /checkbox/,
        /notices/,
        /switch/,
        /progress/,
        /tabs/,
        /upload/
      ]
    })
  ]
}
