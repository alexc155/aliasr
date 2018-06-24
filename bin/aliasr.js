#! /usr/bin/env node

const {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
  unlinkSync
} = require("fs");
const { EOL, platform } = require("os");
const { execSync } = require("child_process");

const winAliasDir = "C:\\aliasr-aliases";
const unixAliasLocations = ["~/.bashrc", "~/.bash_aliases", "/etc/bash.bashrc"];
const macAliasLocations = ["~/.bash_profile"];

const standards = [
  {
    platforms: ["unix"],
    name: "h",
    value: "history"
  },
  {
    platforms: ["unix", "windows"],
    name: "up",
    value: "cd .."
  },
  {
    platforms: ["windows"],
    name: "d",
    value: "dir /N /O:GN /P"
  }
];

function _showRestartMessage() {
  console.log("");
  console.log(
    "You'll need to restart your terminal window to make the change take effect."
  );
  console.log("");
}

function _setupWinAliasDir() {
  let setupNeeded = false;

  if (!existsSync(winAliasDir)) {
    console.log("");
    console.log(
      "Looks like this is the first time you've run this. Setting up folder for aliases..."
    );
    setupNeeded = true;
    mkdirSync(winAliasDir);
  }

  const path = execSync(`"${__dirname}\\pathmgr.cmd" /list`, {
    encoding: "utf8"
  });

  if (path.indexOf(winAliasDir) < 0) {
    if (!setupNeeded) {
      console.log("");
      console.log(
        "Looks like this is the first time you've run this. Setting up folder for aliases..."
      );
    }
    setupNeeded = true;

    console.log("Backup up 'path' variable value...");
    execSync(`"${__dirname}\\pathmgr.cmd" /backup /user user_path.backup`, {
      encoding: "utf8"
    });

    console.log("Writing path to Registry...");
    execSync(`"${__dirname}\\pathmgr.cmd" /add /y ${winAliasDir}`, {
      encoding: "utf8"
    });

    console.log("Broadcasting change...");
    execSync(`"${__dirname}\\UpdateEnvVariable.exe"`, {
      encoding: "utf8"
    });
  }

  return setupNeeded;
}

function _addToAliasesListWindows() {
  if (!_setupWinAliasDir()) {
    let winAliasList = "";
    for (file of readdirSync(winAliasDir)) {
      const fileContents = readFileSync(`${winAliasDir}\\${file}`);
      let aliasNames = [];
      nameParts = file.split(".");
      for (let i = 0; i < nameParts.length - 1; i++) {
        aliasNames.push(nameParts[i]);
      }
      winAliasList += `${aliasNames.join(".")} => ${fileContents}${EOL}`;
    }
    return winAliasList;
  } else {
    _showRestartMessage();
  }
  return "";
}

function _addToAliasesListUnix(pathToConfigFile) {
  const execResponse = execSync(
    "if [ -f " +
      pathToConfigFile +
      " ]; then cat " +
      pathToConfigFile +
      ' | grep "^\\s*alias" | sed "s/^[ \t]*//" | sed "s/^alias //" | sed "s/=/ => /"; fi',
    {
      encoding: "utf8"
    }
  );

  if (execResponse && execResponse.indexOf(" => ") >= 0) {
    return execResponse.trim() + EOL;
  }
  return "";
}

function _runUnixTest() {
  console.log("Testing...");

  const seed = new Date().getTime();
  console.log("Generating alias aliasr" + seed);

  addOrUpdateAlias("aliasr" + seed, "echo Hello World!", true);

  let contents = "";

  if (platform() === "darwin") {
    contents = execSync("cat ~/.bash_profile", { encoding: "utf8" });
  } else {
    contents = execSync("cat ~/.bash_aliases", { encoding: "utf8" });
  }

  if (contents.indexOf("aliasr" + seed + "='echo Hello World!'") >= 0) {
    console.log("Alias successfully added.");
  } else {
    console.log("ERROR! Alias not added.");
    return;
  }

  removeAlias("aliasr" + seed, true);

  if (platform() === "darwin") {
    contents = execSync("cat ~/.bash_profile", { encoding: "utf8" });
  } else {
    contents = execSync("cat ~/.bash_aliases", { encoding: "utf8" });
  }

  if (contents.indexOf("aliasr" + seed + "='echo Hello World!'") < 0) {
    console.log("Alias successfully removed.");
  } else {
    console.log("ERROR! Alias not removed.");
  }

  console.log("");

  console.log("Tests complete.");
}

