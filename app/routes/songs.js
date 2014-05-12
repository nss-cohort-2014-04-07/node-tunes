/* jshint unused:false */

'use strict';

var artists = global.nss.db.collection('artists');
var albums  = global.nss.db.collection('albums');
var songs   = global.nss.db.collection('songs');
var Mongo   = require('mongodb');
var _       = require('lodash');

exports.index = (req, res)=>{
  artists.find().toArray((e, artsts)=>{
    albums.find().toArray((e, albms)=>{
      songs.find(req.query).toArray((e, sngs)=>{

        sngs = sngs.map(s=>{
          var al = _(albms).find(a=>a._id.toString() === s.albumId.toString());
          var ar = _(artsts).find(a=>a._id.toString() === s.artistId.toString());
          s.album = al;
          s.artist = ar;
          return s;
        });

        res.render('songs/index', {artists: artsts, albums: albms, songs: sngs, title: 'Songs'});
      });
    });
  });
};

exports.create = (req, res)=>{
  var path = require('path');
  var fs   = require('fs');
  var mp   = require('multiparty');
  var fm   = new mp.Form();

  fm.parse(req, (err, fields, files)=>{
    var name       = fields.name[0];
    var normalized = name.split(' ').map(w=>w.trim()).map(w=>w.toLowerCase()).join('');
    var genres     = fields.genres[0].split(',').map(w=>w.trim()).map(w=>w.toLowerCase());
    var artistId   = Mongo.ObjectID(fields.artistId[0]);
    var albumId    = Mongo.ObjectID(fields.albumId[0]);
    var extension  = path.extname(files.file[0].path);
    var newPathRel = `/audios/${artistId}/${albumId}/${normalized}${extension}`;

    var bseDir     = `${__dirname}/../static/audios`;
    var artDir     = `${bseDir}/${artistId}`;
    var albDir     = `${artDir}/${albumId}`;
    var newPathAbs = `${albDir}/${normalized}${extension}`;
    var oldPathAbs = files.file[0].path;

    if(!fs.existsSync(artDir)){fs.mkdirSync(artDir);}
    if(!fs.existsSync(albDir)){fs.mkdirSync(albDir);}
    fs.renameSync(oldPathAbs, newPathAbs);

    var song      = {};
    song.name     = name;
    song.genres   = genres;
    song.artistId = artistId;
    song.albumId  = albumId;
    song.file     = newPathRel;

    songs.save(song, ()=>res.redirect('/songs'));
  });
};
