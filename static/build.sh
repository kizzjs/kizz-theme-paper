stylus styles.styl
cp styles.css ~/code/kizz-doc/public/static/

coffee -o src/tmp/ -c src/*.coffee
cp src/*.js src/tmp/
browserify src/tmp/index.js > js/bundle-src.js
uglifyjs js/bundle-src.js > js/bundle.js
trash src/tmp
cp js/bundle.js ~/code/kizz-doc/public/static/js/
