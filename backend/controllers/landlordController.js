const Landlord = require('../models/landLord');

// Create a new landlord
exports.createLandlord = async (req, res) => {
    try {
        const landlord = new Landlord(req.body);
        await landlord.save();
        res.status(201).json(landlord);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get all landlords
exports.getAllLandlords = async (req, res) => {
    try {
        const landlords = await Landlord.find();
        res.json(landlords);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get landlord by ID
exports.getLandlordById = async (req, res) => {
    try {
        const landlord = await Landlord.findById(req.params.id);
        if (!landlord) return res.status(404).json({ error: 'Landlord not found' });
        res.json(landlord);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update landlord
exports.updateLandlord = async (req, res) => {
    try {
        const landlord = await Landlord.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!landlord) return res.status(404).json({ error: 'Landlord not found' });
        res.json(landlord);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete landlord
exports.deleteLandlord = async (req, res) => {
    try {
        const landlord = await Landlord.findByIdAndDelete(req.params.id);
        if (!landlord) return res.status(404).json({ error: 'Landlord not found' });
        res.json({ message: 'Landlord deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
