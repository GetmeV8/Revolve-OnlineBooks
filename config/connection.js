const MongoClient = require('mongodb').MongoClient
const state = {
    db:null
}

module.exports.connect = function(done){
    const url = 'mongodb+srv://rameezmanoli:NTLlytd4RI6GW6po@cluster0.f3xcgb1.mongodb.net/test';
    const dbname = 'Revolve' ;

    MongoClient.connect(url,(err,data)=>{
        if(err) return done(err)
        state.db=data.db(dbname)
        done()
    })
    
}

module.exports.get = function(){
    return state.db;
}