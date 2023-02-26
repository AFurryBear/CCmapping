//引入express模块
var express = require('express');

//引入multer模块
var multer = require ('multer');
var path = require('path');

var fs = require('fs');
//引入child_process
var cp=require('child_process');

var geoip = require('geoip-country');


var upload = multer({ dest:  path.join(__dirname,'upload-single')});
var app = express();
var mysql      = require('mysql');
var connection = mysql.createPool({
    host     : 'localhost',
    user     : 'root',
    password : 'Gongclub123',
    database : 'HCP_CC'
});

// connection.connect();
app.use(express.static(path.join(__dirname, './')));
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

function getClientIp(req) {
    return req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;
};

app.get('/download/*', (req, res) => {
    console.log('download test');
    console.log(getClientIp(req));
    console.log(req.url)
    var url=req.url;
    var arr=url.split('/');
    var b = arr.splice(2);
    var file=b.join('/');
    if (typeof(file) !== undefined){
        console.log(file);
        var path = __dirname  + '/'+file;
        console.log(path);
        var size = fs.statSync(path).size;
        var f = fs.createReadStream(path);
        res.writeHead(200,{
            'Content-Type':'application/force-download',
            'Content-Disposition':'attachment;filename='+file,
            'Content-Length':size
        })
        f.pipe(res);
    }

})
app.post('/multiSurface',function(req,res){
    if (typeof req.body.parcellation !== 'undefined'){


        let parcellation=req.body.parcellation;
        let parcelID=req.body.parcelID;
        console.log(parcellation);
        console.log(parcelID);
        var r = Math.random().toString(36).substr(2, 3) + "-" + Math.random().toString(36).substr(2, 3) + "-" + Math.random().toString(36).substr(2, 4);
        console.log('python3.8 ' + path.join(__dirname, 'py/multiSurfResult.py') + ' ' + parcellation+' '+parcelID+' '+r.toUpperCase()+' '+__dirname)
        cp.exec('python3.8 ' + path.join(__dirname, 'py/multiSurfResult.py') + ' ' + parcellation+' '+parcelID+' '+r.toUpperCase()+' '+__dirname, (err, stdout, stderr) => {
            if (err) console.log('stderr', err);
            if (stdout) {
                console.log('stdout', stdout);
                if (stderr) console.log('stderr', stderr);
                res.json({
                    path: r.toUpperCase(),
                    std: stdout,
                    err: err,
                    stderr: stderr
                })
            }
            res.end();

        });
    }else{
        res.end();
    }

})
app.get('/threshold',function(req,res){
    if (typeof req.query !== 'undefined'){

        connection.query("SELECT value from HCP_CC."+req.query.type+" where name='"+req.query.name+"';",function (error,results){

            if (results){
                let dataString = JSON.stringify(results);
                let data = JSON.parse(dataString);
                res.json({
                    value:data[0].value,
                });
                res.end();
            }
            else{
                if (error){
                    res.end();
                }

            }


        })
    } else{
        res.end();
    }
    // console.log(req.query.type);
    // console.log(req.query.name);

})
app.get('/parcelmeta',function(req,res){
    if (typeof req.query !== 'undefined') {
        //console.log("SELECT zscore,behavior,pname from HCP_CC.meta_cognition where template='"+req.query.template+"' and pname in ("+req.query.roi1+","+req.query.roi2+") order by pname,zscore desc;")
        connection.query("SELECT zscore,behavior,pname from HCP_CC.meta_cognition where template='" + req.query.template + "' and pname in (" + req.query.roi1 + "," + req.query.roi2 + ") order by pname,zscore;", function (error, results, fields) {

            if (results) {
                let dataString = JSON.stringify(results);
                let data = JSON.parse(dataString);
                //console.log('The solution is: ', data);
                let zscore = [], behavior = [];
                for (i = 0; i < data.length; i++) {
                    zscore.push(data[i].zscore);
                    behavior.push(data[i].behavior);
                }
                res.json({
                    zscore: zscore,
                    behavior: behavior,
                });
                res.end();
            } else {
                if (error) {
                    res.end();
                }

            }

        });
    } else {
        res.end();
    }

});


