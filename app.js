const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');
const app = express();
const PORT = 5000;

// Middleware
app.use(cors({
    origin: "*",
    credentials: true
}));

app.use(express.json({ limit: '50mb' }));

// Path to data files
const usersFilePath = path.join(__dirname, 'data', 'users.json');
const roomsFilePath = path.join(__dirname, 'data', 'rooms.json');
const profilesFilePath = path.join(__dirname, 'data', 'profiles.json');
const roommatesFilePath = path.join(__dirname, 'data', 'roommates.json');
const statsFilePath = path.join(__dirname, 'data', 'stats.json');

// Ensure data directory exists
async function ensureDataDirectory() {
    const dataDir = path.join(__dirname, 'data');
    try {
        await fs.access(dataDir);
    } catch {
        await fs.mkdir(dataDir);
    }
}

// Helper function to read JSON file
async function readJSONFile(filePath, defaultValue = []) {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return defaultValue;
    }
}

// Helper function to write JSON file
async function writeJSONFile(filePath, data) {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

// Initialize data files
async function initializeDataFiles() {
    await ensureDataDirectory();

    const files = [
        usersFilePath,
        profilesFilePath,
        roomsFilePath,
        roommatesFilePath,
        statsFilePath
    ];

    for (const file of files) {
        try {
            await fs.access(file);
        } catch {
            if (file === statsFilePath) {
                await writeJSONFile(file, {
                    totalVisits: 0,
                    todayVisits: 0,
                    lastReset: new Date().toISOString().split('T')[0],
                    visitsByDay: {}
                });
            } else {
                await writeJSONFile(file, []);
            }
        }
    }
}
initializeDataFiles();

// Middleware to track visits
app.use(async (req, res, next) => {
    if (!req.path.startsWith('/api/')) {
        try {
            const stats = await readJSONFile(statsFilePath, {
                totalVisits: 0,
                todayVisits: 0,
                lastReset: new Date().toISOString().split('T')[0],
                visitsByDay: {}
            });

            const today = new Date().toISOString().split('T')[0];

            if (stats.lastReset !== today) {
                stats.todayVisits = 0;
                stats.lastReset = today;
            }

            stats.totalVisits = (stats.totalVisits || 0) + 1;
            stats.todayVisits = (stats.todayVisits || 0) + 1;
            stats.visitsByDay[today] = (stats.visitsByDay[today] || 0) + 1;

            await writeJSONFile(statsFilePath, stats);
        } catch (error) {
            console.error('Error tracking visit:', error);
        }
    }
    next();
});

/* ==================== USER AUTH ENDPOINTS ==================== */

// Register endpoint
app.post('/api/register', async (req, res) => {
    try {
        const { name, email, password, user_type } = req.body;

        const users = await readJSONFile(usersFilePath);

        const existingUser = users.find(u => u.email === email);
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const newUser = {
            id: Date.now().toString(),
            name,
            email,
            password,
            user_type: user_type || 'seeker',
            created_at: new Date().toISOString(),
            status: 'active'
        };

        users.push(newUser);
        await writeJSONFile(usersFilePath, users);

        const { password: _, ...userWithoutPassword } = newUser;
        res.status(201).json(userWithoutPassword);

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Server error during registration' });
    }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
    try {
        const { email, password, loginType } = req.body;

        const users = await readJSONFile(usersFilePath);

        const user = users.find(u => u.email === email && u.password === password);

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const userTypeMap = {
            seeker: 'seeker',
            recruiter: 'recruiter',
            admin: 'admin'
        };

        if (user.user_type !== userTypeMap[loginType]) {
            return res.status(401).json({ error: 'Invalid user type' });
        }

        const { password: _, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error during login' });
    }
});

// Get all users (for admin)
app.get('/api/users', async (req, res) => {
    try {
        const { role } = req.query;
        const users = await readJSONFile(usersFilePath);
        let filteredUsers = users.map(({ password, ...user }) => user);

        if (role) {
            filteredUsers = filteredUsers.filter(u => u.user_type === role);
        }

        res.json(filteredUsers);
    } catch (error) {
        console.error('Error reading users:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get single user by ID
app.get('/api/users/:id', async (req, res) => {
    try {
        const users = await readJSONFile(usersFilePath);
        const user = users.find(u => u.id == req.params.id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const { password, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update user name
app.put('/api/users/:id', async (req, res) => {
    try {
        const users = await readJSONFile(usersFilePath);
        const index = users.findIndex(u => u.id == req.params.id);

        if (index === -1) {
            return res.status(404).json({ error: 'User not found' });
        }

        users[index] = { ...users[index], ...req.body, updated_at: new Date().toISOString() };
        await writeJSONFile(usersFilePath, users);

        const { password, ...userWithoutPassword } = users[index];
        res.json(userWithoutPassword);
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete user (admin only)
app.delete('/api/users/:id', async (req, res) => {
    try {
        const users = await readJSONFile(usersFilePath);
        const filteredUsers = users.filter(u => u.id != req.params.id);

        if (filteredUsers.length === users.length) {
            return res.status(404).json({ error: 'User not found' });
        }

        await writeJSONFile(usersFilePath, filteredUsers);

        const profiles = await readJSONFile(profilesFilePath);
        const filteredProfiles = profiles.filter(p => p.user_id != req.params.id);
        await writeJSONFile(profilesFilePath, filteredProfiles);

        const rooms = await readJSONFile(roomsFilePath);
        const filteredRooms = rooms.filter(r => r.user_id != req.params.id);
        await writeJSONFile(roomsFilePath, filteredRooms);

        const roommates = await readJSONFile(roommatesFilePath);
        const filteredRoommates = roommates.filter(r => r.user_id != req.params.id);
        await writeJSONFile(roommatesFilePath, filteredRoommates);

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

/* ==================== PROFILE ENDPOINTS - SIMPLIFIED ==================== */

// GET user profile by user_id - Simplified version
app.get('/api/profile', async (req, res) => {
    try {
        const { user_id } = req.query;

        if (!user_id) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        console.log(`📊 Fetching profile for user_id: ${user_id}`);

        const users = await readJSONFile(usersFilePath);
        const profiles = await readJSONFile(profilesFilePath);
        const rooms = await readJSONFile(roomsFilePath);
        const roommates = await readJSONFile(roommatesFilePath);

        const user = users.find(u => u.id == user_id);
        if (!user) {
            console.log(`❌ User not found with ID: ${user_id}`);
            return res.status(404).json({ error: 'User not found' });
        }

        console.log(`✅ User found: ${user.name} (${user.user_type})`);

        const profile = profiles.find(p => p.user_id == user_id) || {};
        const userRooms = rooms.filter(r => r.user_id == user_id) || [];
        const userRoommates = roommates.filter(r => r.user_id == user_id) || [];

        // Prepare simplified response with all fields
        const response = {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.user_type,
                created_at: user.created_at
            },
            profile: {
                // Basic Info
                first_name: profile.first_name || '',
                last_name: profile.last_name || '',
                phone: profile.phone || '',
                location: profile.location || '',
                
                // Personal
                gender: profile.gender || '',
                age: profile.age || '',
                occupation: profile.occupation || '',
                bio: profile.bio || '',
                
                // Lifestyle
                food_preference: profile.food_preference || 'Vegetarian',
                sleep_schedule: profile.sleep_schedule || 'Flexible',
                work_type: profile.work_type || 'Office',
                smoking: profile.smoking || 'No',
                drinking: profile.drinking || 'No',
                
                // Preferences
                preferred_gender: profile.preferred_gender || 'Any',
                max_budget: profile.max_budget || '',
                preferred_cities: profile.preferred_cities || [],
                move_in_date: profile.move_in_date || '',
                
                // Interests
                interests: profile.interests || [],
                
                // Metadata
                created_at: profile.created_at || '',
                updated_at: profile.updated_at || ''
            },
            userRooms: userRooms.map(room => ({
                id: room.id,
                title: room.title,
                city: room.city,
                price: room.price,
                type: room.type,
                images: room.images,
                status: room.status,
                postedDate: room.postedDate,
                views: room.views,
                user_id: room.user_id
            })),
            userRoommates: userRoommates.map(rm => ({
                id: rm.id,
                name: rm.name,
                age: rm.age,
                city: rm.city,
                occupation: rm.occupation,
                budget: rm.budget,
                images: rm.images,
                verified: rm.verified,
                postedDate: rm.postedDate,
                views: rm.views,
                user_id: rm.user_id,
                food: rm.food,
                sleep: rm.sleep,
                workType: rm.workType,
                interests: rm.interests
            }))
        };

        console.log(`✅ Profile data sent for ${user.name}`);
        res.json(response);

    } catch (error) {
        console.error('❌ Error fetching profile:', error);
        res.status(500).json({
            error: 'Server error while fetching profile',
            details: error.message
        });
    }
});

// Create or update profile - Simplified version
app.post('/api/profile', async (req, res) => {
    try {
        const profiles = await readJSONFile(profilesFilePath);
        const profileData = req.body;
        const { user_id } = profileData;

        if (!user_id) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        const existingIndex = profiles.findIndex(p => p.user_id == user_id);

        const newProfile = {
            ...profileData,
            user_id,
            updated_at: new Date().toISOString(),
            created_at: existingIndex === -1 ? new Date().toISOString() : profiles[existingIndex].created_at
        };

        if (existingIndex !== -1) {
            profiles[existingIndex] = newProfile;
        } else {
            profiles.push(newProfile);
        }

        await writeJSONFile(profilesFilePath, profiles);

        res.json({
            message: 'Profile saved successfully',
            profile: newProfile
        });

    } catch (error) {
        console.error('Error saving profile:', error);
        res.status(500).json({ error: 'Failed to save profile' });
    }
});

// Delete profile
app.delete('/api/profile/delete', async (req, res) => {
    try {
        const { user_id } = req.body;

        const profiles = await readJSONFile(profilesFilePath);
        const filteredProfiles = profiles.filter(p => p.user_id != user_id);
        await writeJSONFile(profilesFilePath, filteredProfiles);

        const rooms = await readJSONFile(roomsFilePath);
        const filteredRooms = rooms.filter(r => r.user_id != user_id);
        await writeJSONFile(roomsFilePath, filteredRooms);

        const roommates = await readJSONFile(roommatesFilePath);
        const filteredRoommates = roommates.filter(r => r.user_id != user_id);
        await writeJSONFile(roommatesFilePath, filteredRoommates);

        const users = await readJSONFile(usersFilePath);
        const filteredUsers = users.filter(u => u.id != user_id);
        await writeJSONFile(usersFilePath, filteredUsers);

        res.json({ message: 'Profile deleted successfully' });
    } catch (error) {
        console.error('Error deleting profile:', error);
        res.status(500).json({ error: 'Failed to delete profile' });
    }
});

/* ==================== ROOM ENDPOINTS ==================== */

// POST a new room - with auto-fill from profile
app.post('/api/rooms', async (req, res) => {
    try {
        const rooms = await readJSONFile(roomsFilePath);
        const { user_id } = req.body;

        const profiles = await readJSONFile(profilesFilePath);
        const userProfile = profiles.find(p => p.user_id == user_id) || {};

        const newRoom = {
            ...req.body,
            id: Date.now().toString(),
            postedDate: new Date().toISOString(),
            availableFrom: req.body.availableFrom || new Date().toISOString().split('T')[0],
            views: 0,
            status: 'active',
            owner: {
                name: req.body.owner?.name || `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim() || 'Owner',
                phone: req.body.owner?.phone || userProfile.phone || '',
                email: req.body.owner?.email || req.body.email || '',
                whatsapp: req.body.owner?.whatsapp || userProfile.phone || ''
            }
        };

        rooms.push(newRoom);
        await writeJSONFile(roomsFilePath, rooms);

        res.status(201).json({
            message: 'Room posted successfully',
            room: newRoom
        });

    } catch (error) {
        console.error('Error posting room:', error);
        res.status(500).json({ error: 'Failed to post room' });
    }
});

// GET all rooms with filters
app.get('/api/rooms', async (req, res) => {
    try {
        const rooms = await readJSONFile(roomsFilePath);
        const { user_id, city, type, minPrice, maxPrice } = req.query;

        let filteredRooms = [...rooms];

        if (user_id) {
            filteredRooms = filteredRooms.filter(r => r.user_id == user_id);
        }

        if (city) {
            filteredRooms = filteredRooms.filter(r =>
                r.city?.toLowerCase() === city.toLowerCase()
            );
        }

        if (type) {
            filteredRooms = filteredRooms.filter(r =>
                r.type?.toLowerCase() === type.toLowerCase()
            );
        }

        if (minPrice) {
            filteredRooms = filteredRooms.filter(r => r.price >= parseInt(minPrice));
        }

        if (maxPrice) {
            filteredRooms = filteredRooms.filter(r => r.price <= parseInt(maxPrice));
        }

        res.json(filteredRooms);
    } catch (error) {
        console.error('Error fetching rooms:', error);
        res.status(500).json({ error: 'Failed to fetch rooms' });
    }
});

// GET a single room by ID
app.get('/api/rooms/:id', async (req, res) => {
    try {
        const rooms = await readJSONFile(roomsFilePath);
        const room = rooms.find(r => r.id == req.params.id);

        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }

        room.views = (room.views || 0) + 1;
        await writeJSONFile(roomsFilePath, rooms);

        res.json(room);
    } catch (error) {
        console.error('Error fetching room:', error);
        res.status(500).json({ error: 'Failed to fetch room' });
    }
});

// UPDATE a room
app.put('/api/rooms/:id', async (req, res) => {
    try {
        const rooms = await readJSONFile(roomsFilePath);
        const index = rooms.findIndex(r => r.id == req.params.id);

        if (index === -1) {
            return res.status(404).json({ error: 'Room not found' });
        }

        if (rooms[index].user_id != req.body.user_id) {
            const users = await readJSONFile(usersFilePath);
            const user = users.find(u => u.id == req.body.user_id);
            if (!user || user.user_type !== 'admin') {
                return res.status(403).json({ error: 'Unauthorized to update this room' });
            }
        }

        const updatedRoom = {
            ...rooms[index],
            ...req.body,
            id: rooms[index].id,
            user_id: rooms[index].user_id,
            postedDate: rooms[index].postedDate,
            views: rooms[index].views,
            updatedAt: new Date().toISOString()
        };

        rooms[index] = updatedRoom;
        await writeJSONFile(roomsFilePath, rooms);

        res.json({
            message: 'Room updated successfully',
            room: updatedRoom
        });
    } catch (error) {
        console.error('Error updating room:', error);
        res.status(500).json({ error: 'Failed to update room' });
    }
});

// DELETE a room
app.delete('/api/rooms/:id', async (req, res) => {
    try {
        const rooms = await readJSONFile(roomsFilePath);
        const { user_id } = req.body;

        const room = rooms.find(r => r.id == req.params.id);

        if (room && room.user_id != user_id) {
            const users = await readJSONFile(usersFilePath);
            const user = users.find(u => u.id == user_id);
            if (user.user_type !== 'admin') {
                return res.status(403).json({ error: 'Unauthorized to delete this room' });
            }
        }

        const filteredRooms = rooms.filter(r => r.id != req.params.id);

        if (filteredRooms.length === rooms.length) {
            return res.status(404).json({ error: 'Room not found' });
        }

        await writeJSONFile(roomsFilePath, filteredRooms);
        res.json({ message: 'Room deleted successfully' });
    } catch (error) {
        console.error('Error deleting room:', error);
        res.status(500).json({ error: 'Failed to delete room' });
    }
});

/* ==================== ROOMMATE PROFILE ENDPOINTS ==================== */

// POST a new roommate profile - with auto-fill from profile
app.post('/api/roommates', async (req, res) => {
    try {
        const roommates = await readJSONFile(roommatesFilePath);
        const { user_id } = req.body;

        const profiles = await readJSONFile(profilesFilePath);
        const userProfile = profiles.find(p => p.user_id == user_id) || {};

        const newRoommate = {
            ...req.body,
            id: Date.now().toString(),
            postedDate: new Date().toISOString(),
            availableFrom: req.body.availableFrom || new Date().toISOString().split('T')[0],
            views: 0,
            verified: false,
            status: 'active',
            name: req.body.name || `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim() || 'User',
            age: req.body.age || userProfile.age || '',
            gender: req.body.gender || userProfile.gender || '',
            occupation: req.body.occupation || userProfile.occupation || '',
            city: req.body.city || userProfile.location || '',
            budget: req.body.budget || userProfile.max_budget || '',
            phone: req.body.phone || userProfile.phone || '',
            email: req.body.email || '',
            food: req.body.food || userProfile.food_preference || 'Vegetarian',
            sleep: req.body.sleep || userProfile.sleep_schedule || 'Flexible',
            workType: req.body.workType || userProfile.work_type || 'Office',
            about: req.body.about || userProfile.bio || '',
            interests: req.body.interests || userProfile.interests || []
        };

        roommates.push(newRoommate);
        await writeJSONFile(roommatesFilePath, roommates);

        res.status(201).json({
            message: 'Roommate profile created successfully',
            roommate: newRoommate
        });

    } catch (error) {
        console.error('Error creating roommate profile:', error);
        res.status(500).json({ error: 'Failed to create profile' });
    }
});

// GET all roommate profiles with filters
app.get('/api/roommates', async (req, res) => {
    try {
        const roommates = await readJSONFile(roommatesFilePath);

        let filteredRoommates = [...roommates];

        const { user_id, city, gender, maxBudget, food, sleep, workType } = req.query;

        if (user_id) {
            filteredRoommates = filteredRoommates.filter(r => r.user_id == user_id);
        }

        if (city) {
            filteredRoommates = filteredRoommates.filter(r =>
                r.city?.toLowerCase() === city.toLowerCase()
            );
        }

        if (gender) {
            filteredRoommates = filteredRoommates.filter(r =>
                r.gender?.toLowerCase() === gender.toLowerCase()
            );
        }

        if (maxBudget) {
            filteredRoommates = filteredRoommates.filter(r =>
                r.budget <= parseInt(maxBudget)
            );
        }

        if (food) {
            filteredRoommates = filteredRoommates.filter(r =>
                r.food?.toLowerCase() === food.toLowerCase()
            );
        }

        if (sleep) {
            filteredRoommates = filteredRoommates.filter(r =>
                r.sleep?.toLowerCase() === sleep.toLowerCase()
            );
        }

        if (workType) {
            filteredRoommates = filteredRoommates.filter(r =>
                r.workType?.toLowerCase() === workType.toLowerCase()
            );
        }

        res.json(filteredRoommates);
    } catch (error) {
        console.error('Error fetching roommates:', error);
        res.status(500).json({ error: 'Failed to fetch roommates' });
    }
});

// GET a single roommate by ID
app.get('/api/roommates/:id', async (req, res) => {
    try {
        const roommates = await readJSONFile(roommatesFilePath);
        const roommate = roommates.find(r => r.id == req.params.id);

        if (!roommate) {
            return res.status(404).json({ error: 'Roommate not found' });
        }

        roommate.views = (roommate.views || 0) + 1;
        await writeJSONFile(roommatesFilePath, roommates);

        res.json(roommate);
    } catch (error) {
        console.error('Error fetching roommate:', error);
        res.status(500).json({ error: 'Failed to fetch roommate' });
    }
});

// UPDATE a roommate profile
app.put('/api/roommates/:id', async (req, res) => {
    try {
        const roommates = await readJSONFile(roommatesFilePath);
        const index = roommates.findIndex(r => r.id == req.params.id);

        if (index === -1) {
            return res.status(404).json({ error: 'Roommate not found' });
        }

        if (roommates[index].user_id != req.body.user_id) {
            const users = await readJSONFile(usersFilePath);
            const user = users.find(u => u.id == req.body.user_id);
            if (!user || user.user_type !== 'admin') {
                return res.status(403).json({ error: 'Unauthorized to update this profile' });
            }
        }

        const updatedProfile = {
            ...roommates[index],
            ...req.body,
            id: roommates[index].id,
            user_id: roommates[index].user_id,
            postedDate: roommates[index].postedDate,
            views: roommates[index].views,
            updatedAt: new Date().toISOString()
        };

        roommates[index] = updatedProfile;
        await writeJSONFile(roommatesFilePath, roommates);

        res.json({
            message: 'Profile updated successfully',
            roommate: updatedProfile
        });
    } catch (error) {
        console.error('Error updating roommate:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// DELETE a roommate profile
app.delete('/api/roommates/:id', async (req, res) => {
    try {
        const roommates = await readJSONFile(roommatesFilePath);
        const { user_id } = req.body;

        const roommate = roommates.find(r => r.id == req.params.id);

        if (roommate && roommate.user_id != user_id) {
            const users = await readJSONFile(usersFilePath);
            const user = users.find(u => u.id == user_id);
            if (user.user_type !== 'admin') {
                return res.status(403).json({ error: 'Unauthorized to delete this profile' });
            }
        }

        const filteredRoommates = roommates.filter(r => r.id != req.params.id);

        if (filteredRoommates.length === roommates.length) {
            return res.status(404).json({ error: 'Roommate not found' });
        }

        await writeJSONFile(roommatesFilePath, filteredRoommates);
        res.json({ message: 'Profile deleted successfully' });
    } catch (error) {
        console.error('Error deleting roommate:', error);
        res.status(500).json({ error: 'Failed to delete profile' });
    }
});

// Get filter options for roommates
app.get('/api/roommates/filters/options', async (req, res) => {
    try {
        const roommates = await readJSONFile(roommatesFilePath);

        const cities = [...new Set(roommates.map(r => r.city).filter(Boolean))];
        const genders = [...new Set(roommates.map(r => r.gender).filter(Boolean))];
        const foodPrefs = [...new Set(roommates.map(r => r.food).filter(Boolean))];
        const sleepPrefs = [...new Set(roommates.map(r => r.sleep).filter(Boolean))];
        const workTypes = [...new Set(roommates.map(r => r.workType).filter(Boolean))];

        res.json({
            cities,
            genders,
            foodPrefs,
            sleepPrefs,
            workTypes
        });
    } catch (error) {
        console.error('Error fetching filter options:', error);
        res.status(500).json({ error: 'Failed to fetch filter options' });
    }
});

/* ==================== MATCHING ALGORITHM ENDPOINT ==================== */

// GET compatible roommates based on user profile
// app.get('/api/matches/:userId', async (req, res) => {
//     try {
//         const { userId } = req.params;

//         const profiles = await readJSONFile(profilesFilePath);
//         const userProfile = profiles.find(p => p.user_id == userId);

//         if (!userProfile) {
//             return res.status(404).json({ error: 'User profile not found' });
//         }

//         const roommates = await readJSONFile(roommatesFilePath);

//         const matches = roommates
//             .filter(r => r.user_id != userId)
//             .map(roommate => {
//                 let score = 0;
//                 let reasons = [];

//                 // Location match (highest weight)
//                 if (roommate.city?.toLowerCase() === userProfile.location?.toLowerCase()) {
//                     score += 30;
//                     reasons.push("Same city");
//                 }

//                 // Budget match
//                 if (roommate.budget && userProfile.max_budget) {
//                     if (roommate.budget <= userProfile.max_budget) {
//                         score += 20;
//                         reasons.push("Within budget");
//                     }
//                 }

//                 // Gender preference match
//                 if (userProfile.preferred_gender === 'Any' ||
//                     roommate.gender?.toLowerCase() === userProfile.preferred_gender?.toLowerCase()) {
//                     score += 15;
//                     reasons.push("Gender preference matches");
//                 }

//                 // Food preference match
//                 if (roommate.food === userProfile.food_preference) {
//                     score += 10;
//                     reasons.push("Same food preference");
//                 }

//                 // Sleep schedule match
//                 if (roommate.sleep === userProfile.sleep_schedule) {
//                     score += 10;
//                     reasons.push("Same sleep schedule");
//                 }

//                 // Work type match
//                 if (roommate.workType === userProfile.work_type) {
//                     score += 5;
//                     reasons.push("Same work type");
//                 }

//                 // Interests match
//                 if (roommate.interests && userProfile.interests) {
//                     const commonInterests = roommate.interests.filter(i =>
//                         userProfile.interests.includes(i)
//                     ).length;
//                     score += commonInterests * 2;
//                     if (commonInterests > 0) {
//                         reasons.push(`${commonInterests} common interests`);
//                     }
//                 }

//                 return {
//                     ...roommate,
//                     compatibility: {
//                         score: Math.min(score, 100),
//                         reasons: reasons
//                     }
//                 };
//             })
//             .sort((a, b) => b.compatibility.score - a.compatibility.score)
//             .slice(0, 20);

//         res.json(matches);

//     } catch (error) {
//         console.error('Error finding matches:', error);
//         res.status(500).json({ error: 'Failed to find matches' });
//     }
// });

/* ==================== STATS ENDPOINTS ==================== */

// Get site statistics (admin only)
app.get('/api/stats', async (req, res) => {
    try {
        const stats = await readJSONFile(statsFilePath, {
            totalVisits: 0,
            todayVisits: 0,
            visitsByDay: {}
        });

        const users = await readJSONFile(usersFilePath);
        const rooms = await readJSONFile(roomsFilePath);
        const roommates = await readJSONFile(roommatesFilePath);

        const today = new Date().toISOString().split('T')[0];

        res.json({
            totalVisits: stats.totalVisits || 0,
            todayVisits: stats.todayVisits || 0,
            visitsByDay: stats.visitsByDay || {},
            todayVisitsCount: stats.visitsByDay?.[today] || 0,
            totalUsers: users.length,
            activeUsers: users.filter(u => u.status === 'active').length,
            totalRooms: rooms.length,
            totalRoommates: roommates.length,
            usersByRole: {
                seeker: users.filter(u => u.user_type === 'seeker').length,
                recruiter: users.filter(u => u.user_type === 'recruiter').length,
                admin: users.filter(u => u.user_type === 'admin').length
            }
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

/* ==================== ADMIN ENDPOINTS ==================== */

// Admin: Get all users with details
app.get('/api/admin/users', async (req, res) => {
    try {
        const users = await readJSONFile(usersFilePath);
        const profiles = await readJSONFile(profilesFilePath);
        const rooms = await readJSONFile(roomsFilePath);
        const roommates = await readJSONFile(roommatesFilePath);

        const usersWithDetails = users.map(user => {
            const profile = profiles.find(p => p.user_id == user.id) || {};
            const userRooms = rooms.filter(r => r.user_id == user.id);
            const userRoommates = roommates.filter(r => r.user_id == user.id);

            const { password, ...userWithoutPassword } = user;

            return {
                ...userWithoutPassword,
                profile: {
                    phone: profile.phone,
                    location: profile.location
                },
                stats: {
                    roomsCount: userRooms.length,
                    roommatesCount: userRoommates.length
                }
            };
        });

        res.json(usersWithDetails);
    } catch (error) {
        console.error('Error fetching admin users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Admin: Delete any room
app.delete('/api/admin/rooms/:id', async (req, res) => {
    try {
        const rooms = await readJSONFile(roomsFilePath);
        const filteredRooms = rooms.filter(r => r.id != req.params.id);

        if (filteredRooms.length === rooms.length) {
            return res.status(404).json({ error: 'Room not found' });
        }

        await writeJSONFile(roomsFilePath, filteredRooms);
        res.json({ message: 'Room deleted successfully' });
    } catch (error) {
        console.error('Error deleting room:', error);
        res.status(500).json({ error: 'Failed to delete room' });
    }
});

// Admin: Delete any roommate profile
app.delete('/api/admin/roommates/:id', async (req, res) => {
    try {
        const roommates = await readJSONFile(roommatesFilePath);
        const filteredRoommates = roommates.filter(r => r.id != req.params.id);

        if (filteredRoommates.length === roommates.length) {
            return res.status(404).json({ error: 'Roommate not found' });
        }

        await writeJSONFile(roommatesFilePath, filteredRoommates);
        res.json({ message: 'Roommate profile deleted successfully' });
    } catch (error) {
        console.error('Error deleting roommate:', error);
        res.status(500).json({ error: 'Failed to delete roommate' });
    }
});

// Admin: Delete any user
app.delete('/api/admin/users/:id', async (req, res) => {
    try {
        const users = await readJSONFile(usersFilePath);
        const filteredUsers = users.filter(u => u.id != req.params.id);

        if (filteredUsers.length === users.length) {
            return res.status(404).json({ error: 'User not found' });
        }

        await writeJSONFile(usersFilePath, filteredUsers);

        const profiles = await readJSONFile(profilesFilePath);
        const filteredProfiles = profiles.filter(p => p.user_id != req.params.id);
        await writeJSONFile(profilesFilePath, filteredProfiles);

        const rooms = await readJSONFile(roomsFilePath);
        const filteredRooms = rooms.filter(r => r.user_id != req.params.id);
        await writeJSONFile(roomsFilePath, filteredRooms);

        const roommates = await readJSONFile(roommatesFilePath);
        const filteredRoommates = roommates.filter(r => r.user_id != req.params.id);
        await writeJSONFile(roommatesFilePath, filteredRoommates);

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

/* ==================== SAVED ITEMS ENDPOINTS ==================== */

// GET user's saved items
app.get('/api/saved/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const savedItemsPath = path.join(__dirname, 'data', 'savedItems.json');

        let savedItems = await readJSONFile(savedItemsPath, {});

        res.json(savedItems[userId] || { rooms: [], roommates: [] });
    } catch (error) {
        console.error('Error fetching saved items:', error);
        res.status(500).json({ error: 'Failed to fetch saved items' });
    }
});

// POST - Save or unsave an item
app.post('/api/saved/toggle', async (req, res) => {
    try {
        const { userId, itemId, itemType } = req.body;

        if (!userId || !itemId || !itemType) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const savedItemsPath = path.join(__dirname, 'data', 'savedItems.json');
        let savedItems = await readJSONFile(savedItemsPath, {});

        if (!savedItems[userId]) {
            savedItems[userId] = { rooms: [], roommates: [] };
        }

        const userSaved = savedItems[userId];
        const itemList = itemType === 'room' ? userSaved.rooms : userSaved.roommates;

        const itemIndex = itemList.indexOf(itemId);
        let isSaved = false;

        if (itemIndex === -1) {
            itemList.push(itemId);
            isSaved = true;
        } else {
            itemList.splice(itemIndex, 1);
            isSaved = false;
        }

        await writeJSONFile(savedItemsPath, savedItems);

        let itemDetails = null;
        if (itemType === 'room') {
            const rooms = await readJSONFile(roomsFilePath);
            itemDetails = rooms.find(r => r.id == itemId);
        } else {
            const roommates = await readJSONFile(roommatesFilePath);
            itemDetails = roommates.find(r => r.id == itemId);
        }

        res.json({
            success: true,
            isSaved,
            itemId,
            itemType,
            itemDetails,
            savedCount: itemList.length
        });

    } catch (error) {
        console.error('Error toggling saved item:', error);
        res.status(500).json({ error: 'Failed to save/unsave item' });
    }
});

// GET - Check if items are saved for a user (bulk check)
app.post('/api/saved/check', async (req, res) => {
    try {
        const { userId, itemIds, itemType } = req.body;

        const savedItemsPath = path.join(__dirname, 'data', 'savedItems.json');
        let savedItems = await readJSONFile(savedItemsPath, {});

        const userSaved = savedItems[userId] || { rooms: [], roommates: [] };
        const savedList = itemType === 'room' ? userSaved.rooms : userSaved.roommates;

        const savedStatus = {};
        itemIds.forEach(id => {
            savedStatus[id] = savedList.includes(id);
        });

        res.json({ savedStatus });
    } catch (error) {
        console.error('Error checking saved status:', error);
        res.status(500).json({ error: 'Failed to check saved status' });
    }
});

// DELETE - Remove all saved items for a user
app.delete('/api/saved/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { itemType, itemId } = req.query;

        const savedItemsPath = path.join(__dirname, 'data', 'savedItems.json');
        let savedItems = await readJSONFile(savedItemsPath, {});

        if (savedItems[userId]) {
            if (itemType && itemId) {
                if (itemType === 'room') {
                    savedItems[userId].rooms = savedItems[userId].rooms.filter(id => id != itemId);
                } else if (itemType === 'roommate') {
                    savedItems[userId].roommates = savedItems[userId].roommates.filter(id => id != itemId);
                }
            } else {
                delete savedItems[userId];
            }

            await writeJSONFile(savedItemsPath, savedItems);
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error removing saved items:', error);
        res.status(500).json({ error: 'Failed to remove saved items' });
    }
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Data directory: ${path.join(__dirname, 'data')}`);
    console.log(`- Users: data/users.json`);
    console.log(`- Profiles: data/profiles.json`);
    console.log(`- Rooms: data/rooms.json`);
    console.log(`- Roommates: data/roommates.json`);
    console.log(`- Stats: data/stats.json`);
});