# require
DB = require './db'
View = require './view'

# init
window.db = new DB # exposed to window for JSONP

baseURL = $('[rel="kizz-base-url"]').attr('href')
view = new View(baseURL)

# Tag

$('body').on 'click', 'li.tag', ->
    tag = $(this).text()
    posts = db.filter (post) ->
        post.tags.indexOf(tag) > -1
    html = view.archives posts
    $('#main').html html

# Search

search = (keyword) ->
    db.ready ->
        match = db.filter (post) ->
            JSON.stringify(post).indexOf(keyword) > -1
        if match.length > 0
            html = view.archives match
            $('#main').html html
        else
            $('#main').html '<div class="error">404 - Not Found</div>'

$('#search').on 'input', ->
    keyword = $(this).val()
    setTimeout (-> search keyword), 1

