class View

    constructor: (@baseURL) ->

    archives: (posts) ->
        html = posts.map (post) =>
            tags = post.tags.map (tag) -> "<li class='tag'>" + tag + "</li>"

            unless post.link.indexOf('http') is 0
                link = @baseURL + '/' + post.link
            else
                link = post.link

            """<article>
                <h1>
                    <a href="#{link}">#{post.title}</a>
                </h1>
                <div class="meta">
                    <div class="key">Update:</div>
                    <div class="value">#{post.modificationTime}</div>
                    <div class="key">Tags:</div>
                    <div class="value">
                        <ul>
                            #{tags.join('')}
                        </ul>
                    </div>
                </div>
            </article>"""
        html.join ''

module.exports = View
