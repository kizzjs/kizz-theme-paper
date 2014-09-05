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

isFileProtocol = -> location.protocol.indexOf('file') is 0

# Tag

dispalyTag = (tag) ->
    db.ready ->
        posts = db.filter (post) ->
            post.tags.indexOf(tag) > -1
        html = view.archives posts
        $('#main').html html

$('body').on 'click', 'li.tag', ->
    tag = $(this).text()

    url = baseURL + "/tags/"
    url += "index.html" if isFileProtocol()
    url += "#" + tag
    unless isFileProtocol()
        history.pushState({}, "Tag: #{tag}", url);
    else
        window.location.href = url

    dispalyTag tag

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
    url += "index.html" if isFileProtocol()
    url += "#" + keyword
    unless isFileProtocol()
        history.pushState({}, "Search: #{keyword}", url);
    else
        window.location.href = url

    setTimeout (-> search keyword), 1

# router

$meta = $('[name="kizz-router"]')
if $meta.length > 0
    arg = location.hash.substring(1)
    router = $meta.attr('content')
    if router is 'tags'
        dispalyTag arg
    if router is 'search'
        search arg
        $('#search').focus()
