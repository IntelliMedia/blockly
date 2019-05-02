/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2018 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Node.js script to run JsUnit tests in Chrome, via webdriver.
 */
var webdriverio = require('webdriverio');

module.exports = runMochaTestsInBrowser;

/**
 * Runs the Mocha tests in this directory in Chrome. It uses webdriverio to
 * launch Chrome and load index.html. Outputs a summary of the test results
 * to the console.
 * @return 0 on success, 1 on failure.
 */
async function runMochaTestsInBrowser() {
  var options = {
      capabilities: {
          browserName: 'chrome'
      }
  };

  var url = 'file://' + __dirname + '/index.html';
  console.log('Starting webdriverio...');
  const browser = await webdriverio.remote(options);
  console.log('Initialized.\nLoading url: ' + url);
  await browser.url(url);

  await browser.waitUntil(async () => {
    var elem = await browser.$('#failureCount');
    var text = await elem.getAttribute('tests_failed');
    return text != 'unset';
  })

  const elem = await browser.$('#failureCount')
  const numOfFailure = await elem.getAttribute('tests_failed');

  console.log('============Blockly Mocha Test Summary=================');
  console.log(numOfFailure);
  console.log(numOfFailure + ' tests failed');
  console.log('============Blockly Mocha Test Summary=================');
  if (parseInt(numOfFailure) !== 0) {
    await browser.deleteSession();
    return 1;
  }
  await browser.deleteSession();
  return 0;
}

if (require.main === module) {
  runMochaTestsInBrowser().catch(e => {
    console.error(e);
    process.exit(1);
  }).then(function(result) {
    if (result) {
      console.log('Mocha tests failed');
      process.exit(1);
    } else {
      console.log('Mocha tests passed');
      process.exit(0);
    }
  });
}
