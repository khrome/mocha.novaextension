/*exports.makeExecutable = async function (paths) {
  const nonexec = []
  const binpaths = [].concat(paths)
  binpaths.forEach(path => {
    if (!nova.fs.access(path, nova.fs.F_OK)) {
      const msg = `Can’t locate extension binaries at path “${path}”.`
      throw new Error(msg)
    }
    if (!nova.fs.access(path, nova.fs.X_OK)) nonexec.push(path)
  })

  if (nonexec.length) {
    const options = { args: ['+x'].concat(nonexec) }
    const results = await runAsync('/bin/chmod', options)
    if (results.code > 0) throw new Error(results.stderr)
  }
  return nonexec.length
};

exports.makeExecutable = async function getBinary(binaryName, dir) {
  const bin = binaries.which
  const opts = { args: [binaryName], cwd: dir, shell: true }
  const { code, stderr, stdout } = await runAsync(bin, opts)

  // Currently, `npm-which` has a few quirks we need to handle:
  // - It always returns 0, even when it cannot locate an executable.
  //   The only differentiator is that it prints a found executable’s
  //   path on stdout, and a message on stderr when it doesn’t find anything.
  // - But it shows usage info on stdout when no argument is passed.
  // - And, of course, shells return diverse errors when the script itself
  //   cannot be run, flavoured to the shell and hence unparseable.
  if (code === 0 && stdout.length) {
    const path = stdout.split('\n')[0]
    if (nova.fs.access(path, nova.fs.X_OK)) return new ESLint(path)
  } else if (code > 1) {
    // We ignore code 1 as that code should never come from the shell itself,
    // and it also future proofs us against `npm-which` getting more idiomatic.
    if (nova.fs.access(bin, nova.fs.X_OK)) {
      const error = new Error(`Exit code ${code}: ${stderr}`)
      error.name = 'ShellError'
      throw error
    } else {
      console.info(`Trying to make '${bin}' executable, then re-trying to get a linter …`)
      await makeExecutable(bin)
      return getLinter(dir)
    }
  }
};*/

class MochaTaskAssistant {
  provideTasks() {
    console.log("tasks")
    return [];
  }

  resolveTaskAction(context) {
    console.log("resolve", context.action )
    switch(context.action){
      case 'run':
        let script = [__dirname, 'runmocha.sh'].join("/");
        console.log('S', script);
        return new TaskProcessAction('node', {
          shell: true,
          args: [script],
        });
      case 'build':
        return new TaskProcessAction('mochatest', {
          shell: true,
          args: ['build'],
        });
      default: throw new Error(`Unknown action: ${context.action}`)
    }
  }
}
exports.MochaTaskAssistant = MochaTaskAssistant;
