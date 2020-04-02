var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var BookInstanceSchema = new Schema(
    {
        book: { type: Schema.Types.ObjectId, ref: 'Book', required: true }, //reference to the associated book
        imprint: { type: String, required: true },
        status: { type: String, required: true, enum: ['Available', 'Maintenance', 'Loaned', 'Reserved'], default: 'Maintenance' },
        due_back: { type: Date, default: Date.now }
    }
);

// Virtual for bookinstance's URL
BookInstanceSchema
    .virtual('url')
    .get(function () {
        return '/catalog/bookinstance/' + this._id;
    });

BookInstanceSchema
    .virtual('due_back_formatted')
    .get(function () {
        if (this.due_back !== null) {
            return this.due_back.toISOString().slice(5, 7) + "/" + this.due_back.toISOString().slice(8, 10) + "/" + this.due_back.toISOString().slice(0, 4);
        }
        else {
            return "Unspecified";
        }
    });

//Export model
module.exports = mongoose.model('BookInstance', BookInstanceSchema);