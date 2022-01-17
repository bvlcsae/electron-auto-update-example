const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");
const progressStream = require('progress-stream');
const crypto = require('crypto');

const rStr = crypto.randomBytes(16).toString("hex");

const tempExt = `.tmp_${rStr}`
//下载 的文件 地址
// let fileURL = "https://nodejs.org/dist/v12.18.3/node-v12.18.3-x64.msi";
let fileURL = "http://113.200.234.211:5050/download/flavor/default/1.0.3/windows_64/electron-react-boilerplate-1.0.3-full.nupkg";
//下载保存的文件路径
let fileSavePath = path.join(__dirname, path.basename(fileURL));
//缓存文件路径
let tmpFileSavePath = fileSavePath + tempExt;
//创建写入流
const fileStream = fs.createWriteStream(tmpFileSavePath).on('error', function (e) {
    console.error('error==>', e)
}).on('ready', function () {
    console.log("开始下载:", fileURL);
}).on('finish', function () {
    //下载完成后重命名文件
    fs.renameSync(tmpFileSavePath, fileSavePath);
    console.log('文件下载完成:', fileSavePath);
});
//请求文件
fetch(fileURL, {
    method: 'GET',
    headers: {'Content-Type': 'application/octet-stream'},
    // timeout: 100,
}).then(res => {
    //获取请求头中的文件大小数据
    let fsize = res.headers.get("content-length");
    //创建进度
    let str = progressStream({
        length: fsize,
        time: 100 /* ms */
    });
    // 下载进度
    str.on('progress', function (progressData) {
        //不换行输出
        let percentage = Math.round(progressData.percentage) + '%';
        console.log(percentage);
        // process.stdout.write('\033[2J'+);
        // console.log(progress);
        /*
        {
            percentage: 9.05,
            transferred: 949624,
            length: 10485760,
            remaining: 9536136,
            eta: 42,
            runtime: 3,
            delta: 295396,
            speed: 949624
        }
        */
    });
    res.body.pipe(str).pipe(fileStream);
}).catch(e => {
    //自定义异常处理
    console.log(e);
});

process.on('exit', (code) => {
    console.log(`About to exit with code: ${code}`);
});

process.on('SIGINT', function() {
    console.log('Got SIGINT.  Press Control-D/Control-C to exit.');
});
