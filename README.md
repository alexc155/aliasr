# aliasr

Create permanent command-line shortcuts &amp; aliases

aliasr persists aliases between sessions so you don't have to set them up each time.

## ToDo

- Mac integration
- Packaging

## Available commands

    add <ALIAS_NAME> <COMMAND>
    remove <ALIAS_NAME>
    update <ALIAS_NAME> <COMMAND>
    list
    delete-backups
    add-standards
    help

## Example usage

    $ aliasr add hi echo Hello World!

## Acknowledgements

aliasr uses [pathmgr.cmd](https://gallery.technet.microsoft.com/Batch-Script-To-Manage-7d0ef21e) and [UpdateEnvVariable.exe](https://community.flexerasoftware.com/showthread.php?221438-VB-Script-for-WM_SETTINGCHANGE&p=512568#post512568) to ease the additions to the PATH variable in Windows.
