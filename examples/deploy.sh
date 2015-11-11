#!/usr/bin/env bash

# simple bash script that deploys a node.js project via git
# if latest commit message contains the specified deployment flag
# then pull latest commit from remote and restart the module

### config ###

package_path="/apps/my-node-app"
deployment_flag="[live]"

### ### ### ###

cd $package_path

git fetch

commit_message=`git log --pretty=format:%s -n 1 origin/master`

if [[ $commit_message == *"$deployment_flag"* ]]
then
  git pull
  npm i
  npm restart
fi