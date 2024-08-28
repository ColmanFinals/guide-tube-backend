import express from 'express';
import Guide from '../models/guideModel';
import Company from '../models/companyModel';
import User from '../models/userModel';

const router = express.Router();

// Get views per guide
router.get('/views-per-guide', async (req, res) => {
    try {
        const guides = await Guide.find().select('name views');
        res.json(guides);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching guide views' });
    }
});

// Get number of companies over time
router.get('/companies-over-time', async (req, res) => {
    try {
        const companies = await Company.aggregate([
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);
        res.json(companies);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching companies' });
    }
});

// Get admin logins
router.get('/admin-logins', async (req, res) => {
    try {
        const admins = await User.find({ role: 'admin' }).select('fullName logins');
        res.json(admins);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching admin logins' });
    }
});

export default router;