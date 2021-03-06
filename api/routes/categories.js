const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const mongoose = require('mongoose');
const Category = require('../models/category');
const Film = require('../models/film');

//Handling incoming GET requests to /categories
router.get('/', auth, async (req, res, next) => {
	await Category.find()
		.select('name _id')
		.exec()
		.then((docs) => {
			const respond = {
				count: docs.length,
				categories: docs.map((doc) => {
					return {
						name: doc.name,
						_id: doc._id,
						request: {
							type: 'GET',
							url: 'http://localhost:4000/categories/' + doc._id
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
//Handling POST requests to /categories
router.post('/new', (req, res, next) => {
	const category = new Category({
		_id: new mongoose.Types.ObjectId(),
		name: req.body.name
	});
	category
		.save()
		.then((result) => {
			console.log(result);
			res.status(200).json({
				message: 'Created category successfully',
				createdCategory: {
					name: result.name,
					_id: result._id,
					request: {
						type: 'GET',
						url: 'http://localhost:3000/categories/' + result._id
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

router.get('/:category_id', auth, async (req, res, next) => {
	try {
		const limit = parseInt(req.query.limit, 10);
		const page = parseInt(req.query.page, 10);

		const id = req.params.category_id;
		const categories = await Category.findById(id);
		const films = await Film.find({ categories: { $elemMatch: { category: categories.id } } }).exec()

		await Category.findById(id)
			.select('name _id')
			.exec()
			.then((doc) => {
				console.log('From database', doc);
				if (doc) {
					res.status(200).json({
						category: doc,
						count: films.length,
						films: films,
						request: {
							type: 'GET',
							url: 'http://localhost:4000/category'
						}
					});
				} else {
					res.status(404).json({ message: 'No valid entry found for ID' });
				}
			})
			.catch((err) => {
				console.log(err);
				res.status(500).json({ error: err });
			});
	} catch (err) {
		res.status(500).json({
			message: err
		});
	}
});
router.delete('/delete/:categoryId', async (req, res, next) => {
	const id = req.params.filmId;
	await Category.remove({ _id: id })
		.exec()
		.then((result) => {
			res.status(200).json({
				message: 'Category Deleted',
				request: {
					type: 'POST',
					url: 'http://localhost:4000/category',
					body: {
						name: 'String'
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
