stylus styles.styl
cp styles.css ~/code/kizz-doc/public/static/

coffee -o coffee/tmp/ -c coffee/*.coffee
browserify coffee/tmp/index.js > js/bundle.js
trash coffee/tmp
cp js/bundle.js ~/code/kizz-doc/public/static/js/
