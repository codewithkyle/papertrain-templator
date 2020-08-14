const purgecss = require("@fullhuman/postcss-purgecss")({
    content: ["./**/*.tsx", "./**/*.jsx"],
    defaultExtractor: (content) => content.match(/[\w-/:]+(?<!:)/g) || [],
});

module.exports = {
    plugins: [require("autoprefixer"), ...(process.env.NODE_ENV === "production" ? [purgecss] : [])],
};
