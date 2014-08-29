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

        this.logger.debug(this.cwd);

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
        // update index
        //
        ////////////////////////////

        var tags = this.changedFiles.concat(this.removedFiles).map(function(file) {
            return file.tags;
        });

        this.logger.debug("kizz theme paper: done");

    });
};
