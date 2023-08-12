#!/usr/bin/env bash

echo 'Star ...'
git pull

rm -rf web/node_modules/
rm -rf server/node_modules/
rm -rf node_modules/ && npm i
npm run build

pm2 stop psbFinance

today=$(date +%Y-%m-%d)
Backup_file=~/psbFinance/
Dest=~/psbFinanceBackup
filename=back-${Backup_file//\//_}-${today}.tar.gz
echo ${filename}
if [ -f ${filename} ]; then
  echo "Error file ${filename} already exists!"
else
  tar -czf ${Dest}/${filename} ${Backup_file}
fi

rsync -r build/ ~/psbFinance/

cd ~/psbFinance
npm i --only=production

cd server
pm2 delete psbFinance
pm2 start npm --name psbFinance -- start
#pm2 start 0
