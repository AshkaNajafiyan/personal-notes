const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
    {
        username: { type: String, required: true, unique: true},
        email: { type: String, required: true, unique: true},
        password: { type: String, required: true},
    },
    { timestamps: true}
);

userSchema.pre('save', async function () {
    console.log('[User model] pre-save hook triggered');
    console.log('[User model] password modified:', this.isModified('password'));

    if (!this.isModified('password')) return;

    console.log('[User model] hashing password');
    this.password = await bcrypt.hash(this.password, 10);
    console.log('[User model] password hashed');
});

userSchema.methods.comparePassword = async function (password) {
    console.log('[User model] comparePassword called');
    console.log('[User model] incoming password length:', password ? password.length : 0);
    console.log('[User model] stored hash exists:', !!this.password);

    const result = await bcrypt.compare(password, this.password);
    console.log('[User model] comparePassword result:', result);
    return result;
};

module.exports = mongoose.model('User', userSchema);