function _runWindowsTest() {
  console.log("Testing...");

  const seed = new Date().getTime();
  console.log("Generating alias aliasr" + seed);

  addOrUpdateAlias("aliasr" + seed, "@echo Hello World!", true);

  const file = `aliasr${seed}.bat`;

  const contents = readFileSync(`${winAliasDir}\\${file}`, {
    encoding: "utf8"
  });

  if (contents === "@echo Hello World!") {
    console.log("Alias successfully added.");
  } else {
    console.log("ERROR! Alias not added.");
    return;
  }

  removeAlias("aliasr" + seed, true);

  if (!existsSync(`${winAliasDir}\\${file}`)) {
    console.log("Alias successfully removed.");
  } else {
    console.log("ERROR! Alias not removed.");
  }

  console.log("");

  console.log("Tests complete.");
}

function _removeUnixAlias(name, silent) {
  let aliasLocations = unixAliasLocations;
  if (platform() === "darwin") {
    aliasLocations = macAliasLocations;
  }

  for (aliasLocation of aliasLocations) {
    const execResponse = execSync(
      "if [ -f " + aliasLocation + " ]; then echo 1; fi"
    );

    if (execResponse && execResponse.indexOf("1") >= 0) {
      data = execSync("cat " + aliasLocation, {
        encoding: "utf8"
      });

      data_array = data.split("\n");

      lastIndex = (function() {
        for (let i = data_array.length - 1; i > -1; i--) {
          if (
            data_array[i].trim().indexOf("alias " + name + " =") === 0 ||
            data_array[i].trim().indexOf("alias " + name + "=") === 0
          ) {
            return i;
          }
        }
        return -1;
      })();

      if (lastIndex >= 0) {
        data_array.splice(lastIndex, 1);
        if (silent === false) {
          console.log("Writing to " + aliasLocation);
        }

        let sudoOrNot = "sudo ";

        if (aliasLocation === "~/.bash_aliases") {
          sudoOrNot = "";
        }

        execSync(
          sudoOrNot +
            "cp " +
            aliasLocation +
            " " +
            aliasLocation +
            ".backup_" +
            new Date().toISOString().replace(/[:.]/g, "_")
        );

        const tmpFile =
          "./tmp_" + new Date().toISOString().replace(/[:.]/g, "_");

        writeFileSync(tmpFile, data_array.join("\n"));

        execSync("sudo rm " + aliasLocation);

        execSync(sudoOrNot + "mv " + tmpFile + " " + aliasLocation);

        if (silent === false) {
          console.log("Restart your terminal or run 'unalias " + name + "'");
        }
      }
    }
  }
}

function _removeWindowsAlias(name) {
  if (!_setupWinAliasDir()) {
    for (file of readdirSync(winAliasDir)) {
      let aliasNames = [];
      nameParts = file.split(".");
      for (let i = 0; i < nameParts.length - 1; i++) {
        aliasNames.push(nameParts[i]);
      }
      if (aliasNames.join(".") === name) {
        unlinkSync(`${winAliasDir}\\${file}`);
      }
    }
  } else {
    _showRestartMessage();
  }
}

function _addUnixAlias(name, value, silent) {
  execSync("if [ ! -f ~/.bash_aliases ]; then touch ~/.bash_aliases; fi");

  execSync('echo "\\n >> ~/.bash_aliases"');

  execSync('echo "alias ' + name + "='" + value + "'\" >> ~/.bash_aliases");

  if (silent === false) {
    console.log(
      "Restart your terminal window or run the following (including the leading dot)"
    );

    console.log(". ~/.bash_aliases");
  }
}

function _addMacAlias(name, value, silent) {
  execSync('echo "\\n >> ~/.bash_profile"');
  execSync('echo "alias ' + name + "='" + value + "'\" >> ~/.bash_profile");

  if (silent === false) {
    console.log(
      "Restart your terminal window or run the following (including the leading dot)"
    );

    console.log(". ~/.bash_profile");
  }
}

