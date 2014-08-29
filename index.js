var jade = require("jade"),
    fs = require("fs"),
    mkdirp = require("mkdirp");

var compile = function(options) {
    jade.renderFile(
      "theme/templates/" + options.template,
      {globals: options.globals},
      function(err, html) {
          if (err) throw err;
          fs.writeFile(options.target, html);
      }
    );
};

module.exports = function (app) {
    app.use(function *(next) {
        // run plugins first, theme should be called at last
        yield next;

        this.logger.debug("kizz theme paper: init");

        var ctx = this;

        var writeFile = function(file, data) {
            file = ctx.config.target + file;
            ctx.logger.debug('Write: ' + file);
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

        var db = this.newFiles.concat(this.changedFiles, this.unchangedFiles).filter(function(file) {
            return typeof file.content !== "undefined";
        }).map(function(file) {
            return {
                title: file.title,
                tags: file.tags,
                path: file.path
            };
        });

        ctx.logger.debug(db);

        writeFile('db.json', JSON.stringify(db));

        this.logger.debug("kizz theme paper: done");

    });
};
