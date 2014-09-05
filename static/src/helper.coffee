$ = require 'jquery'

_ = {}

_.loadScript = (src) ->
    script = document.createElement 'script'
    script.type = 'text/javascript'
    script.src = src
    document.head.appendChild script

module.exports = _
