class DB

    setData: (@data) ->
        if @todo?
            fn?() for fn in @todo

    ready: (fn) ->
        if @data?
            fn?()
        else
            @todo = [] unless @todo?
            @todo.push fn

    filter: (fn) -> @data.filter fn

module.exports = DB
