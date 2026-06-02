const express = require ('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config()
const User = require('./models/User');
const { authMiddleware, SECRET } = require('./middleware/auth');
const Note = require('./models/Notes');

const app = express();
const port = process.env.PORT || 8000;
const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

console.log('[Startup] Allowed origins:', allowedOrigins);

app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin) {
        console.log(`[CORS] Request from origin: ${origin}`);
    }

    if (origin && allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
    }

    res.header('Vary', 'Origin');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.sendStatus(204);
    }

    next();
});

app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error: ', err));

app.get('/', (req, res) => {
    console.log('[GET /] hit');
    res.send('Personal Notes API is running!');
});

app.get('/api/auth', (req, res) => {
    console.log('[GET /api/auth] hit');
    const frontendOrigin = allowedOrigins[0] || 'http://localhost:5173';

    res.status(200).json({
        message: 'Authentication API',
        frontendLoginUrl: `${frontendOrigin}/login`,
        endpoints: {
            register: 'POST /api/auth/register',
            login: 'POST /api/auth/login'
        }
    });
});

app.post('/api/notes', authMiddleware, async(req, res) => {
    try {
        console.log('[POST /api/notes] hit by user:', req.user.id);
        const { title, content, tags } = req.body;

        if (!title || !content) {
            console.log('[POST /api/notes] validation failed: title or content missing');
            return res.status(400).json({ error: 'Title and content are required. '});
        }

        const newNote = await Note.create({
            title,
            content,
            tags: tags || [],
            user: req.user.id,
        });

        console.log('[POST /api/notes] note created:', newNote._id);
        res.status(201).json(newNote);
    } catch (err) {
        console.error('Error creating note: ', err);
        res.status(500).json({ error: 'Server error while creating note.' });
    }
});

app.post('/api/auth/register', async (req, res) => {
    try {
        console.log('[POST /api/auth/register] hit');
        const { username, email, password } = req.body;
        console.log('[POST /api/auth/register] email:', email);

        if (!username || !email || !password) {
            console.log('[POST /api/auth/register] validation failed: missing fields');
            return res.status(400).json({ error: 'All fields are required.' });
        }

        const exists = await User.findOne({ email });
        if (exists) {
            console.log('[POST /api/auth/register] email already exists:', email);
            return res.status(400).json({ error: 'Email already in use.' });
        }

        const user = new User({ username, email, password });
        await user.save();
        console.log('[POST /api/auth/register] user created successfully');
        res.status(201).json({ message: 'User created successfully.' });
    } catch (err) {
        console.error('Error registering: ', err);
        res.status(500).json({ error: 'Server error during registration.'});
    }
});

app.get('/api/auth/register', (req, res) => {
    console.log('[GET /api/auth/register] hit - returning 405');
    res.status(405).json({
        error: 'Method not allowed. Use POST /api/auth/register with JSON body: { "username": "...", "email": "...", "password": "..." }.'
    });
});

app.post('/api/auth/login', async (req, res) => {
    try {
        console.log('[login] route hit');
        console.log('[login] body:', req.body);

        const { email, password } = req.body;
        console.log('[login] email:', email);
        console.log('[login] password length:', password ? password.length : 0);

        const user = await User.findOne({ email });
        console.log('[login] user found:', !!user);
        if (user) {
            console.log('[login] user id:', user._id);
            console.log('[login] user email:', user.email);
        }

        if (!user) {
            console.log('[login] failed: user not found');
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        const passwordMatch = await user.comparePassword(password);
        console.log('[login] password match:', passwordMatch);

        if (!passwordMatch) {
            console.log('[login] failed: wrong password');
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        const token = jwt.sign(
            { id: user._id, username: user.username, email: user.email },
            SECRET,
            { expiresIn: '7d' }
        );

        console.log('[login] token generated');
        res.json({ token });
    } catch (err) {
        console.error('[login] error:', err);
        res.status(500).json({ error: 'Server error during login.' });
    }
});


app.get('/api/notes', authMiddleware, async (req, res) => {
    try {
        console.log('[GET /api/notes] hit by user:', req.user.id);
        const { page = 1, limit = 10 } = req.query;
        const notes = await Note.find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit ));
        const total = await Note.countDocuments({ user: req.user.id} );

        console.log(`[GET /api/notes] returning ${notes.length} notes (total: ${total})`);
        res.json({
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / limit),
            notes
        });
    } catch (err) {
        console.error('Error fetching notes: ', err);
        res.status(500).json({ error: 'Server error while fetching notes. '});
    }
});

