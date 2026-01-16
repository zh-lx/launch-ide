const { launchIDE } = require('../dist/index.js');
const { exec } = require('child_process');

launchIDE({
  file: '/Users/zhoulixiang/Desktop/github/launch-ide/lib/get-args.ts',
  line: 100,
  column: 10,
  type: 'open',
});
// exec(
//   `open /Users/zhoulixiang/Desktop/github/launch-ide/lib/get-args.ts:100:10`
// );

// exec(
//   `open "trae://file/Users/zhoulixiang/Desktop/github/launch-ide/lib/get-args.ts:100:10"`
// );
