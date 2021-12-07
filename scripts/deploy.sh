#!/usr/bin/env bash

echo 'Star ...'
git pull

rm -rf web/node_modules/
rm -rf server/node_modules/
rm -rf node_modules/ && npm i
npm run build

pm2 stop psbFinance
rsync -r build/ ~/psbFinance/

cd ~/psbFinance
npm i --only=production

cd server
pm2 delete psbFinance
pm2 start npm --name psbFinance -- start
#pm2 start 0

