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
}

module.exports = function (app) {
    app.use(function *(next) {
        // run plugins first, theme should be called at last
        yield next;

        this.logger.debug(this);

        this.logger.debug("kizz theme paper: init");

        var files = this.changedFiles.concat(this.unchangedFiles);

        var getTarget = function(file) {
            
        }

        ////////////////////////////
        //
        // handle changed files
        //
        ////////////////////////////

        this.changedFiles.forEach(function() {
        });

        var themeDir = "";

        var route = function(file) {
            var template = file.content ? "post.jade" : null;
            return {
                target: file.path,
                template: template,
                source: file.path,
                globals: file
            }
        }

        ////////////////////////////
        //
        // handle removed files
        //
        ////////////////////////////


        ////////////////////////////
        //
        // tags & index
        //
        ////////////////////////////

        var tags = this.changedFiles.concat(this.removedFiles).map(function(file) {
            return file.tags;
        });
    });
}
