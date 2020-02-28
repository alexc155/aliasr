[![NPM Version](https://img.shields.io/npm/v/aliasr.svg?style=flat-square)](https://www.npmjs.com/package/aliasr)
[![NPM Downloads](https://img.shields.io/npm/dm/aliasr.svg?style=flat-square)](https://www.npmjs.com/package/aliasr)
[![Build Status](https://travis-ci.org/alexc155/aliasr.svg?branch=master)](https://travis-ci.org/alexc155/aliasr)
[![Coverage Status](https://coveralls.io/repos/github/alexc155/aliasr/badge.svg?branch=master)](https://coveralls.io/github/alexc155/aliasr?branch=master)
[![dependencies Status](https://david-dm.org/alexc155/aliasr/status.svg)](https://david-dm.org/alexc155/aliasr)
[![devDependencies Status](https://david-dm.org/alexc155/aliasr/dev-status.svg)](https://david-dm.org/alexc155/aliasr?type=dev)

# aliasr

Create permanent command-line shortcuts &amp; aliases

aliasr is a Node script that persists aliases between sessions so you don't have to set them up each time.

## Installation

    $ npm i -g aliasr

## Available commands

    add <ALIAS_NAME> <COMMAND>
    remove <ALIAS_NAME>
    update <ALIAS_NAME> <COMMAND>
    list
    delete-backups
    add-standards (Adds a few common commands)
    help

## Example usage

    $ aliasr add hi echo Hello World!

## What aliases can I add?

How about some of the following?

    aliasr agi sudo apt-get install
    aliasr ll ls -Alh
    aliasr gp git pull
    aliasr cw cd c:\work\
    aliasr h history
    aliasr hg history | grep
    aliasr ns npm run start

## Acknowledgements

aliasr uses [pathmgr.cmd](https://gallery.technet.microsoft.com/Batch-Script-To-Manage-7d0ef21e) and [UpdateEnvVariable.exe](https://community.flexerasoftware.com/showthread.php?221438-VB-Script-for-WM_SETTINGCHANGE&p=512568#post512568) to ease the additions to the PATH variable in Windows.
