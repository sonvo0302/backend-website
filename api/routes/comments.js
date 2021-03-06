const express = require('express');
const router = express.Router();
const Comment = require('../models/comment');
const auth = require('../middleware/auth');
const mongoose = require('mongoose');
const Film = require('../models/film');
const User = require('../models/user');
const { response } = require('../../app');

router.get('/all', async(req, res, next) => {
    await Comment.find()
        .select('user film content updatedDate create_at _id')
        .populate('film user')
        .exec()
        .then((docs) => {
            const respond = {
                count: docs.length,
                comments: docs.map((doc) => {
                    return {
                        user: doc.user,
                        film: doc.film,
                        content: doc.content,
                        updatedDate: doc.updatedDate,
                        create_at: doc.create_at,
                        _id: doc._id,
                        request: {
                            type: 'GET',
                            url: 'http://localhost:4000/comment/' + doc._id
                        }
                    };
                })
            };
            //if(docs.length>=0){
            res.status(200).json(respond);
            // }else{
            //     res.status(400).json({
            //         message:'No entries found'
            //     });
            // }
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

router.post('/film', auth, async(req, res, next) => {
    try {
        const { content } = req.body;
        if (content == '') {
            res.status(400).json({
                message: 'You have not input content'
            });
        } else {
            const filmId_new = req.query.filmId;
            const loginId = req.user._id;

            const comment = new Comment({
                _id: new mongoose.Types.ObjectId(),
                user: loginId,
                film: filmId_new,
                content: req.body.content
            });
            comment
                .save()
                .then((result) => {
                    console.log(result);
                    res.status(200).json({
                        message: 'Create comment successfully',
                        createdRating: {
                            user: result.user,
                            film: result.film,
                            content: result.content,
                            create_at: result.create_at,
                            updatedDate: result.updatedDate,
                            _id: result._id,
                            request: {
                                type: 'GET',
                                url: 'http://localhost:4000/comment/' + result._id
                            }
                        }
                    });
                })
                .catch((err) => {
                    console.log(err);
                    res.status(500).json({
                        error: err
                    });
                });

        }
    } catch (err) {
        res.status(500).json({
            message: err
        });
    }
});

router.get('/', async(req, res, next) => {
    const film_id = req.query.filmId;
    const limit = parseInt(req.query.limit)
    const page = parseInt(req.query.page)
    Comment.find({ film: film_id }).populate('user').limit(limit).skip((page - 1) * limit).exec().then(data => {
        res.status(200).json({ comments: data });
    }).catch(err => res.status(500).json({ message: "Something went wrong!!" }));
});

router.put('/edit/:commentId', (req, res, next) => {
    const dataForUpdate = { content: req.body.content, updatedDate: Date.now().toString() };
    Comment.findByIdAndUpdate(req.params.commentId, dataForUpdate, { new: true }).exec().then((result) => {
        if (result) {
            res.status(200).json({
                comment: result,
                request: {
                    type: 'GET',
                    url: 'http://localhost:4000/comment' + result._id
                }
            });
        } else {
            res.status(404).json({ message: 'There was a problem updating the comment' });
        }
    });
});

router.delete('/delete/:commentId', (req, res, next) => {
    const id = req.params.commentId;
    Comment.remove({ _id: id })
        .exec()
        .then((result) => {
            res.status(200).json({
                message: 'Comment Deleted',
                request: {
                    type: 'POST',
                    url: 'http://localhost:4000/comment',
                    body: {
                        user: 'userId',
                        film: 'filmId',
                        content: 'String',
                        create_at: 'Datetime'
                    }
                }
            });
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

module.exports = router;