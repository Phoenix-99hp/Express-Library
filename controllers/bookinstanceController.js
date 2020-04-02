var BookInstance = require('../models/bookinstance');
var { body, validationResult } = require('express-validator/check');
var { sanitizeBody } = require('express-validator/filter');
var Book = require('../models/book');

// Display list of all BookInstances.
// Display list of all BookInstances.
exports.bookinstance_list = function (req, res, next) {

    BookInstance.find()
        .populate('book')
        .exec(function (err, list_bookinstances) {
            if (err) { return next(err); }
            // Successful, so render
            res.render('bookinstance_list', { title: 'Book Instance List', bookinstance_list: list_bookinstances });
        });

};

// Display detail page for a specific BookInstance.
exports.bookinstance_detail = function (req, res, next) {

    BookInstance.findById(req.params.id)
        .populate('book')
        .exec(function (err, bookinstance) {
            if (err) { return next(err); }
            if (bookinstance == null) { // No results.
                var err = new Error('Book copy not found');
                err.status = 404;
                return next(err);
            }
            // Successful, so render.
            res.render('bookinstance_detail', { title: 'Copy: ' + bookinstance.book.title, bookinstance: bookinstance });
        })

};

// Display BookInstance create form on GET.
exports.bookinstance_create_get = function (req, res, next) {

    Book.find({}, 'title')
        .exec(function (err, books) {
            if (err) { return next(err); }
            books.sort(function (a, b) {
                let textA = a.title.toUpperCase(); let textB = b.title.toUpperCase();
                return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
            });
            // Successful, so render.
            res.render('bookinstance_form', { title: 'Create Book Instance', book_list: books });
        });

};

// Handle BookInstance create on POST.
exports.bookinstance_create_post = [

    // Validate fields.
    body('book', 'Book must be specified').trim().isLength({ min: 1 }),
    body('imprint', 'Imprint must be specified').trim().isLength({ min: 1 }),
    body('due_back', 'Not specified').optional({ checkFalsy: true }).isISO8601(),
    body('status', 'Status must be specified').trim().isLength({ min: 1 }),

    // Sanitize fields.
    // sanitizeBody('book').escape(),
    // sanitizeBody('imprint').escape(),
    // sanitizeBody('status').trim().escape(),
    // sanitizeBody('due_back').toDate(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a BookInstance object with escaped and trimmed data.
        var bookinstance = new BookInstance(
            {
                book: req.body.book,
                imprint: req.body.imprint,
                status: req.body.status,
                due_back: req.body.due_back
            });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values and error messages.
            Book.find({}, 'title')
                .exec(function (err, books) {
                    if (err) { return next(err); }
                    books.sort(function (a, b) {
                        let textA = a.title.toUpperCase(); let textB = b.title.toUpperCase();
                        return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
                    });
                    // Successful, so render.
                    res.render('bookinstance_form', { title: 'Create Book Instance', book_list: books, errors: errors.array(), bookinstance: bookinstance });
                });
            return;
        }
        else {
            // Data from form is valid.
            bookinstance.save(function (err) {
                if (err) { return next(err); }
                // Successful - redirect to new record.
                res.redirect(bookinstance.url);
            });
        }
    }
];

// Display BookInstance delete form on GET.
exports.bookinstance_delete_get = function (req, res, next) {

    BookInstance.findById(req.params.id)
        .populate('book')
        .exec(function (err, results) {
            if (err) { return next(err); }
            if (results == null) { // No results.
                res.redirect('/catalog/bookinstances');
            }
            // Successful, so render.
            res.render('bookinstance_delete', { title: 'Delete Book Instance', bookinstance: results });
        });

};

// Handle BookInstance delete on POST.
exports.bookinstance_delete_post = function (req, res) {

    BookInstance.findById(req.body.bookinstanceid)
        .exec(function (err, results) {
            if (err) { return next(err); }
            // Success
            if (results.length > 0) {
                // Author has books. Render in same way as for GET route.
                res.render('bookinstance_delete', { title: 'Delete Book Instance', bookinstance: results });
                return;
            }
            else {
                // Author has no books. Delete object and redirect to the list of authors.
                BookInstance.findByIdAndRemove(req.body.bookinstanceid, function deleteBookInstance(err) {
                    if (err) { return next(err); }
                    // Success - go to author list
                    res.redirect('/catalog/bookinstances')
                })
            }
        });

};

// Display BookInstance update form on GET.
exports.bookinstance_update_get = function (req, res, next) {

    BookInstance.findById(req.params.id)
        .populate('author')
        .populate('book')
        .exec(function (err, results) {
            if (err) { return next(err); }
            if (results == null) { // No results.
                var err = new Error('Book not found');
                err.status = 404;
                return next(err);
            }
            // Success.
            res.render('bookinstance_update_form', { title: 'Update Book Instance', bookinstance: results });
        });
};

// Handle bookinstance update on POST.
exports.bookinstance_update_post = [

    // Validate fields.
    body('book', 'Book field must not be empty.').trim().isLength({ min: 1 }),
    body('imprint', 'Imprint must not be empty.').trim().isLength({ min: 1 }),
    body('status', 'Status must not be empty.').trim().isLength({ min: 1 }),
    body('due_back', 'Invalid date').optional({ checkFalsy: true }).isISO8601(),

    // Sanitize fields.
    // sanitizeBody('book').escape(),
    // sanitizeBody('imprint').escape(),
    // sanitizeBody('status').escape(),
    // sanitizeBody('due_back').toDate(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        var errors = validationResult(req);

        // Create a Book object with escaped/trimmed data and old id.
        var bookinstance = new BookInstance(
            {
                book: req.body.book._id, //reference to the associated book
                imprint: req.body.imprint,
                status: req.body.status,
                due_back: req.body.due_back,
                _id: req.params.id //This is required, or a new ID will be assigned!
            });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all authors and genres for form.
            BookInstance.findById(req.params.id).exec(function (err, results) {
                if (err) { return next(err); }
                res.render('bookinstance_update_form', { title: 'Update Book Instance', bookinstance: results, errors: errors.array() });
            });
            return;
        }
        else {
            // Data from form is valid. Update the record.
            BookInstance.findByIdAndUpdate(req.params.id, bookinstance, {}, function (err, thebookinstance) {
                if (err) { return next(err); }
                // Successful - redirect to book detail page.
                res.redirect(thebookinstance.url);
            });
        }
    }
]