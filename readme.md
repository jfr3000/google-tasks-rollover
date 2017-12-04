# Google tasks rollover
Run this script to roll over all overdue Google tasks to the current day. Annoyingly, will open a browser tab each time it runs (see https://www.npmjs.com/package/google-oauth2 for reasons).

You can find your task list ID here https://developers.google.com/google-apps/tasks/v1/reference/tasklists/list and your client ID and secret by creating an OAuth project here https://console.developers.google.com/apis/.

Then, in `config.json`, provide
```
{
    "client_id": <your Google client ID>,
    "client_secret": <your Google client secret>,
    "task_list": <the ID of your task list>
}
```
And then,
```
npm install
npm start
```
