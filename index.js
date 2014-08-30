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

        var copyFile = function *(from, to) {
            ctx.logger.info('CopyFile: ' + to);
            var contents = yield fs.readFile(from);
            yield fsPlus.mkdirp(path.dirname(to));
            yield fs.writeFile(to, contents);
        };

        ////////////////////////////
        //
        // handle removed files
        //
        ////////////////////////////

        if(this.argv[2] === "rebuild" && isNaN(parseInt(this.argv[3]))) {
            this.logger.info('Remove Directory: ' + this.config.target);
            yield fsPlus.rimraf(this.config.target);
        }

        // todo: remove empty dirs
        yield this.removedFiles.map(function(file) {
            var filePath;
            if(typeof file.content !== "undefined") {
                filePath = path.dirname(file.path) + '/' + path.basename(file.path, path.extname(file.path)) + '.html';
            } else {
                filePath = file.path;
            }
            // remove empty dirs
            var iter = function *() {
                var dirname = path.dirname(filePath);
                console.log(dirname);
                console.log(path.dirname(dirname));
            };
            return function *() {
                yield iter();
                yield fs.unlink(path.resolve(ctx.config.target, filePath));
            };
        });

        ////////////////////////////
        //
        // handle static/
        //
        ////////////////////////////

        var staticFiles = yield fs.readdir(__dirname + '/static/');
        yield staticFiles.map(function(file) {
            return copyFile(__dirname + '/static/' + file, ctx.config.target + 'static/' + file);
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
            } else {
                // copy static files
                return copyFile(file.absolutePath, ctx.config.target + file.path);
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
