var jade = require("jade"),
    fs = require("co-fs"),
    fsPlus = require("co-fs-plus"),
    _ = require("lodash"),
    path = require("path");

module.exports = function (app) {
    app.use(function *(next) {

        // run plugins first, theme should be called at last
        yield next;

        var ctx = this;

        var render = function(template, locals) {
            var opts = {
                pretty: true,
                compileDebug: true,
                site: ctx.config.site
            };
            return jade.renderFile(__dirname + '/jade/' + template + '.jade', _.defaults(opts, locals));
        };

        var writeFile = function *(file, data) {
            file = ctx.config.target + file;
            ctx.logger.info('WriteFile: ' + file);
            yield fsPlus.mkdirp(path.dirname(file));
            yield fs.writeFile(file, data);
        };

        ////////////////////////////
        //
        // handle removed files
        //
        ////////////////////////////

        this.removedFiles.forEach(function(file) {
        });

        ////////////////////////////
        //
        // handle new files & changed files
        //
        ////////////////////////////

        yield this.changedFiles.concat(this.newFiles).map(function(file) {
            if(typeof file.content !== "undefined") {
                var target = path.dirname(file.path) + '/' + path.basename(file.path, path.extname(file.path));
                return writeFile(target + '.html', render('post', {post: file}));
            }
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

        yield writeFile('db.json', JSON.stringify(posts));

        yield writeFile('index.html', render('archives', {posts: posts}));

    });
};
