class DB

    setData: (@data) ->
        fn?() for fn in @todo

    ready: (fn) ->
        if @data?
            fn?()
        else
            @todo = [] unless @todo?
            @todo.push fn

    filter: (fn) -> @data.filter fn