app.get('/api/notes/search', authMiddleware, async(req, res) => {
    try {
        console.log('[GET /api/notes/search] hit by user:', req.user.id, 'query:', req.query);
        const { q, tag } = req.query;
        let query = { user: req.user.id};

        if (q) {
            query.$or = [
                { title: { $regex: q, $options: 'i' }},
                { content: { $regex: q, $options: 'i' }}
            ];
        }
        
        if (tag) {
            query.tags = { $in: [tag] };
        }

        const notes = await Note.find(query).sort({ updatedAt: -1 });

        console.log(`[GET /api/notes/search] found ${notes.length} notes`);
        res.json(notes);
    } catch (err) {
        console.error('Error searching notes:', err);
        res.status(500).json({ error: 'Server error while searching notes.' });
    }
});

app.get('/api/notes/:id', authMiddleware, async (req, res) => {
  try {
    console.log(`[GET /api/notes/${req.params.id}] hit by user:`, req.user.id);
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log(`[GET /api/notes/${id}] invalid ID format`);
      return res.status(400).json({ error: 'Invalid note ID format.' });
    }

    const note = await Note.findOne({
        _id: id,
        user: req.user.id
    });
    if (!note) {
      console.log(`[GET /api/notes/${id}] note not found`);
      return res.status(404).json({ error: 'Note not found.' });
    }
    res.json(note);
  } catch (err) {
    console.error('Error fetching note: ', err);
    res.status(500).json({ error: 'Server error while fetching the note.' });
  }
});


app.put('/api/notes/:id', authMiddleware, async (req, res) => {
    try {
        console.log(`[PUT /api/notes/${req.params.id}] hit by user:`, req.user.id);
        const { id } = req.params;
        const { title, content, tags } = req.body;

        if (!title && !content && !tags) {
            console.log(`[PUT /api/notes/${id}] no update data provided`);
            return res.status(400).json({ error: 'Title or content must be provided.' });
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            console.log(`[PUT /api/notes/${id}] invalid ID format`);
            return res.status(400).json({ error: 'Invalid note ID format.' });
        }

        const updatedNote = await Note.findOneAndUpdate(
            { _id: id, user: req.user.id },
            { title, content, tags },
            { new: true, runValidators: true }
        );

        if (!updatedNote) {
            console.log(`[PUT /api/notes/${id}] note not found or not owned by user`);
            return res.status(404).json({ error: 'Note not found.' });
        }

        console.log(`[PUT /api/notes/${id}] note updated successfully`);
        res.json(updatedNote);
    } catch (err) {
        console.error('Error updating note: ', err);
        res.status(500).json({ error: 'Server error while updating the note.' });
    }
});

app.delete('/api/notes/:id', authMiddleware, async(req, res) => {
    try {
        console.log(`[DELETE /api/notes/${req.params.id}] hit by user:`, req.user.id);
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            console.log(`[DELETE /api/notes/${id}] invalid ID format`);
            return res.status(400).json({ error: 'Invalid note ID format.' });
        }

        const deletedNote = await Note.findOneAndDelete({ _id: id, user: req.user.id });

        if (!deletedNote) {
            console.log(`[DELETE /api/notes/${id}] note not found or not owned by user`);
            return res.status(404).json({ error: 'Note not found.' });
        }

        console.log(`[DELETE /api/notes/${id}] note deleted successfully`);
        res.json({ message: 'Note deleted successfully. '});
    } catch (err) {
        console.error('Error deleting note: ', err);
        res.status(500).json({ error: 'Server error while deleting the note. '});
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