function _addWindowsAlias(name, value) {
  if (!_setupWinAliasDir()) {
    // Write file
    writeFileSync(`${winAliasDir}\\${name}.bat`, value);
  } else {
    _showRestartMessage();
  }
}

function _buildPlatformSpecificStandards() {
  const plaformSpecificStandards = [];
  for (standard of standards) {
    if (platform() === "win32" && standard.platforms.includes("windows")) {
      plaformSpecificStandards.push(standard);
    } else if (standard.platforms.includes("unix")) {
      plaformSpecificStandards.push(standard);
    }
  }
  return plaformSpecificStandards;
}

/**
 * @param string name - the alias
 * @param string value - the shell command to run
 * @param bool silent - log output or not
 */
function addOrUpdateAlias(name, value, silent) {
  if (silent === false) {
    console.log("Adding...");
  }

  removeAlias(name, true);

  if (platform() === "win32") {
    _addWindowsAlias(name, value);
  } else if (platform() === "darwin") {
    _addMacAlias(name, value, silent);
  } else {
    _addUnixAlias(name, value, silent);
  }
}

/**
 * @param string name - the alias to remove
 * @param bool silent - log output or not
 */
function removeAlias(name, silent) {
  if (silent === false) {
    console.log("Removing...");
  }

  if (platform() === "win32") {
    _removeWindowsAlias(name);
  } else {
    _removeUnixAlias(name, silent);
  }
}

function listAliases() {
  let results = "";

  if (platform() === "win32") {
    results = _addToAliasesListWindows();
  } else {
    let aliasLocations = unixAliasLocations;
    if (platform() === "darwin") {
      aliasLocations = macAliasLocations;
    }
    for (aliasLocation of aliasLocations) {
      results += _addToAliasesListUnix(aliasLocation);
    }
  }

  const aliases = results
    .trim()
    .split(EOL)
    .sort();

  for (alias of aliases) {
    console.log(`    ` + alias);
  }
}

function deleteBackups() {
  if (platform() === "win32") {
    console.log("Nothing to delete on Windows platform.");
  } else {
    console.log("Removing all backups...");
    let aliasLocations = unixAliasLocations;
    if (platform() === "darwin") {
      aliasLocations = macAliasLocations;
    }
    for (aliasLocation of aliasLocations) {
      execSync("sudo rm -f " + aliasLocation + ".backup_* || true");
    }
  }
}

function addStandards() {
  console.log("Adding Standard Aliases...");

  const plaformSpecificStandards = _buildPlatformSpecificStandards();

  for (standard of plaformSpecificStandards) {
    addOrUpdateAlias(standard.name, standard.value, true);
  }

  if (platform() !== "win32") {
    console.log(
      "Restart your terminal window or run the following (including the leading dot)"
    );
    if (platform() === "darwin") {
      console.log(". ~/.bash_profile");
    } else {
      console.log(". ~/.bash_aliases");
    }
  }
}

function showHelp() {
  console.log(`
  aliasr persists aliases between sessions so you don't have to set them up each time.

  Available commands:
    add <ALIAS_NAME> <COMMAND>
    remove <ALIAS_NAME>
    update <ALIAS_NAME> <COMMAND>
    list
    delete-backups
    add-standards
    help

  Example usage:
    $ aliasr add hi echo Hello World!

  Notes:
    add-standards adds the following useful aliases:`);

  const plaformSpecificStandards = _buildPlatformSpecificStandards();

  for (standard of plaformSpecificStandards) {
    console.log(
      `
    ` +
        standard.name +
        " => " +
        standard.value
    );
  }
  console.log(`
  Current shortcuts:
      `);
  listAliases(true);
}

function main() {
  const action = process.argv[2];
  const args = process.argv.slice(3);
  switch (action) {
    case "add":
    case "update":
      addOrUpdateAlias(args[0], args.slice(1).join(" "));
      break;
    case "remove":
      removeAlias(args[0], false);
      break;
    case "list":
      listAliases();
      break;
    case "_test":
      if (platform() === "win32") {
        _runWindowsTest();
      } else {
        _runUnixTest();
      }
      break;
    case "delete-backups":
      deleteBackups();
      break;
    case "add-standards":
      addStandards();
      break;
    case "help":
    case "":
    case undefined:
    default:
      showHelp();
      break;
  }
}

main();
