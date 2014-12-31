# require
DB = require './db'
View = require './view'
helper = require './helper'
$ = require 'jquery'
Prism = require './prism'

# base
baseURL = $('[name="kizz-base-url"]').attr('content')

# load data
window.db = new DB # exposed to window for JSONP
helper.loadScript (baseURL+'/db.jsonp')

view = new View(baseURL)

# Tag

displayTag = (tag) ->
    db.ready ->
        posts = db.filter (post) ->
            post.tags.indexOf(tag) > -1
        html = view.archives posts
        $('#main').html html

$('body').on 'click', 'li.tag', ->
    tag = $(this).text()

    url = baseURL + "/tags/"
    url += "#" + tag
    history.pushState({}, "Tag: #{tag}", url);
    displayTag tag

# Search

search = (keyword) ->
    db.ready ->
        match = db.filter (post) ->
            JSON.stringify(post).toLowerCase().indexOf(keyword.toLowerCase()) > -1
        if match.length > 0
            html = view.archives match
            $('#main').html html
        else
            $('#main').html '<div class="error">404 - Not Found</div>'

$('#search').on 'input', ->
    keyword = $(this).val()

    url = baseURL + "/search/"
    url += "#" + keyword
    history.pushState({}, "Search: #{keyword}", url);
    setTimeout (-> search keyword), 1

# router

$meta = $('[name="kizz-router"]')
if $meta.length > 0
    arg = location.hash.substring(1)
    router = $meta.attr('content')
    if router is 'post'
        $.get baseURL+'/comments.html', (data) ->
            $('#comments').html data
    if router is 'tags'
        displayTag arg
    if router is 'categories'
        displayCategory arg
    if router is 'search'
        search arg
        $('#search').val arg
        $('#search').focus()

