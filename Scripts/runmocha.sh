#!/usr/bin/env node
//const Mongoish = require('@perigress/mongonian');
const path = require('path');
//const Mocha = require('mocha');
const fs = require('fs');
// const PerigressTest = require('@perigress/perigress/test/util.js');
const { spawn } = require("child_process");


const runCreator = (target, format)=>{
    
    // Instantiate a Mocha instance.
    // var mocha = new Mocha();
    
    var current = target || process.cwd();
    var testDir = current+'/test';
    try{
        var dir = fs.readdirSync(testDir);
        
        if(fs.existsSync('/test.js')){ //root test script
            mocha.addFile(
                path.join(current, 'test.js')
            );
        }else{ // /test subdirectory
            dir.filter(function(file){
                // Only keep the .js files
                return file.substr(-3) === '.js';
            }).forEach(function(file){
                /*mocha.addFile(
                    path.join(testDir, file)
                );*/
            });
        }
        const testOutput = [target, ".test-output"].join('/');
        const ls = spawn([target, "node_modules/mocha/bin/_mocha"].join('/'), [
            "--reporter", 
            [target, "node_modules/mocha-json-output-reporter"].join('/'), 
            "--reporter-options",
            `output=${testOutput}`
        ], {cwd: target, maxBuffer: 1024*1024*10});
        let errorOutput = '';
        let output = '';
        
        ls.stdout.on("data", data => {
            output += data;
        });
        
        ls.stderr.on("data", data => {
            errorOutput += data;
        });
        
        ls.on('error', (error) => {
            console.log(`error: ${error.message}`);
        });
        
        ls.on("close", code => {
            fs.readFile(testOutput, (err, result)=>{
                console.log(result.toString());
                //maybe unlink, too
            });
        });
    }catch(ex){
        console.log(JSON.stringify({
            status:"error",
            message: ex.message
        }), "\n\n")
    }

}

//const format = new Mongoish();

let target = Array.prototype.slice.call(process.argv).pop();
if(target[0] !== '/'){ //if it's relative, lets append the current dir
    target = path.join(__dirname, target)
}

//console.log("target", target)

runCreator(target);