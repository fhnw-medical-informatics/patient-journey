echo "You need to be connected to the FHNW VPN to deploy the application!"
echo ""
read -p 'Deploy Server [mu15ns33005.adm.ds.fhnw.ch]: ' DEPLOY_SERVER
DEPLOY_SERVER=${DEPLOY_SERVER:-mu15ns33005.adm.ds.fhnw.ch}
read -p 'Root Path [/home/www-data/pj]: ' DEPLOY_PATH
DEPLOY_PATH=${DEPLOY_PATH:-/home/www-data/pj}
read -p 'User: ' DEPLOY_USER

echo "Deploying to $DEPLOY_SERVER:$DEPLOY_PATH"

echo "Clearing old files…"
ssh $DEPLOY_USER@$DEPLOY_SERVER 'cd $DEPLOY_PATH ; rm -r app ; mkdir app'

echo "Deploying new files…"
scp -r ./build/* $DEPLOY_USER@$DEPLOY_SERVER:$DEPLOY_PATH/app

echo "Done. You can now access the application at https://pub.ima.lifesciences.fhnw.ch/pj/app"