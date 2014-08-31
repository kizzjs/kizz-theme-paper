stylus styles.styl
cp styles.css ~/code/kizz-doc/public/static/
coffee -o js/ -c coffee/main.coffee
cp js/main.js ~/code/kizz-doc/public/static/js/
