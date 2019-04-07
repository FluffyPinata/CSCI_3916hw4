var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

mongoose.Promise = global.Promise;

mongoose.connect(process.env.DB, { useNewUrlParser: true } );
mongoose.set('useCreateIndex', true);

// user schema
var reviewsSchema = new Schema({
    name: { type: String },
    quote: { type: String },
    rating: { type: Number },
    movieTitle: { type: String }

});

// return the model
var Review = mongoose.model('Review', reviewsSchema);
module.exports = Review;