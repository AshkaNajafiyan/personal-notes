const mongoose = require ('mongoose');

const noteSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        content : {
            type: String,
            required: true,
        },
        tags: {
            type: [String],
            default: []
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
    },
    {timestamps: true}
);

noteSchema.pre('save', function () {
    console.log('[Note model] pre-save hook triggered');
    console.log('[Note model] title:', this.title);
    console.log('[Note model] user:', this.user);
    console.log('[Note model] tags count:', Array.isArray(this.tags) ? this.tags.length : 0);
});

noteSchema.pre('findOneAndUpdate', function () {
    console.log('[Note model] findOneAndUpdate hook triggered');
    console.log('[Note model] query:', this.getQuery());
    console.log('[Note model] update:', this.getUpdate());
});

const Note = mongoose.model('Note', noteSchema);

module.exports = Note;
