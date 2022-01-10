const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema ({
    email: {
        type: String,
        required: true,
        unique: true
    }
});

//adds a username, password, salt etc to the schema
//makes sure they're unique/not duplicated
UserSchema.plugin(passportLocalMongoose)

module.exports = mongoose.model('User', UserSchema);