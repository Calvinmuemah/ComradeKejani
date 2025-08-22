const House = require('../models/House');
const Landlord = require('../models/landLord');

// Create House
exports.createHouse = async (req, res) => {
  try {
    const { title, price, type, location, amenities, landlordId, status } = req.body;

    // Check landlord exists
    const existingLandlord = await Landlord.findById(landlordId);
    if (!existingLandlord) {
      return res.status(404).json({ error: 'Landlord not found' });
    }

    // Handle uploaded images
    const images = req.files
      ? req.files.map(f => `/uploads/${f.filename}`)
      : req.body.images || [];

    const house = new House({
      title, price, type, location, images, amenities, landlord: landlordId, status
    });
    // Save the house
    await house.save();
    res.status(201).json(house);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};


// Get All Houses
exports.getAllHouses = async (req, res) => {
    try {
        const houses = await House.find().populate('landlord');
        res.json(houses);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get House By ID
exports.getHouseById = async (req, res) => {
    try {
        const house = await House.findById(req.params.id).populate('landlord');
        if (!house) return res.status(404).json({ error: 'House not found' });
        res.json(house);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update House
exports.updateHouse = async (req, res) => {
    try {
        const { address, type, rooms, rent, status, security, landlord } = req.body;

        if (landlord) {
            const existingLandlord = await Landlord.findById(landlord);
            if (!existingLandlord) return res.status(404).json({ error: 'Landlord not found' });
        }

        const pictures = req.files ? req.files.map(f => f.path) : undefined;

        const updatedHouse = await House.findByIdAndUpdate(
            req.params.id,
            { address, type, rooms, rent, status, security, landlord, ...(pictures && { pictures }) },
            { new: true }
        );
        if (!updatedHouse) return res.status(404).json({ error: 'House not found' });

        res.json(updatedHouse);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Delete House
exports.deleteHouse = async (req, res) => {
    try {
        const deletedHouse = await House.findByIdAndDelete(req.params.id);
        if (!deletedHouse) return res.status(404).json({ error: 'House not found' });
        res.json({ message: 'House deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};