#!/bin/bash

if [[ ! -d ".git" ]]
then
    echo "El directori actual no és un directori de git vàlid.";
    exit 1;
fi

git config core.hooksPath .hooks;

chmod ug+x .hooks/*;
chmod ug+x .git/hooks/*;
