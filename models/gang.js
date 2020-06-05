var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/*
user : 닉네임
count : 오늘 시청 수
published_date : 최근 count가 올라간 시각
*/
var gangSchema = new Schema({
    user: String,
    count: Number,
    published_date: { type: Date, default: Date.now  }
});

module.exports = mongoose.model('Gang', gangSchema);
