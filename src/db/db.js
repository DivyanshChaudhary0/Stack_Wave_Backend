
const mongoose = require("mongoose");
const config = require("../config/config");


function connect(){
    mongoose.connect(config.MONGO_URI)
    .then(() => {
        console.log("Database connected");
    })
    .catch(() => {
        console.log("Database not connected");
    })
}

module.exports = connect;