const mongoose = require('mongoose')

const userHistorySchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    user: { type: mongoose.Schema.Types.ObjectId, require: true, ref: 'User' },
    film: { type: mongoose.Schema.Types.ObjectId, ref: 'Film' },
    create_at: { type: Date, default: Date.now() },
})


module.exports = mongoose.model('Film_User_History', userHistorySchema)