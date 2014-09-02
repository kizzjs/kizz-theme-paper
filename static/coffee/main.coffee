window.db = new DB

baseURL = $('[rel="kizz-base-url"]').attr('href')

delay = (time, fn) -> setTimeout fn, time

###############
#
# Tag
#
###############

$('body').on 'click', 'li.tag', ->
    tag = $(this).text()

###############
#
# Search
#
###############

search = (keyword) ->
    kizzDB.ready ->
        match = kizzDB.filter (post) ->
            JSON.stringify(post).indexOf(keyword) > -1
        if match.length > 0
            html = match.map (post) -> """
<article>
    <h1>
        <a href="#{baseURL + '/' + post.link}">#{post.title}</a>
    </h1>
    <div class="meta">
        <div class="key">Update:</div>
        <div class="value">#{post.modificationTime}</div>
        <div class="key">Tags:</div>
        <div class="value">
            <ul>
                #{post.tags.map((tag) -> "<li class='tag'>" + tag + "</li>").join('')}
            </ul>
        </div>
    </div>
</article>"""
            $('#main').html html
        else
            $('#main').html '<div class="error">404 - Not Found</div>'

$('#search').on 'input', ->
    keyword = $(this).val()
    delay 1, -> search keyword

