const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PicnicSchema = new Schema({
    title: String,
    image: String,
    location: String,
    description: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
})

module.exports = mongoose.model('Picnic', PicnicSchema);