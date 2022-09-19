if [ -z "$1" ]
  then
    echo "Which env do you create queues?"
    exit 1
fi
cd ..
echo 'Running create-dead-letter-queue...'
NODE_ENV=$1  npx env-cmd -f ./env/.env.$1 node ./queues-scripts/create-dead-letter-queue.js