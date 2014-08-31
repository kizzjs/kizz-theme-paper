var watch = require('node-watch'),
    exec = require('child_process').exec;
 
watch('.',  { recursive: true, followSymLinks: true }, function(filename) {
    console.log(filename, ' changed.');
    exec('./build.sh', function(error, stdout, stderr) {
        if(stdout) console.log('stdout: ' + stdout);
        if(stderr) console.log('stderr: ' + stderr);
        if (error !== null) {
            console.log('exec error: ' + error);
        }
    });
});
