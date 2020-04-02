var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var AuthorSchema = new Schema(
    {
        first_name: { type: String, required: true, max: 100 },
        family_name: { type: String, required: true, max: 100 },
        date_of_birth: { type: Date },
        date_of_death: { type: Date },
    }
);

// Virtual for author's full name
AuthorSchema
    .virtual('name')
    .get(function () {

        // To avoid errors in cases where an author does not have either a family name or first name
        // We want to make sure we handle the exception by returning an empty string for that case

        var fullname = '';
        if (this.first_name && this.family_name) {
            fullname = this.family_name + ', ' + this.first_name
        }
        if (!this.first_name || !this.family_name) {
            fullname = '';
        }

        return fullname;
    });

// Virtual for author's lifespan
AuthorSchema
    .virtual('lifespan')
    .get(function () {
        return (this.date_of_death.getYear() - this.date_of_birth.getYear()).toString();
    });

// Virtual for author's lifespan formatted
AuthorSchema
    .virtual('lifespan_formatted')
    .get(function () {
        if (this.date_of_death && this.date_of_birth) {
            return this.date_of_birth.toISOString().slice(5, 7) + "/" + this.date_of_birth.toISOString().slice(8, 10) + "/" + this.date_of_birth.toISOString().slice(0, 4) + " - " + this.date_of_death.toISOString().slice(5, 7) + "/" + this.date_of_death.toISOString().slice(8, 10) + "/" + this.date_of_death.toISOString().slice(0, 4);
            // return moment(this.date_of_birth).format('MMMM Do, YYYY') + " " + "-" + " " + moment(this.date_of_death).format('MMMM Do, YYYY');
        }
        else if (this.date_of_death && !this.date_of_birth) {
            return "Unknown - " + this.date_of_death.toISOString().slice(5, 7) + "/" + this.date_of_death.toISOString().slice(8, 10) + "/" + this.date_of_death.toISOString().slice(0, 4);
            // return `Unknown - ${moment(this.date_of_death).format('MMMM Do, YYYY')}`;
        }
        else if (!this.date_of_death && this.date_of_birth) {
            return this.date_of_birth.toISOString().slice(5, 7) + "/" + this.date_of_birth.toISOString().slice(8, 10) + "/" + this.date_of_birth.toISOString().slice(0, 4) + " - Unknown or still living";
            // return moment(this.date_of_birth).format('MMMM Do, YYYY') + " " + "- Unknown or still living";
        }
        else {
            return "Unknown";
        }
    });

// Virtual for author's URL
AuthorSchema
    .virtual('url')
    .get(function () {
        return '/catalog/author/' + this._id;
    });

//Export model
module.exports = mongoose.model('Author', AuthorSchema);