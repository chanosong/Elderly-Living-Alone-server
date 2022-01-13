var express = require('express');
var router = express.Router();

const { PythonShell } = require('python-shell');

const multer = require("multer");
const maria = require('../db');

const fs = require('fs');
const path = require('path');

// main
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

// check result is exist
router.get('/check', function (req, res) {

  fs.exists(path.join("file/", req.query.id + ".png"), function (exists) {
    if (exists) {
      res.send(true);
    }else{
      //console.log(fileInfo);
      res.send(false);
    }
  });
});


// start py
router.get('/start', function (req, res) {
  console.log(req.query.id);
  var sql = 'UPDATE USER SET PROCEED = 1 WHERE ID = ?'
  maria.query(sql, [req.query.id], function (err, rows, fields) {
    if (!err) {
      console.log(rows);
    } else {
      console.log("err: " + err);
      res.send(err);
    }
  });

  let options = {
    args: [req.query.id]
  }
  PythonShell.run(
    "file/targetFinder_multi.py", options, function (err, results) {
      if (err) throw err;
      console.log("done");
    }
  );

  res.send(true)
});

// get done signal from py
router.post('/done', function(req,res) {
  console.log(req.query.id);
});

// send res png
router.get('/download', function (req, res) {
  var filename = req.query.id + '.png';
  console.log('file/' + filename);
  fs.exists('file/' + filename, function (exists) {
    if (exists) {
      fs.readFile('file/' + filename, function (err, data) {
        res.end(data);
      });
    } else {
      res.end('file is not exists');
    }
  });
});

// login
router.get('/login', function (req, res) {
  console.log(req.query);
  var sql = "SELECT * FROM USER WHERE ID = ? AND PW = ?"
  maria.query(sql, [req.query.id, req.query.pw], function (err, rows) {
    if (!err) {
      console.log(rows.length);

      if (rows.length == 1) {
        res.send(true);
      } else {
        res.send(false);
      }
    } else {
      console.log(err);
      res.send(err);
    }
  });
});

// register
router.post('/register', function (req, res) {
  
  var sql = "SELECT * FROM USER WHERE ID = ?"
  maria.query(sql, req.body.id, function (err, rows, fields) {
    if (!err) {
      console.log(rows.length);

      if (rows.length == 0) {
        insert = "INSERT INTO USER VALUES(?,?,?,?,?,0)"
        var params = [req.body.id, req.body.pw, req.body.name, req.body.birth, req.body.phone];
        maria.query(insert, params, function (err, rows) {

          if (!err) {
            res.send('1');
          } else {
            console.log(err);
            res.send(err)
          }
        })
      } else {
        res.send('2');
      }
    } else {
      console.log("err: " + err);
      res.send(err);
    }
  });
});

// csv file upload
router.post("/upload", (req, res) => {
  let path = "file";

  const storage = multer.diskStorage({
    destination: (req, file, callback) => {
      callback(null, `${path}`);
    },
    filename: (req, file, callback) => {

      let id = JSON.parse(req.body.id);
      callback(null, `${id}.csv`);
    },
  });

  const limits = {
    files: 1,
    fileSize: 1024 * 1024 * 1024, // 1G
  }

  const upload = multer({ storage, limits }).any();

  const reqFiles = [];

  upload(req, res, (err) => {

    if (err) {
      console.log(err);
      return res.send(false);
    }

    for (let i = 0; i < req.files.length; i++) {
      reqFiles.push(req.files[i].fileName);
    }

    return res.send(true)
  });
});

module.exports = router;
