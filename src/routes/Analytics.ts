import express from 'express';
import Guide from '../models/guideModel';
import Company from '../models/companyModel';
import User from '../models/userModel';

const router = express.Router();

// Fake data generators
const generateFakeGuides = () => [
    { name: "Tutorial", views: 120 },
    { name: "Review", views: 80 },
    { name: "Vlog", views: 50 },
    { name: "Live Stream", views: 30 }
];

const generateFakeCompanies = () => [
    { _id: 1, count: 5 },
    { _id: 2, count: 10 },
    { _id: 3, count: 15 },
    { _id: 4, count: 20 }
];

const generateFakeAdminLogins = () => [
    { fullName: "Alice", logins: 15 },
    { fullName: "Bob", logins: 12 },
    { fullName: "Charlie", logins: 8 },
    { fullName: "David", logins: 5 }
];

// Get views per guide
router.get('/views-per-guide', async (req, res) => {
    try {
        const guides = await Guide.find().select('name views');
        if (guides.length === 0) {
            return res.json(generateFakeGuides());
        }
        res.json(guides);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching guide views: ' + (error as Error).message });
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
        if (companies.length === 0) {
            return res.json(generateFakeCompanies());
        }
        res.json(companies);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching companies: ' + (error as Error).message });
    }
});

// Get admin logins
router.get('/admin-logins', async (req, res) => {
    try {
        const admins = await User.find({ role: 'admin' }).select('fullName logins');
        if (admins.length === 0) {
            return res.json(generateFakeAdminLogins());
        }
        res.json(admins);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching admin logins: ' + (error as Error).message });
    }
});

export default router;
