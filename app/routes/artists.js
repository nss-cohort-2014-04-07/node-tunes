/* jshint unused:false */

'use strict';

var artists = global.nss.db.collection('artists');
var songs = global.nss.db.collection('songs');
var Mongo = require('mongodb');

exports.index = (req, res)=>{
  artists.find().toArray((e,r)=>res.render('artists/index', {artists: r, title: 'Artists'}));
};

exports.show = (req, res)=>{
  var _id = Mongo.ObjectID(req.params.id);
  artists.findOne({_id:_id}, (e,a)=>{
    songs.find({artistId:_id}).toArray((e,s)=>{
      res.render('artists/show', {artist: a, songs: s, title: 'Artist'});
    });
  });
};

exports.create = (req, res)=>{
  var fs = require('fs');
  var mp = require('multiparty');
  var fm = new mp.Form();
  fm.parse(req, (err, fields, files)=>{
    var name       = fields.name[0];
    var normalized = name.split(' ').map(w=>w.trim()).map(w=>w.toLowerCase()).join('');
    var original   = files.photo[0].originalFilename;
    var oldPath    = files.photo[0].path;
    var newDir     = `${__dirname}/../static/img/${normalized}`;
    var newPathAbs = `${newDir}/${original}`;
    var newPathRel = `/img/${normalized}/${original}`;

    if(!fs.existsSync(newDir)){fs.mkdirSync(newDir);}
    fs.renameSync(oldPath, newPathAbs);

    var artist   = {};
    artist.name  = name;
    artist.photo = newPathRel;

    artists.save(artist, ()=>res.redirect('/artists'));
  });
};
