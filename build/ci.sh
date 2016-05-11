set -e
if [ -z "$CI_PULL_REQUEST" ]
then
  npm run lint
  npm run unit
else
  npm test
fi