app.post('/upload', upload.single('nifti1-file'), function (req, res) {
    //TODO:need consider .nii.gz
    console.log(req.file);
    console.log(req.body);
    var file = req.file;
    if (!req.file) {
        res.json({
            path: '',
            std: '',
            err: 'ERR: Plz choose a file to upload!',
            stderr: 'ERR: Plz choose a file to upload!'
        })
        res.end();
    } else{
        res.set({
            'content-type': 'application/json; charset=utf-8'
        });
        console.log("Request handler 'upload' was called.");
        if (path.extname(file.originalname) === '.nii') {
            var r = Math.random().toString(36).substr(2, 3) + "-" + Math.random().toString(36).substr(2, 3) + "-" + Math.random().toString(36).substr(2, 4);
            var upload_file = path.join(__dirname, "/upload-single/" + r.toUpperCase() + path.extname(file.originalname));
            fs.rename(file.path, upload_file, function () {
                var arg1 = upload_file;
                var arg2 = path.join(__dirname, '/save-file/', r.toUpperCase());
                var arg3 = path.join(__dirname, '/models');
                console.log('python3.8 ' + path.join(__dirname, 'py/genResult.py') + ' ' + arg1 + ' ' + arg2 + ' ' + arg3);
                cp.exec('python3.8 ' + path.join(__dirname, 'py/genResult.py') + ' ' + arg1 + ' ' + arg2 + ' ' + arg3, (err, stdout, stderr) => {
                    let std;
                    if (err) console.log('stderr', err);
                    if (stdout) {
                        console.log('stdout', stdout);
                        std = stdout;
                    }
                    if (stderr) console.log('stderr', stderr);
                    res.json({name: file.originalname, path: r.toUpperCase(), std: std, err: err, stderr: stderr})
                    res.end();

                });

            });
        } else {
            res.json({
                name: file.originalname,
                path: '',
                std: '',
                err: 'ERR: You should upload a nifti-file!',
                stderr: 'ERR: You should upload a nifti-file!'
            })
            res.end();
        }
    }
});
app.post('/uploadSurface', upload.single('gifti1-file'), function (req, res) {
    //TODO:need consider .nii.gz
    console.log('upload');
    console.log(req.file);
    var file = req.file;
    var index = req.body.opt;
    if (!req.file) {
        res.json({
            path: '',
            std: '',
            err: 'ERR: Plz choose a file to upload!',
            stderr: 'ERR: Plz choose a file to upload!'
        })
        res.end();
    } else {
        res.set({
            'content-type': 'application/json; charset=utf-8'
        });
        console.log("Request handler 'upload' was called.");
        if (path.extname(file.originalname) === '.gii') {
            var r = Math.random().toString(36).substr(2, 3) + "-" + Math.random().toString(36).substr(2, 3) + "-" + Math.random().toString(36).substr(2, 4);
            var upload_file = path.join(__dirname, "/upload-single/" + r.toUpperCase() + '.tex.gii');
            fs.rename(file.path, upload_file, function () {
                var arg1 = upload_file;
                var arg2 = index;
                console.log('python3.8 ' + path.join(__dirname, 'py/genSurfResult.py') + ' ' + arg1 + ' ' + arg2+ ' '+__dirname)
                cp.exec('python3.8 ' + path.join(__dirname, 'py/genSurfResult.py') + ' ' + arg1 + ' ' + arg2 + ' '+__dirname, (err, stdout, stderr) => {
                    let std;
                    console.log('err'+err)
                    console.log('stdout'+stdout)
                    console.log('stderr'+stderr)
                    if (stdout) {
                        cp.exec('ls ' + path.join(__dirname, 'save-file/' + r.toUpperCase() + '/json/*.nii'), (err0, stdout0, stderr0) => {
                            console.log(err0)
                            if (err0 || stderr0) {
                                res.json({
                                    name: file.originalname,
                                    path: '',
                                    flag:[],
                                    std: '',
                                    err: 'ERR: There\'s something wrong with your mask! ',
                                    stderr: 'ERR: There\'s something wrong with your mask! Nothing generated! '
                                })
                            }
                            else if (stdout0) {
                                console.log(stdout0.split("\n"));
                                std=stdout0.split("\n");
                                var resultno=stdout0.split("\n").length;
                                var result_arr=[];
                                for (i = 0; i < resultno; i++){
                                    let fname = std[i].split("/").pop().split(".");
                                    result_arr.push(fname[0]+'.'+fname[1]+'.'+fname[2])
                                }
                                console.log(stdout0)
                                if (stdout0.length === 0) {
                                    res.json({
                                        name: file.originalname,
                                        path: '',
                                        flag:[],
                                        std: '',
                                        err: 'ERR: There\'s something wrong with your mask! ',
                                        stderr: 'ERR: There\'s something wrong with your mask! '
                                    });
                                    res.end();
                                } else if (stdout0.length > 0) {
                                    console.log('stderr', stderr);
                                    res.json({
                                        name: file.originalname,
                                        path: r.toUpperCase(),
                                        flag: result_arr,
                                        std: std,
                                        err: err,
                                        stderr: stderr
                                    })
                                    res.end();
                                }

                            }
                        })
                    }
                });

            });
        } else {

            res.end();
        }
    }
});
app.listen(80,'0.0.0.0',() => {
    // client.country('142.1.1.1').then(response => {
    //     console.log(response);
    //     console.log(response.country.isoCode); // 'CA'
    // });
    console.log(`Example app listening on port 8080`)
});
app.get('/', function(req,res){

    console.log(getClientIp(req));
    var geo = geoip.lookup(getClientIp(req));
    if (geo.country=='CN'){
        console.log('yes');
        res.sendFile(path.join(__dirname,'./home.html'));
    }else{
        res.redirect('http://ccmapping.org/home.html');
    }
    //res.sendFile(path.join(__dirname,'./CCmapping_index.html'));
});
// app.get('/', function(req, res){
//     res.set('Content-Type', 'text/plain');
//     res.send('hello world');
// });
