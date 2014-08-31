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
                pretty: false,
                compileDebug: true,
                site: ctx.config.site,
                baseURL: function(_path) {
                    return path.normalize(path.join(locals.baseURI, _path));
                }
            };
            var html = jade.renderFile(path.join(__dirname, 'jade',  template + '.jade'), _.defaults(opts, locals));
            return html;
        };

        var writeFile = function *(file, data) {
            file = path.join(ctx.config.target, file);
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
        } else {
            yield this.removedFiles.map(function(file) {
                var filePath;
                if(typeof file.content !== "undefined") {
                    filePath = path.join(path.dirname(file.path), path.basename(file.path, path.extname(file.path)) + '.html');
                } else {
                    filePath = file.path;
                }
                // remove empty dirs
                var iter = function *(_path) {
                    var dirname = path.dirname(_path);
                    if(dirname !== _path) {
                        var absDirname = path.join(ctx.config.target, dirname);
                        if((yield fs.readdir(absDirname)).length === 0) {
                            ctx.logger.info('Remove Directory: ' + absDirname);
                            yield fs.rmdir(absDirname);
                        }
                        yield iter(dirname);
                    }
                };
                return function *() {
                    try {
                        ctx.logger.info('Remove File: ' + filePath);
                        yield fs.unlink(path.join(ctx.config.target, filePath));
                        yield iter(filePath);
                    } catch(e) {
                        ctx.logger.error(e);
                    }
                };
            });
        }

        ////////////////////////////
        //
        // handle static/
        //
        ////////////////////////////

        var staticFiles = [
            "styles.css"
        ];
        yield staticFiles.map(function(file) {
            return copyFile(path.join(__dirname, 'static',  file),
                            path.join(ctx.config.target, 'static', file));
        });

        ////////////////////////////
        //
        // handle new files & changed files
        //
        ////////////////////////////

        yield this.changedFiles.concat(this.newFiles).map(function(file) {
            if(typeof file.content !== "undefined") {
                var target = path.join(
                    path.dirname(file.path),
                    path.basename(file.path, path.extname(file.path))
                );
                return writeFile(target + '.html', render('post', {
                    baseURI: path.relative(path.join(ctx.config.target, path.dirname(file.path)),
                                           ctx.config.target),
                    post: file
                }));
            } else {
                // copy static files
                return copyFile(file.absolutePath,
                                path.join(ctx.config.target, file.path));
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
            if(!file.link) {
                file.link = path.join(path.dirname(file.path),
                                      path.basename(file.path, path.extname(file.path)) + ".html");
            }
            return file;
        });

        yield writeFile('db.json', JSON.stringify(posts));

        yield writeFile('index.html', render('archives', {
            baseURI: '.',
            posts: posts
        }));

    });
};
