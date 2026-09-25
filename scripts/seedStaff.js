const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');

async function seedStaff() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        const email = 'staff@libswap.com';
        const password = 'Staff123456';

        const existingStaff = await User.findOne({ email });

        if (existingStaff) {
            console.log('Staff user already exists');
            process.exit(0);
        }

        const passwordHash = await bcrypt.hash(password, 12);

        await User.create({
            username: 'libswapstaff',
            fullName: 'LibSwap Staff',
            email,
            passwordHash,
            role: 'staff'
        });

        console.log('Staff user created successfully');
        console.log('Email:', email);
        console.log('Password:', password);

        process.exit(0);

    } catch (error) {
        console.error('Error creating staff user:', error);
        process.exit(1);
    }
}

seedStaff();