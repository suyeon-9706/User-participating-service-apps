"use strict";
let pool = require('./db_connect');
const fs = require('fs');
const childprocess = require("child_process");
require("date-utils");
console.log("sql starts on "+(new Date(Date.now())).toISOString());
let query_function = function(sql, callback){
    console.log("DB_SQL : ",sql);
    pool.getConnection(function(err, con){
        if(err){
            console.error(err);
            return;
        }
        con.query(sql, function (err, result, fields) {
            con.release();
            if (err) return callback(err);
            callback(null, result);
        });
    });
};
let testselect = function(sql, callback){
    query_function(sql,callback);
};
let getLocation = function(select, X, Y, category, radius, callback){
    let sql = "select "+select+" from Location where ST_DISTANCE(location, POINT("+X+","+Y+"))<="+radius;
    if(category !== "\"ALL\"" && category !== "ALL" && category !== undefined){
        sql = sql + " AND place_type=\"" + category+"\"";//STRING " OK
    }
    query_function(sql,callback);
};
let newLocation = function(X,Y,WifiList,BuildingName,PlaceName,PlaceType, callback){//자료 처리가 필요함.
    let sql1 = "INSERT INTO Location(";
    let sql2 = ") VALUES(";
    let sql3 = ")";
    let sql_arg1 = ["_id", "location", "wifi_list", "building_name", "place_name", "place_type"];
    let sql_arg2 = [0, "POINT("+X+","+Y+")", WifiList, BuildingName, PlaceName, PlaceType];
    let sql;
    for(let i in sql_arg2){
        if(sql_arg2[i] !== undefined){
            if(i > 1) sql_arg2[i] = '"'+sql_arg2[i]+'"';//STRING " OK
            if(X === undefined || Y === undefined){
                continue;
            }
            if(i != 0){
                sql1+=",";
                sql2+=",";
            }
            sql1 += sql_arg1[i];
            sql2 +=sql_arg2[i];

        }
    }
    sql = sql1+sql2+sql3;
    query_function(sql, function(){query_function("SELECT LAST_INSERT_ID() as _id;",callback)});
};
let editLocation = function(place_id, building_name, place_name, callback){
    let sql = "update Location set building_name=\""+building_name+"\", place_name=\""+place_name+"\" where _id="+place_id;
    query_function(sql,callback);
};
let delLocation = function(place_id, callback){
    let sql = "delete from Location where _id="+place_id;
    query_function(sql, callback);
};
let newDocument = function(place_id, article, callback){
    try {
        fs.mkdirSync('Documents/' + place_id);
    }
    catch(err){
        console.error(err);
        callback(err);
        return;
    }
    childprocess.execSync("git init",{"cwd":'Documents/' + place_id });
    let dir = 'Documents/' + place_id + "/doc";
    try {
        fs.writeFileSync(dir, article, 'utf8');
        console.log("DB_SQL : new Document ",place_id, " created. commit : "+(new Date(Date.now())).toISOString());
        childprocess.exec('git add --all;git commit -m "'+(new Date(Date.now())).toISOString()+'"',{"cwd":'Documents/' + place_id },function(){});
        callback();
    }
    catch(err){
        console.error(err);
        callback(err);
        return;
    }
};
let editDocument = function(place_id, article, callback){
    let dir = 'Documents/' + place_id + "/doc";
    try{
        let file_edit = fs.existsSync(dir, 'utf8');
        if(!file_edit) callback("editDocument : no such document");
        fs.writeFileSync(dir, article, 'utf8');
        console.log("DB_SQL : new Change on ",place_id, " created. commit : "+(new Date(Date.now())).toISOString());
        childprocess.exec('git add --all;git commit -m "'+(new Date(Date.now())).toISOString()+'"',{"cwd":'Documents/' + place_id },function(){});
        callback(null, fs.readFileSync(dir, 'utf8'));
    }
    catch(err){
        console.error(err);
        callback(err);
        return;
    }
};
let getDocument = function(place_id, article, callback){//파일 관련
    let dir = 'Documents/' + place_id + "/doc";
    try{
        callback(null, fs.readFileSync(dir, 'utf8'));
    }
    catch(err){
        console.error(err);
        callback(err);
    }
};
let delDocument = function(place_id, callback){//파일 관련
    let dir = 'Documents/' + place_id;
    try{
        let recurem = function(path) {
            if (fs.existsSync(path)) {
                fs.readdirSync(path).forEach(function(file, index){
                    var curPath = path + "/" + file;
                    if (fs.lstatSync(curPath).isDirectory()) { // recurse
                        recurem(curPath);
                    } else { // delete file
                        fs.unlinkSync(curPath);
                    }
                });
                fs.rmdirSync(path);
            }
        };
        recurem(dir);
        callback(null);
    }
    catch(err){
        console.error(err);
        callback(err);
    }
};
let getReview = function(place_id, index_start, index_end, callback){
    let sql = "select * from Review where place_id="+place_id+" ORDER BY timestamp";//n개의 리뷰만을 가져오도록 수정해야 함.
    query_function(sql,callback);
};
let newReview = function(place_id, article, callback){
    let sql = "insert into Review values(0,"+place_id+",\""+article+"\", NOW())";//STRING " OK
    query_function(sql,function(err, reault){
        query_function("SELECT LAST_INSERT_ID() as _id;",callback);
    });
};
let editReview = function(id, place_id, article, callback){
    let sql = "update Review set place_id="+place_id+" article="+article+" where id="+id;
    query_function(sql,callback);
};
let delReview = function(id, callback){
    let sql = "delete from Review where id="+id;
    query_function(sql,callback);
};
let getLog = function(){

};
let getPermission = function(place_id, user_id, callback){
    let sql = "select * from Permission where place_id="+place_id+" AND user_id=\""+user_id+"\"";//n개의 리뷰만을 가져오도록 수정해야 함.
    query_function(sql,callback);
};
let updPermission = function(place_id, user_id, stay_time, visit, callback){

    let sql = "update Permission set stay_time=stay_time+"+stay_time+", visited=visited+"+visit+", permission=(stay_time+visited+"+stay_time+"+"+visit+")/30%5+1" +" where user_id=\""+user_id+"\" AND place_id="+place_id;
    query_function(sql, callback);
};
let newPermission = function(place_id, user_id, stay_time, visit, callback){
    let sql = "insert into Permission values(\"" + user_id+"\","+place_id+","+stay_time+"," + visit + ", "+(stay_time+visit)/30%5+")";
    query_function(sql, function(){query_function("SELECT LAST_INSERT_ID() as _id;",callback)});
};
let getUser = function(device_id, password, callback){//password는 상관 안함
    let sql = "select * from User where _id=\""+device_id+"\"";//n개의 리뷰만을 가져오도록 수정해야 함.
    query_function(sql,callback);
};
let newUser = function(device_id, password, callback){
    let sql = "insert into User values(\""+device_id+"\", "+ (password===undefined?"NULL":"\""+password+"\"")+")";

    query_function(sql,function(){query_function("SELECT LAST_INSERT_ID() as _id;",callback)});
};
let delUser = function(){

};

module.exports = function () {
    return {
        testselect: testselect,
        getLocation:getLocation,
        newLocation:newLocation,
        editLocation:editLocation,
        delLocation:delLocation,
        newDocument:newDocument,
        editDocument:editDocument,
        getDocument:getDocument,
        delDocument:delDocument,
        getReview:getReview,
        newReview:newReview,
        editReview:editReview,
        delReview:delReview,
        getLog:getLog,
        getPermission:getPermission,
        updPermission:updPermission,
        newPermission:newPermission,
        getUser:getUser,
        newUser:newUser,
        delUser:delUser,
        pool: pool
    }
};