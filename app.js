const express = require('express')
const app = express()
const port = 3000
const jwt = require("jsonwebtoken")
const fs = require('fs')
const path =require('path')
const env = require("dotenv")
const Pool = require('pg').Pool;
const bcrypt = require("bcrypt")

const privateKey = fs.readFileSync(path.join(__dirname, 'keys', 'jwtRS256.key'));
const publicKey = fs.readFileSync(path.join(__dirname, 'keys', 'jwtRS256.key.pub'));

app.use(express.static("frontend/build"))

app.use(express.json());

const cors = require('cors');

// Add this middleware to allow cross-origin requests

app.options('/categories', (req, res) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3001');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Action');
    res.header('Access-Control-Allow-Methods', '*'); // Allow all methods
    res.header('Access-Control-Allow-Credentials', 'true');
    res.send();
  });


app.use(cors());

env.config()

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  ssl: {
    rejectUnauthorized: false
  }  
});


app.get('/all-users', (req, res) => {
    // Define the query to fetch all data from the users table
    const query = 'SELECT * FROM users';

    // Execute the query
    pool.query(query, (err, result) => {
        if (err) {
            // Handle error (for example, by sending a response indicating a server error)
            console.error('Error fetching data from users table:', err);
            res.status(500).json({ error: 'Failed to fetch data' });
        } else {
            // Return the fetched data as a JSON response
            res.json(result.rows);
        }
    });
});

app.get('/all-notes', (req, res) => {
    // Define the query to fetch all data from the users table
    const query = 'SELECT * FROM notes';

    // Execute the query
    pool.query(query, (err, result) => {
        if (err) {
            // Handle error (for example, by sending a response indicating a server error)
            console.error('Error fetching data from users table:', err);
            res.status(500).json({ error: 'Failed to fetch data' });
        } else {
            // Return the fetched data as a JSON response
            res.json(result.rows);
        }
    });
});

app.get('/all-categories', (req, res) => {
    // Define the query to fetch all data from the users table
    const query = 'SELECT * FROM categories';

    // Execute the query
    pool.query(query, (err, result) => {
        if (err) {
            // Handle error (for example, by sending a response indicating a server error)
            console.error('Error fetching data from users table:', err);
            res.status(500).json({ error: 'Failed to fetch data' });
        } else {
            // Return the fetched data as a JSON response
            res.json(result.rows);
        }
    });
});


app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Ensure username and password are provided
        if (!username || !password) {
            return res.status(400).send('Both username and password are required.');
        }

        const result = await pool.query("SELECT user_id, username, email, user_avatar, password FROM users WHERE username = $1", [username]);
        const user = result.rows[0];

        if(!user) {
            return res.status(400).send({error: "username", message: 'Invalid username or password.'});
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) {
            return res.status(400).send({error: "password", message: 'Invalid username or password.'});
        }

        // Retrieve user's notes along with the category name
        const queryNotes = `
            SELECT n.note_id, n.title, n.content, n.last_update, c.name AS category_name
            FROM notes n
            JOIN user_notes un ON n.note_id = un.note_id
            LEFT JOIN categories c ON n.category_id = c.category_id
            WHERE un.user_id = $1
        `;
        const notesResult = await pool.query(queryNotes, [user.user_id]);

        // Assuming you're getting `rememberMe` value from req.body
        const rememberMe = req.body.rememberMe;
        const expiresIn = rememberMe ? '7d' : '1h';

        const payload = { userId: user.user_id };
        const token = jwt.sign(payload, privateKey, { algorithm: 'RS256', expiresIn: expiresIn });

        // User data to send back (without sensitive information like the password)
        const userData = {
            userId: user.user_id,
            username: user.username,
            email: user.email,
            userAvatar: user.user_avatar
        };

        // Send token, user's notes, and user data
        res.status(200).send({ token, notes: notesResult.rows, user: userData });

    } catch(err) {
        console.error("Error during login:", err);
        res.status(500).send("Internal server error.");
    }
});








