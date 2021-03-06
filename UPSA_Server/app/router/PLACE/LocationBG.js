"use strict";
let express = require('express');
let router = express.Router();
let sql = require('../../../mariaDB/db_sql')();

/* GET home page. */
router.get('/', function(req, res, next) {//해당 위치에 일정 시간 이상 머물렀을 경우
    console.log("LOCATIONBG:GET -> X : ",req.query.X);
    console.log("LOCATIONBG:GET -> Y : ",req.query.Y);
    console.log("LOCATIONBG:GET -> WifiList : ",req.query.WifiList);
    console.log("LOCATIONBG:GET -> Category : ", req.query.Category);
    console.log("LOCATIONBG:GET -> Radius : ", req.query.Radius);
    //그냥 위치에 맞는 시설 중 첫 번째를 보냄
    sql.getLocation(" place_type, _id ",req.query.X, req.query.Y, req.query.Category, req.query.Radius, function(err, result){
        if(err){
            console.error("LOCATIONBG:GET",err);
        }
        console.log("LOCATIONBG:GET -> result length : ", (undefined===result?"undefined":result.length));
        res.send(result);
    });
    //http://localhost:8080/locationfg?X=36.3619378&Y=127.35299439999994&WifiList=[]&Category=%22RESTAURANT%22&Radius=0.0001
});
/* GET home page. */

let userSet = function(DeviceId, callback){
    sql.getUser(DeviceId,undefined, function(err, result){
        if(err){
            console.log("LOCATIONBG:POST -> ERR : ",err);
        }
        else if(result.length===0){
            sql.newUser(DeviceId, undefined, callback);
        }
        else{
            callback(err, result);
        }
    });
};
router.post('/', function(req, res, next) {//해당 위치에 일정 시간 이상 머물렀을 경우
    console.log("LOCATIONBG:POST -> DeviceId : ",req.query.DeviceId);
    console.log("LOCATIONBG:POST -> PlaceId : ",req.query.PlacId);
    console.log("LOCATIONBG:POST -> new : ",req.query.new);
    console.log("LOCATIONBG:POST -> minute : ", req.query.minute);
    //그냥 위치에 맞는 시설 중 첫 번째를 보냄
    sql.getPermission(req.query.PlaceId, req.query.DeviceId, function(err, result){
        if(err){
            console.error("[ERR] LOCATIONBG:POST", err);
        }
        else if(result[0] === undefined){
            userSet(req.query.DeviceId, function(err){
                if(err){
                    console.log("LOCATIONBG:POST -> ERR : ",err);
                }
                sql.newPermission(req.query.PlaceId, req.query.DeviceId, req.query.minute, req.query.new, function(err, result){
                    if(err) console.error("[ERR] LOCATIONBG:POST", err);
                    console.log("LOCATIONBG:POST -> INSERT END");
                    res.send(result);
                });
            });
        }
        else{
            userSet(req.query.DeviceId, function(err) {
                if(err){
                    console.log("LOCATIONBG:POST -> ERR : ",err);
                }
                sql.updPermission(req.query.PlaceId, req.query.DeviceId, req.query.minute, req.query.new, function (err, result) {
                    if (err) console.error("[ERR] LOCATIONBG:POST", err);
                    console.log("LOCATIONBG:POST -> UPDATE END");
                    res.send(result);
                });
            });
        }

    });
    //http://localhost:8080/locationfg?X=36.3619378&Y=127.35299439999994&WifiList=[]&Category=%22RESTAURANT%22&Radius=0.0001
});
module.exports = router;