//Node dependencies
var path = require('path');
var fs = require('fs');
var io = require('../index').io;

var mongoose = require('mongoose');
//for queries by ObjectId
var ObjectId = mongoose.Types.ObjectId;

//require all MongoDB Model files, and initialize all model schemas
// var modelsPath = path.join(__dirname, '/db_models');
// fs.readdirSync(modelsPath).forEach(function (file) {
//   if (/(.*)\.(js$|coffee$)/.test(file)) {
//     require(modelsPath + '/' + file);
//   }
// });

//simple way to import DB models
var models = require('./db_models');

var Note = mongoose.model('Note');
var Folder = mongoose.model('Folder');

//general folder functions
exports.getAllFolders = function(req, res){
  console.log('getAllFolders');
  Folder.find({})
    .sort('-last_update')
    .exec(function(err, data){
      res.send(data);
    });
};
exports.createNewFolder = function(req, res){
  console.log('createNewFolder');
  var name = req.body.name;
  var newFolder = new Folder({
    name: name,
    notes: [],
    last_update: new Date()
  });
  newFolder.save(function(err, data){
    if(err){
      console.error(err);
      res.send(500, 'Internal Server Error');
    }else{
      exports.getAllFolders(req, res);
    }
  })
};

exports.getFolderNotes = function(req, res){
  var fId = req.param('f_id');
  Folder.find({_id: new ObjectId(fId)},
    function(err, folders){
      if(err){
        console.error(err);
        res.send(500, 'Internal Server Error');
      }else{
        var notes = folders[0].notes;
        //sort the notes by date
        notes.sort(function(n1, n2){
          return n2.last_update - n1.last_update;
        });
        res.send(notes);
      }
    });
};
exports.createNewNote = function(req, res){
  var fId = req.param('f_id');
  var newNote = new Note({
    text_front: '',
    text_back: '',
    tags: [],
    last_update: new Date()
  });
  Folder.update(
    {_id: new ObjectId(fId)},
    {
      last_update: new Date(),
      $push: {notes: newNote}
    },
    function(err, data){
      if(err){
        console.error(err);
        res.send(500, 'Internal Server Error');
      }else{
        exports.getFolderNotes(req, res);
      }
    });
};

//general note functions
exports.updateNote = function(req, res){
  var fId = req.param('f_id');
  var nId = req.param('n_id');
  console.log('updateNote');
  //use $elemMatch to query for embedded documents
  Folder.update(
    {
      _id: new ObjectId(fId),
      notes: {$elemMatch: {_id: new ObjectId(nId)}}},
    {
      last_update: new Date(), 
      'notes.$.text_front': req.body.text_front,
      'notes.$.text_back': req.body.text_back,
      'notes.$.last_update': new Date()
    },
    function(err, data){
      if(err){
        console.error(err);
        res.send(500, 'Internal Server Error');
      }else{
        res.send('updateNote success');
      }
    });
};
exports.deleteNote = function(req, res){
  var fId = req.param('f_id');
  var nId = req.param('n_id');
  console.log('deleteFolderNote');
  //use $pull to remove embedded documents from array
  Folder.update(
    {_id: new ObjectId(fId)},
    {
      last_update: new Date(),
      $pull: {notes: {_id: new ObjectId(nId)}}
    },
    function(err, data){
      if(err){
        console.error(err);
        res.send(500, 'Internal Server Error');
      }else{
        res.send('deleteNote success');
      }
    });
};

//note tag functions
exports.addNoteTag = function(req, res){
  var fId = req.param('f_id');
  var nId = req.param('n_id');
  var tag = req.body.tag;
  Folder.update(
    {
      _id: new ObjectId(fId),
      notes: {$elemMatch: {_id: new ObjectId(nId)}}
    },
    {
      last_update: new Date(),
      $push: {'notes.$.tags': tag}
    },
    function(err, data){
      if(err){
        console.error(err);
        res.send(500, 'Internal Server Error');
      }else{
        console.log(data);
        res.send('addNoteTag success');
      }
    });
};
