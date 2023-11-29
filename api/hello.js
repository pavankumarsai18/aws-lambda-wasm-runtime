const { spawn } = require('child_process');
const path = require('path');

function _runWasm(reqBody) {
  return new Promise(resolve => {
    const wasmedge = spawn(
      path.join(__dirname, 'wasmedge-tensorflow-lite'),
      [path.join(__dirname, 'classify.so')],
      {env: {'LD_LIBRARY_PATH': __dirname}}
    );

    let d = [];
    wasmedge.stdout.on('data', (data) => {
      d.push(data);
    });

    wasmedge.on('close', (code) => {
      resolve(d.join(''));
    });

    wasmedge.stdin.write(reqBody);
    wasmedge.stdin.end('');
  });
}

exports.handler = async function(event, context) {
  var start = new Date().getTime();

  var typedArray = new Uint8Array(event.body.match(/[\da-f]{2}/gi).map(function (h) {
    return parseInt(h, 16);
  }));

  var model_start = new Date().getTime();
  let result = await _runWasm(typedArray);
  var model_end = new Date().getTime();

  var end = new Date().getTime();

  var model_time = model_end - model_start;
  var func_time = end - start;
  var remaining_time = func_time - model_time;
  console.log("Remaining time");
  console.log(remaining_time)

  console.log("model_time time");
  console.log(model_time)

  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Headers" : "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "DELETE, GET, HEAD, OPTIONS, PATCH, POST, PUT"
    },
    body: result
  };
}
