
var treeView = null;
let provider = null;
var Test = require('./testresult');
var { MochaTaskAssistant } = require('./util');
let data = [];

function setOutput(items){
    console.log(JSON.stringify(items));
    data.splice(0, data.length);
    items.forEach(item => data.push(item));
    provider.rebuild();
    treeView.reload();
}


exports.activate = function() {
    // Do work when the extension is activated
    provider = new Test.DataProvider(data);
    
    
    // Create the TreeView
    treeView = new TreeView("mochasidebar", {
        dataProvider: provider
    });
    
    treeView.onDidChangeSelection((selection) => {
        // console.log("New selection: " + selection.map((e) => e.name));
    });
    
    treeView.onDidExpandElement((element) => {
        // console.log("Expanded: " + element.name);
    });
    
    treeView.onDidCollapseElement((element) => {
        // console.log("Collapsed: " + element.name);
    });
    
    treeView.onDidChangeVisibility(() => {
        // console.log("Visibility Changed");
    });
    
    // TreeView implements the Disposable interface
    nova.subscriptions.add(treeView);
}

exports.deactivate = function() {
    // Clean up state before the extension is deactivated
}

const pluginDir = () => {
    return new Promise((resolve, reject) => {
        var process = new Process("/usr/bin/env", {
            args: ['pwd']
        });
        process.onStdout(function(line) {
            resolve(line.trim());
        });
        process.onStderr(function(line) {
            reject(line.trim());
        });
        process.start();
    });
}


nova.commands.register("mochasidebar.test", async () => {
    // Invoked when the "add" header button is clicked
    let processed = false;
    const processResults = (err, data)=>{
        if(!processed){
            processed = true;
            setOutput([
                {
                    label: `Pending   (${data.pending.length})`,
                    image: "error",
                    list: data.pending
                },
                {
                    label: `Failures (${data.failures.length})`,
                    image: "exclamation",
                    list: data.failures
                },
                {
                    label: `Passes   (${data.passes.length})`,
                    image: "accept",
                    list: data.passes
                }
            ])
        }
    }
    try{
        const pluginPath = await pluginDir();
        const workspacePath = nova.workspace.path;
        let script = [pluginPath, 'Scripts', 'runmocha.sh'].join("/");
        //let targetDir = [workspacePath, 'test'].join("/");
        //let script = 'pwd';
        // console.log('S', script, workspacePath);
        
        var process = new Process("/usr/bin/env", {
            args: [script, workspacePath]
        });
        process.cwd = workspacePath;
        let results = '';
        process.onStdout(function(line) {
            results += line;
            try{
                let trimmmedResults = results.trim();
                if(
                    trimmmedResults[0] === '{' &&
                    trimmmedResults[trimmmedResults.length-1] === '}'
                ){
                    processResults(null, JSON.parse(trimmmedResults));
                }
            }catch(ex){}
        });
        process.onStderr(function(line) {
            console.log('***', line);
            if(!line) return processResults(new Error("Timeout"));
            processResults(new Error(line));
        });
        setTimeout(()=>{
            processResults(new Error("Timeout"))
        }, 60000)
        
        process.start();
    }catch(ex){
        console.log("Error", ex)
    }
});

nova.commands.register("mochasidebar.test_cl", () => {
    let command = `"tell application \\\"Terminal\\\"\n    if not (exists window 1) then reopen\n    activate\n    do script \\\"cd ${nova.workspace.path}; mocha\\\"\nend tell"`;
    var process = new Process('/usr/bin/env', {
        args: ['osascript', '-e', command]
    });
    console.log(`/usr/bin/env osascript -e ${command}`)
    process.cwd = nova.workspace.path;
    process.onStdout(function(line) {
        console.log('>>>', line);
    });
    process.onStderr(function(line) {
        console.log('***', line);
    });
    
    process.start();
    console.log("Run Mocha CL Tests");
    // do shell script "open SomeFile.txt"
});


nova.commands.register("mochasidebar.doubleClick", () => {
    // Invoked when an item is double-clicked
    let selection = treeView.selection;
    console.log("DoubleClick: " + selection.map((e) => e.name));
});

let mochaTasks = new MochaTaskAssistant();
nova.assistants.registerTaskAssistant(mochaTasks, {
    identifier: 'outsiderindustries.assistants.mocha',
    name: 'Mocha',
});

nova.commands.register("runMochaTest", (editor) => {
    console.log("RMT");
});
