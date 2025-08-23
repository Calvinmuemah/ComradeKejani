const House = require('../models/House');
const Landlord = require('../models/landLord');
const cloudinary = require('../config/cloudinary');

// Create House
exports.createHouse = async (req, res) => {
  try {
    const { title, price, type, location, amenities, landlordId, status } = req.body;

    // Check landlord exists
    const existingLandlord = await Landlord.findById(landlordId);
    if (!existingLandlord) return res.status(404).json({ error: 'Landlord not found' });

    // Handle uploaded images via Cloudinary
    const images = req.files ? req.files.map(file => file.path) : req.body.images || [];

    const house = new House({
      title,
      price,
      type,
      location,
      amenities,
      landlord: landlordId,
      status,
      images
    });

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
// Update House
exports.updateHouse = async (req, res) => {
  try {
    const { title, price, type, location, amenities, status, landlordId, replaceImages } = req.body;

    // Validate landlord if provided
    if (landlordId) {
      const existingLandlord = await Landlord.findById(landlordId);
      if (!existingLandlord) return res.status(404).json({ error: 'Landlord not found' });
    }

    const house = await House.findById(req.params.id);
    if (!house) return res.status(404).json({ error: 'House not found' });

    // Update fields if provided
    if (title) house.title = title;
    if (price) house.price = price;
    if (type) house.type = type;
    if (location) house.location = location;
    if (amenities) house.amenities = amenities;
    if (status) house.status = status;
    if (landlordId) house.landlord = landlordId;

    // Handle images uploaded via Cloudinary
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => file.path);

      if (replaceImages === 'true') {
        // Delete old images from Cloudinary
        if (house.images && house.images.length > 0) {
          for (const imgUrl of house.images) {
            const publicId = imgUrl.split('/').pop().split('.')[0]; 
            await cloudinary.uploader.destroy(`houses/${publicId}`);
          }
        }
        // Replace with new images
        house.images = newImages;
      } else {
        // Append new images
        house.images.push(...newImages);
      }
    }

    await house.save();
    res.json(house);

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete House
exports.deleteHouse = async (req, res) => {
  try {
    const house = await House.findById(req.params.id);
    if (!house) return res.status(404).json({ error: 'House not found' });

    // Remove images from Cloudinary
    if (house.images && house.images.length > 0) {
      for (const imgUrl of house.images) {
        const publicId = imgUrl.split('/').pop().split('.')[0]; // extract public_id
        await cloudinary.uploader.destroy(`houses/${publicId}`);
      }
    }

    await house.deleteOne();
    res.json({ message: 'House deleted successfully' });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
