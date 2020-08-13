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
        /-(leave|enter|appear)(|-(to|from|active))$/,
        /card$/,
        /field$/,
        /has-text-white$/,
        /is-grouped$/,
        /navbar/,
        /table-mobile-sort/
      ],
      whitelistPatternsChildren: [
        /checkbox$/,
        /modal/,
        /notices$/,
        /switch$/,
        /b-table/,
        /progress/,
        /tabs$/
      ]
    })
  ]
}
