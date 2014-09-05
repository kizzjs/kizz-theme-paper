var jade = require("jade"),
    fs = require("co-fs"),
    fsPlus = require("co-fs-plus"),
    _ = require("lodash"),
    path = require("path"),
    url = require('url'),
    beautifyHTML = require('js-beautify').html,
    moment = require('moment'),
    Feed = require('feed');

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
            html = beautifyHTML(html);
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

        if(this.unchangedFiles.length === 0) {
            // it's total rebuild
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

        // todo: in helper: use walk and filter
        var staticFiles = [
            "styles.css",
            "js/prism.js",
            "js/jquery.min.js",
            "js/bundle.js"
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
                    post: {
                        modificationTime: moment(file.modificationTime).calendar(),
                        path: file.path,
                        title: file.title,
                        tags: file.tags,
                        link: file.link,
                        content: file.content
                    }
                }));
            } else {
                // copy static files
                return copyFile(file.absolutePath,
                                path.join(ctx.config.target, file.path));
            }
        });

        ////////////////////////////
        //
        // update index.html & db.jsonp
        //
        ////////////////////////////

        var files = this.newFiles.concat(this.changedFiles, this.unchangedFiles);

        var posts = files.filter(function(file) {
            return typeof file.content !== "undefined";
        }).sort(function(a, b) {
            return (new Date(b.creationTime)).getTime() - (new Date(a.creationTime)).getTime();
        }).map(function(file) {
            if(!file.link) {
                file.link = path.join(path.dirname(file.path),
                                      path.basename(file.path, path.extname(file.path)) + ".html");
            }
            return file;
        });

        // Feed (ATOM 1.0)

        if(typeof ctx.config.site.url === "undefined") {

            this.logger.warn('Fail to generate feed: ctx.config.site.url undefined!');

        } else {

            var feed = new Feed({
                title: ctx.config.site.name,
                description: ctx.config.site.description,
                link: ctx.config.site.url,
                updated: new Date()
            });

            posts.slice(0, 5).forEach(function(post, index) {
                var link = url.resolve(ctx.config.site.url, post.link);
                feed.addItem({
                    title: post.title,
                    link: link,
                    date: new Date(post.modificationTime),
                    content: post.content
                });
            });

            yield writeFile('feed.xml', feed.render('atom-1.0'));
        } 

        // db.jsonp

        posts = posts.map(function(file) {
            return {
                modificationTime: moment(file.modificationTime).calendar(),
                path: file.path,
                title: file.title,
                tags: file.tags,
                link: file.link
            };
        });

        var json = JSON.stringify(posts);

        var jsonp = 'db.setData(' + json + ');';

        yield writeFile('db.jsonp', jsonp);

        // index.html

        yield writeFile('index.html', render('archives', {
            baseURI: '.',
            posts: posts
        }));

        ////////////////////////////
        //
        // tags/index.html
        //
        ////////////////////////////

        yield writeFile('tags/index.html', render('base', {
            baseURI: '..'
        }));

    });
};