app.post('/register', async (req, res) => {
    try {
        const { username, password, email, avatarURL } = req.body;

        // Check if the username already exists
        const userExists = await pool.query("SELECT user_id FROM users WHERE username = $1", [username]);
        if (userExists.rows.length) {
            return res.status(400).send({ 
                error: 'username',
                message: 'Username already exists.' 
            });
        }

        // Check if the email already exists
        const emailExists = await pool.query("SELECT user_id FROM users WHERE email = $1", [email]);
        if (emailExists.rows.length) {
            return res.status(400).send({ 
                error: 'email',
                message: 'Email already in use.' 
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await pool.query("INSERT INTO users (username, password, email, user_avatar) VALUES ($1, $2, $3, $4)", [username, hashedPassword, email, avatarURL]);

        res.status(201).send({ message: "Registration successful!" });

    } catch (err) {
        console.error("Error during registration:", err);
        res.status(500).send("Internal server error.");
    }
});


async function validateJWT(req, res, next) {
    console.log(req.headers)
    const token = req.headers.authorization;
    
    if (!token) {
        return res.status(401).json({ error: 'Token not provided' });
    }

    try {
        const decoded = jwt.verify(token, publicKey, { algorithms: ['RS256'] });
        
        // Validate that the user exists
        const userQueryResult = await pool.query('SELECT * FROM users WHERE user_id = $1', [decoded.userId]);
        if (userQueryResult.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid token: user does not exist' });
        }
        
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
}



//following methods still have to be checked

app.get('/users/me', validateJWT, async (req, res) => {
    try {
        const userId = req.user.userId;  // Extract from JWT payload
        const result = await pool.query("SELECT user_id, username, email, user_avatar FROM users WHERE user_id = $1", [userId]);
        const userProfile = result.rows[0];
        
        if (!userProfile) {
            return res.status(404).send('User not found.');
        }

        res.status(200).send(userProfile);
    } catch(err) {
        console.error("Error fetching user profile:", err);
        res.status(500).send("Internal server error.");
    }
});
///////////////////////////////////////////////////////////////////have to change this to include password as well
app.put('/users/me', validateJWT, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { username, email, user_avatar, password } = req.body; // Assuming these are the fields the user can update

        // Check if the username and email already exist for another user
        const userExists = await pool.query("SELECT user_id FROM users WHERE (username = $1 OR email = $2) AND user_id != $3", [username, email, userId]);
        if (userExists.rows.length) {
            return res.status(400).send({ 
                message: 'Username or email already exists for another user.' 
            });
        }

        // Salt and hash the new password
        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            "UPDATE users SET username = $1, email = $2, user_avatar = $3, password = $4 WHERE user_id = $5 RETURNING user_id, username, email, user_avatar", 
            [username, email, user_avatar, hashedPassword, userId]
        );

        const updatedProfile = result.rows[0];

        if (!updatedProfile) {
            return res.status(404).send('User not found.');
        }

        res.status(200).send(updatedProfile);
    } catch(err) {
        console.error("Error updating user profile:", err);
        res.status(500).send("Internal server error.");
    }
});


app.delete('/users/me', validateJWT, async (req, res) => {
    try {
        const userId = req.user.userId;

        // Begin a transaction
        await pool.query('BEGIN');

        // Delete associations with notes in user_notes first to maintain referential integrity
        await pool.query("DELETE FROM user_notes WHERE user_id = $1", [userId]);

        // Delete notes that are no longer associated with any user, if needed
        // This assumes that a note without a user is not needed - adjust accordingly
        await pool.query("DELETE FROM notes WHERE note_id NOT IN (SELECT note_id FROM user_notes)");

        // Delete the user
        const result = await pool.query("DELETE FROM users WHERE user_id = $1 RETURNING user_id", [userId]);

        const deletedUser = result.rows[0];
        
        if (!deletedUser) {
            await pool.query('ROLLBACK');
            return res.status(404).send('User not found.');
        }

        // If everything is successful, commit the transaction
        await pool.query('COMMIT');

        res.status(200).send({ message: 'User and associated notes deleted successfully.' });
    } catch(err) {
        // If an error occurs, rollback any changes and log the error
        await pool.query('ROLLBACK');
        console.error("Error deleting user and associated notes:", err);
        res.status(500).send("Internal server error.");
    }
});


app.get('/categories', async (req, res) => {
    try {
        const result = await pool.query("SELECT category_id, name FROM categories");
        res.status(200).send(result.rows);
    } catch(err) {
        console.error("Error fetching categories:", err);
        res.status(500).send("Internal server error.");
    }
});

app.post('/categories', validateJWT, async (req, res) => {
    console.log('Request Headers:', req.headers);
    console.log ('Body:', req.body)
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).send('Category name is required.');
        }

        // Check if the category already exists
        const existingCategory = await pool.query("SELECT * FROM categories WHERE name = $1", [name]);
        if (existingCategory.rows.length > 0) {
            return res.status(400).send('Category name already exists.');
        }

        // Insert the new category
        const result = await pool.query("INSERT INTO categories (name) VALUES ($1) RETURNING category_id, name", [name]);
        res.status(201).send(result.rows[0]);
    } catch(err) {
        console.error("Error creating category:", err);
        res.status(500).send("Internal server error.");
    }
});


