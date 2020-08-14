module.exports = {
	src: ["./_compiled", "./_css"],
    noCachePattern: /(\/webmaster\/)|(\/cpresources\/)|(index\.php)|(cachebust\.js)|(\.json)$/gi,
    pjax: false,
    serviceWorker: false,
};