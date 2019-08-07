const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const counter = require('./counter');
const Promise = require('bluebird');
var items = {};

// Public API - Fix these CRUD functions ///////////////////////////////////////

exports.create = (text, callback) => {
  // var id = counter.getNextUniqueId();
  //console.log(id)
  // items[id] = text;
  // callback(null, { id, text });
  // var newFile = path.join(exports.dataDir, id);
  counter.getNextUniqueId((err, id) => {
    fs.writeFile(path.join(exports.dataDir, id + '.txt'),
      text,
      (err) => {
        if (err) {
          console.log('error')
        } else {
          callback(null, {id, text});
        }
      }
    )
  });
};

exports.readAll = (callback) => {
  return new Promise(function(resolve, reject) {
    fs.readdir(exports.dataDir, (err, files) => {
      if (err) {
        reject(err);
      } else {
        resolve(files);
      }
    })
  })
  .then(function(files) {
    return new Promise(function(resolve, reject) {
      var storage = _.map(files, (id) => {
        return new Promise(function(resolve,reject) {
          fs.readFile(path.join(exports.dataDir, id), (err, data) => {
            if (err) {
              reject(err);
            } else {
              resolve({id: id.slice(0,5), text: data.toString()});
            }
          })
        })
      })
      resolve(storage);
    })
    .then(function(storage){
      Promise.all(storage).then((values) => {
        callback(null, values)
      })
    })
  })
  // var data = _.map(exports.dataDir, (text, id) => {
  //   return { id, text };
  // });
  // callback(null, data);
};

exports.readOne = (id, callback) => {
  fs.readFile(path.join(exports.dataDir, id + '.txt'), (err, data) => {
    if (err) {
      callback(new Error(`No item with id: ${id}`))
    } else {
      callback(err, {id : id, text : data.toString()})
    }
  })
  // var text = items[id];
  // if (!text) {
  //   callback(new Error(`No item with id: ${id}`));
  // } else {
  //   callback(null, { id, text });
  // }
};

exports.update = (id, text, callback) => {
  fs.readFile(path.join(exports.dataDir, id + '.txt'), (err, data) => {
    if (err) {
      callback(new Error(`No item with id: ${id}`))
    } else {
      fs.writeFile(path.join(exports.dataDir, id + '.txt'), text, callback)
    }
  })
  // fs.writeFile(path.join(exports.dataDir, id + '.txt'), text, (err) => {
  //   if (err) {
  //     callback(new Error(`No item with id: ${id}`))
  //   }
  // })
  // var item = items[id];
  // if (!item) {
  //   callback(new Error(`No item with id: ${id}`));
  // } else {
  //   items[id] = text;
  //   callback(null, { id, text });
  // }
};

exports.delete = (id, callback) => {
  fs.readFile(path.join(exports.dataDir, id + '.txt'), (err) => {
    if (err) {
      callback(new Error(`No item with id: ${id}`))
    } else {
      fs.unlink(path.join(exports.dataDir, id + '.txt'), callback)
    }
  })
  // var item = items[id];
  // delete items[id];
  // if (!item) {
  //   // report an error if item not found
  //   callback(new Error(`No item with id: ${id}`));
  // } else {
  //   callback();
  // }
};

// Config+Initialization code -- DO NOT MODIFY /////////////////////////////////

exports.dataDir = path.join(__dirname, 'data');

exports.initialize = () => {
  if (!fs.existsSync(exports.dataDir)) {
    fs.mkdirSync(exports.dataDir);
  }
};
