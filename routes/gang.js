var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Gang = require('./../models/gang');



//새로운 유저 가입
//닉네임 중복확인
router.post('/register', function(req,res,next){
    if(req.body.user !== undefined) {
        Gang.find({user:req.body.user}, function(err, dupCheck){
           if(dupCheck.length == 0){
               var gang = new Gang();
               gang.user = req.body.user;
               gang.count = 0;
               gang.save(function (err) {
                   if (err) {
                       console.log(err);
                       return res.json({result: 0});
                   }
                   console.log("Done");
                   return res.json({result:1});
               });
           }else{
               return res.status(409).json({result:0});
           }
        });

    }else{
        return res.json({result:0});
    }
});

//data로 username받음
//해당 유저의 오늘 count와 1,2,3등의 닉네임, 자신의 랭킹을 반환
//전체 count
router.get('/', function(req, res, next){
    var today = {
        allCount: 0,
        myCount: 0,
        ranking: [],
        rank: 0,
    }
    Gang.findOne({_id:'5ec22161d902b1730cf98a5d'}, function(err, oneDayGang){
        today.allCount = oneDayGang.count;
        Gang.find({_id: {$ne: '5ec22161d902b1730cf98a5d'}}).sort('-count').find(function(err,gangList){
            console.log("1",gangList);
            var ranking = [];
            for(let i=0;i<3;i++){
                var rank = {};
                rank.user = gangList[i].user;
                rank.count = gangList[i].count;
                ranking.push(rank);
            }
            today.ranking = ranking;
            for(var [idx, gang]  of gangList.entries()){
                if(gang.user === req.query.user){
                    today.rank = idx+1;
                    today.myCount = gang.count;
                    break;
                }
            }
            console.log(today);
            return res.json(today);
        });
    });
});


//post로 user이름 받음
//1깡시 호출되는 것으로 3분의 쿨타임을 둬야함.
//전체 카운터에 1을 더하고, 유저별 카운터에 1을 더함.
router.post('/', function(req, res, next) {
    console.log(req.body.user);
    Gang.findOne({user: req.body.user}, function(err, gang)  {
        if(err) return res.json({result:0});
        if(gang !== null){
            console.log(gang);
            var now = new Date();
            console.log(now - gang.published_date );
            if((now - gang.published_date) > (1000*60*3-1000*10)){
                gang.count += 1;
                gang.published_date = new Date();
                gang.save(function(err){
                    if(err){
                        console.log(err);
                        return res.json({result:0});
                    }
                    console.log("Done");
                    Gang.findOne({_id:'5ec22161d902b1730cf98a5d'}, function(err, oneDayGang){
                        console.log(oneDayGang);
                        oneDayGang.count += 1;
                        oneDayGang.save(function(err){
                            if(err){
                                console.log(err);
                                return res.json({result:0});
                            }
                            console.log("Done");
                            return res.json({result:1});
                        });
                    });
                });
            }else{
                res.status(403).json({result:0});
            }
        }
        else{
            return res.json({result:0});
        }
    });
});

module.exports = router;
