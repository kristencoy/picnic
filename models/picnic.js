const mongoose = require('mongoose');
const Review = require('./review');
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

PicnicSchema.post('findOneAndDelete', async function(doc) {
    if(doc){
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

module.exports = mongoose.model('Picnic', PicnicSchema);