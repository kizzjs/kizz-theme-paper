var jade = require("jade"),
    fs = require("fs"),
    mkdirp = require("mkdirp"),
    _ = require("lodash");

module.exports = function (app) {
    app.use(function *(next) {
        // run plugins first, theme should be called at last
        yield next;

        this.logger.debug("kizz theme paper: INIT");

        var ctx = this;

        var render = function(template, locals) {
            var opts = {
                pretty: true,
                compileDebug: true,
                site: ctx.config.site
            };
            return jade.renderFile(__dirname + '/jade/' + template + '.jade', _.defaults(opts, locals));
        };

        var writeFile = function(file, data) {
            file = ctx.config.target + file;
            ctx.logger.debug('WriteFile: ' + file);
            fs.writeFile(file, data, function(err) {
                if(err) {
                    throw(err);
                }
            });
        };

        this.logger.debug(this);


        ////////////////////////////
        //
        // handle new files & changed files
        //
        ////////////////////////////

        this.changedFiles.concat(this.newFiles).forEach(function(file) {
        });

        ////////////////////////////
        //
        // handle removed files
        //
        ////////////////////////////

        this.removedFiles.forEach(function(file) {
        });

        ////////////////////////////
        //
        // update index.html & db.json
        //
        ////////////////////////////

        var files = this.newFiles.concat(this.changedFiles, this.unchangedFiles);

        var posts = files.filter(function(file) {
            return typeof file.content !== "undefined";
        }).map(function(file) {
            return {
                title: file.title,
                tags: file.tags,
                path: file.path
            };
        });

        writeFile('db.json', JSON.stringify(posts));

        writeFile('index.html', render('archives', {posts: posts}));

        this.logger.debug("kizz theme paper: DONE");

    });
};
