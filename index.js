#!/usr/bin/env node
'use strict'

const request = require('request')
const os = require('os')
const path = require('path')
const config = require(path.join(os.homedir(), '.google-tasks-rollover', 'config.json'))
const goAuth2 = require('google-oauth2')(config)

const scope = 'https://www.googleapis.com/auth/tasks'
const base = 'https://www.googleapis.com/tasks/v1/lists/' + config.task_list + '/tasks'

async function rollOver(scope) {
  const authCode = await getAuthCode(scope)
  const accessToken = await getTokensForAuthCode(authCode)
  const tasks = await getOverdueTasks(accessToken) || []
  console.log(`Found ${tasks.length} overdue tasks`)
  return Promise.all(tasks.map(task => {
    task.due = (new Date()).toISOString()
    return requestP({
      method: 'put',
      headers: {
        Authorization: 'Bearer ' + accessToken,
        'Content-Type': 'application/json'
      },
      url: task.selfLink,
      body: JSON.stringify(task)
    })
  }))
}

async function getOverdueTasks(token) {
  const d = new Date()
  const res = await requestP({
    method: 'get',
    url: base,
    headers: { Authorization: 'Bearer ' + token },
    qs: { dueMax: d.toISOString() }
  })
  return JSON.parse(res.body).items
}


async function getAuthCode(scope) {
  return new Promise((resolve, reject) => {
    goAuth2.getAuthCode(scope, (err, result) => {
      if (err) return reject(err)
      resolve(result)
    })
  })
}

async function getTokensForAuthCode(authCode) {
  return new Promise((resolve, reject) => {
    goAuth2.getTokensForAuthCode(authCode, (err, result) => {
      if (err) return reject(err)
      resolve(result.access_token)
    })
  })
}

async function requestP (opts) {
  return new Promise((resolve, reject) => {
    request(opts, (err, res) => {
      if (err || (res.status && res.status !== 200)) reject(err || res)
      resolve(res)
    })
  })
}

rollOver(scope)
  .then(() => {
    console.log("All overdue tasks moved to current date")
    process.exit(0)
  })
  .catch(console.log)
