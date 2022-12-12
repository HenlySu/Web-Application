var mongoose = require("mongoose");
var bcrypt = require('bcryptjs');
var Schema = mongoose.Schema;

var userSchema = new Schema({
   "userName" : { "type" : String, "unique" : true },
   "password" : String,
   "email" : String,
   "loginHistory" : [{ "dateTime" : Date, "userAgent" : String }]
});

let User; //To be defined on new connection (see initialize)

module.exports.initialize = function(){
   return new Promise((resolve,reject) => {
      let db = mongoose.createConnection(`mongodb+srv://hsu31:S3necaHenly@senecaweb.vkm5rgo.mongodb.net/?retryWrites=true&w=majority`);

      db.on('error',(err) => {
         reject(err); //reject the promise with the provided error
      })

      db.once('open',() => {
         User = db.model("users", userSchema);
         resolve();
      })
   })
}

module.exports.registerUser = (userData) => {
    return new Promise((resolve, reject) => {
        if (userData.password != userData.password2) {
            reject("Incorrect Password");
        }
        else {
            bcrypt.genSalt(10, function (err, salt) {
                bcrypt.hash(userData.password, salt, function (err, hash) {
                    if (err) {
                        reject("ERROR!");
                    }
                    else {
                        userData.password = hash;
                        let newUser = new User(userData);
                        newUser.save((err) => {
                            if (err) {
                                if (err.code === 11000) {
                                    reject("User name already exist!");
                                }
                                else {
                                    reject("ERROR!" + err);
                                }
                            }
                            else {
                                resolve();
                            }
                        })
                    }
                })
            })
        }
    })
};

module.exports.checkUser = (userData) => {
    return new Promise((resolve, reject) => {
        User.find({ userName: userData.userName })
            .exec()
            .then(users => {
                bcrypt.compare(userData.password, users[0].password).then(res => {
                    if (res === true) {
                        users[0].loginHistory.push({ dateTime: (new Date()).toString(), userAgent: userData.userAgent });
                        User.update(
                            { userName: users[0].userName },
                            { $set: { loginHistory: users[0].loginHistory } },
                            { multi: false }
                        )
                            .exec()
                            .then(() => { resolve(users[0]) })
                            .catch(err => { reject("Unable to verify user" + err) })
                    }
                    else {
                        reject("Incorrect password for: " + userData.userName);
                    }
                })
            })
            .catch(() => {
                reject("User " + userData.userName + " does not exist");
            })
    })
};