app.put('/categories/:categoryId', validateJWT, async (req, res) => {
    try {
        const { name } = req.body;
        const { categoryId } = req.params;

        if (!name) {
            return res.status(400).send('Category name is required.');
        }

        const result = await pool.query("UPDATE categories SET name = $1 WHERE category_id = $2 RETURNING category_id, name", [name, categoryId]);

        const updatedCategory = result.rows[0];
        
        if (!updatedCategory) {
            return res.status(404).send('Category not found.');
        }

        res.status(200).send(updatedCategory);
    } catch(err) {
        console.error("Error updating category:", err);
        res.status(500).send("Internal server error.");
    }
});

app.delete('/categories/:categoryId', validateJWT, async (req, res) => {
    try {
        const { categoryId } = req.params;

        // Begin a transaction
        await pool.query('BEGIN');

        // Delete notes associated with the category
        await pool.query("DELETE FROM notes WHERE category_id = $1", [categoryId]);

        // Delete the category
        const result = await pool.query("DELETE FROM categories WHERE category_id = $1 RETURNING category_id", [categoryId]);

        const deletedCategory = result.rows[0];

        if (!deletedCategory) {
            // If category not found, rollback any changes and send a 404 response
            await pool.query('ROLLBACK');
            return res.status(404).send('Category not found.');
        }

        // If everything is successful, commit the transaction
        await pool.query('COMMIT');

        res.status(200).send({ message: 'Category and associated notes deleted successfully.' });

    } catch(err) {
        // If an error occurs, rollback any changes and log the error
        await pool.query('ROLLBACK');
        console.error("Error deleting category and associated notes:", err);
        res.status(500).send("Internal server error.");
    }
});


