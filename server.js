var express = require('express');
var bodyParser = require('body-parser');
var passport = require('passport');
var authJwtController = require('./auth_jwt');
var User = require('./Users');
var Movie = require('./movies');
var jwt = require('jsonwebtoken');

var app = express();
module.exports = app; // for testing
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize());

var router = express.Router();

router.route('/postjwt')
    .post(authJwtController.isAuthenticated, function (req, res) {
            console.log(req.body);
            res = res.status(200);
            if (req.get('Content-Type')) {
                console.log("Content-Type: " + req.get('Content-Type'));
                res = res.type(req.get('Content-Type'));
            }
            res.send(req.body);
        }
    );

router.route('/users/:userId')
    .get(authJwtController.isAuthenticated, function (req, res) {
        var id = req.params.userId;
        User.findById(id, function(err, user) {
            if (err) res.send(err);

            var userJson = JSON.stringify(user);
            // return that user
            res.json(user);
        });
    });

router.route('/users')
    .get(authJwtController.isAuthenticated, function (req, res) {
        User.find(function (err, users) {
            if (err) res.send(err);
            // return the users
            res.json(users);
        });
    });

router.post('/signup', function(req, res) {
    if (!req.body.username || !req.body.password) {
        res.json({success: false, message: 'Please pass username and password.'});
    }
    else {
        var user = new User();
        user.name = req.body.name;
        user.username = req.body.username;
        user.password = req.body.password;
        // save the user
        user.save(function(err) {
            if (err) {
                // duplicate entry
                if (err.code == 11000)
                    return res.json({ success: false, message: 'A user with that username already exists. '});
                else
                    return res.send(err);
            }

            res.json({ success: true, message: 'User created!' });
        });
    }
});

router.post('/signin', function(req, res) {
    var userNew = new User();
    userNew.name = req.body.name;
    userNew.username = req.body.username;
    userNew.password = req.body.password;

    User.findOne({ username: userNew.username }).select('name username password').exec(function(err, user) {
        if (err) res.send(err);

        user.comparePassword(userNew.password, function(isMatch){
            if (isMatch) {
                var userToken = {id: user._id, username: user.username};
                var token = jwt.sign(userToken, process.env.SECRET_KEY);
                res.json({success: true, token: 'JWT ' + token});
            }
            else {
                res.status(401).send({success: false, message: 'Authentication failed.'});
            }
        });


    });
});

router.route('/movies')
    .post(authJwtController.isAuthenticated, function(req, res) {
        Movie.findOne( { title: req.body.title }, function(err) {
            if (err) {
                res.json({message: 'General error'});
            } else if (req.body.actors.length < 3) {
                res.json({message: 'Actor array needs at least 3 actors'});
            } else if (req.data !== 0) {
                var movie = new Movie();
                movie.title = req.body.title;
                movie.releaseYear = req.body.releaseYear;
                movie.genre = req.body.genre;
                movie.actors = req.body.actors;
                // save the user
                movie.save(function (err) {
                    if (err) {
                        // duplicate entry
                        if (err.code == 11000)
                            return res.json({success: false, message: 'A movie already exists with that title.'});
                        else
                            return res.send(err);
                    }

                    res.json({success: true, message: 'Movie created!'});
                });
            }
        })
    })
    .put(authJwtController.isAuthenticated, function(req, res) {
        Movie.findOneAndUpdate( { title: req.body.title },
            {
                title: req.body.title,
                releaseYear: req.body.releaseYear,
                genre: req.body.genre,
                actors: req.body.actors,
            },
            function(err) {
                if (err) {
                    res.json({message: 'General error'});
                } else if (req.data === 0) {
                    res.json({message: 'Movie could not be found'});
                } else {
                    res.json({message: 'Movie was successfully updated'})
                }
            })
    })
    .delete(authJwtController.isAuthenticated, function(req, res) {
        Movie.findOneAndDelete( { title: req.body.title }, function(err) {
            if (err) {
                res.json({message: 'General error'});
            } else if (req.data === null) {
                res.json({message: 'Movie could not be found'});
            } else {
                res.json({message: 'Movie was successfully deleted'})
            }
        })
    })
    .get(authJwtController.isAuthenticated, function(req, res) {
        Movie.findOne( { title: req.body.title }, function(err) {
            if (err) {
                res.json({message: 'General error'});
            } else if (req.data === 0) {
                res.json({message: 'Movie could not be found'});
            } else {
                res.json({message: 'Movie was successfully found'})
            }
        })
    });



router.all('*', function(req, res) {
    res.json({success: false, message: 'HTTP method unsupported'});
});


app.use('/', router);
app.listen(process.env.PORT || 8080);
