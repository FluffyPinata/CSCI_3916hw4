var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

mongoose.Promise = global.Promise;

mongoose.connect(process.env.DB, { useNewUrlParser: true } );
mongoose.set('useCreateIndex', true);

// user schema
var movieSchema = new Schema({
    title: { type: String },
    releaseYear: { type: Number },
    genre: { type: String, enum: ['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Mystery', 'Thriller', 'Western']},
    actors: { type: [ { ActorName: { type: String }, CharacterName: { type: String } }]}

});

// return the model
var Movie = mongoose.model('Movie', movieSchema);
module.exports = Movie;