app.get('/notes', validateJWT, async (req, res) => { 
    try {
        const userId = req.user.userId;
        const { categoryId } = req.query;

        let query = `
            SELECT n.note_id, n.title, n.content, n.last_update, c.name AS category_name
            FROM notes n
            JOIN user_notes un ON n.note_id = un.note_id
            LEFT JOIN categories c ON n.category_id = c.category_id
            WHERE un.user_id = $1
        `;
        const queryParams = [userId];

        if (categoryId) {
            query += ` AND c.category_id = $2`;
            queryParams.push(categoryId);
        }

        query += ` ORDER BY n.last_update DESC`;

        const result = await pool.query(query, queryParams);

        res.status(200).send(result.rows);
    } catch(err) {
        console.error("Error fetching notes:", err);
        res.status(500).send("Internal server error.");
    }
});
app.post('/share-note', validateJWT, async (req, res) => {
    try {
        const userId = req.user.userId; // Assumed your validateJWT middleware sets the decoded payload to req.user
        const { noteId, sharedWithUserId } = req.body;

        // Ensure the noteId belongs to the authenticated user
        const userNote = await pool.query("SELECT * FROM user_notes WHERE note_id = $1 AND user_id = $2", [noteId, userId]);
        if (!userNote.rows.length) {
            return res.status(403).send('You are not authorized to share this note.');
        }

        // Check if the note is already shared with the other user
        const existingShare = await pool.query("SELECT * FROM user_notes WHERE note_id = $1 AND user_id = $2", [noteId, sharedWithUserId]);
        if (existingShare.rows.length) {
            return res.status(400).send('Note is already shared with the specified user.');
        }

        // Insert the new sharing entry
        await pool.query("INSERT INTO user_notes (user_id, note_id) VALUES ($1, $2)", [sharedWithUserId, noteId]);

        res.status(200).send('Note shared successfully.');

    } catch(err) {
        console.error("Error sharing note:", err);
        res.status(500).send("Internal server error.");
    }
});

app.post('/notes', validateJWT, async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const { title, content, category, last_update} = req.body;
        const userId = req.user.userId;

        // Retrieve category_id using the provided category name
        const categoryResult = await client.query("SELECT category_id FROM categories WHERE name = $1", [category]);
        const categoryData = categoryResult.rows[0];

        if (!categoryData) {
            return res.status(400).send({message: 'Category not found.'});
        }

        const categoryId = categoryData.category_id;

        // Insert the note using the retrieved category_id
        const noteResult = await client.query("INSERT INTO notes (title, content, category_id, last_update) VALUES ($1, $2, $3, $4) RETURNING note_id", [title, content, categoryId, last_update]);
        
        const noteId = noteResult.rows[0].note_id;

        // Associate the note with the user
        await client.query("INSERT INTO user_notes (user_id, note_id) VALUES ($1, $2)", [userId, noteId]);

        await client.query('COMMIT');

        res.status(201).send({ noteId });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Error creating note:", err);
        res.status(500).send("Internal server error.");
    } finally {
        client.release();
    }
});


app.put('/notes/:noteId', validateJWT, async (req, res) => {
    try {
        const { title, content} = req.body;
        const { noteId } = req.params;
        const userId = req.user.userId;

        // Check if the user has access to the note
        const accessResult = await pool.query("SELECT 1 FROM user_notes WHERE note_id = $1 AND user_id = $2", [noteId, userId]);

        if (!accessResult.rows.length) {
            return res.status(403).send('Access denied.');
        }

        const result = await pool.query("UPDATE notes SET title = $1, content = $2 WHERE note_id = $3 RETURNING note_id, title, content, category_id", [title, content, noteId]);

        const updatedNote = result.rows[0];

        if (!updatedNote) {
            return res.status(404).send('Note not found.');
        }

        res.status(200).send(updatedNote);
    } catch(err) {
        console.error("Error updating note:", err);
        res.status(500).send("Internal server error.");
    }
});

app.delete('/notes/:noteId', validateJWT, async (req, res) => {
    try {
        const { noteId } = req.params;
        const userId = req.user.userId;

        // Check if the user has access to the note
        const accessResult = await pool.query("SELECT 1 FROM user_notes WHERE note_id = $1 AND user_id = $2", [noteId, userId]);

        if (!accessResult.rows.length) {
            return res.status(403).send('Access denied.');
        }

        const result = await pool.query("DELETE FROM notes WHERE note_id = $1 RETURNING note_id", [noteId]);

        const deletedNote = result.rows[0];

        if (!deletedNote) {
            return res.status(404).send('Note not found.');
        }

        res.status(200).send({ message: 'Note deleted successfully.' });
    } catch(err) {
        console.error("Error deleting note:", err);
        res.status(500).send("Internal server error.");
    }
});


app.use('/', express.static("./"))

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
