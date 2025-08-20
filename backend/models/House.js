const mongoose = require('mongoose');

const nearbyEssentialSchema = new mongoose.Schema({
    type: { type: String, required: true },
    name: { type: String, required: true },
    distance: { type: Number, required: true } // in meters
}, { _id: false });

const locationSchema = new mongoose.Schema({
    estate: { type: String, required: true },
    address: { type: String, required: true },
    coordinates: {
        lat: { type: Number },
        lng: { type: Number }
    },
    distanceFromUniversity: {
        walking: { type: Number },
        boda: { type: Number },
        matatu: { type: Number }
    },
    nearbyEssentials: [nearbyEssentialSchema]
}, { _id: false });

const amenitySchema = new mongoose.Schema({
    name: { type: String, required: true },
    available: { type: Boolean, default: true },
    icon: { type: String }
}, { _id: false });

const landlordSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String },
    email: { type: String },
    verified: { type: Boolean, default: false },
    rating: { type: Number, default: 0 }
}, { _id: false });

const houseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    price: { type: Number, required: true },
    type: { type: String, required: true }, // bedsitter, single, 1BR, 2BR, hostel
    location: { type: locationSchema, required: true },
    images: [{ type: String }],
    amenities: [amenitySchema],
    landlord: { type: mongoose.Schema.Types.ObjectId, ref: 'Landlord', required: true },
    status: { type: String, enum: ['vacant', 'occupied'], default: 'vacant' },
    rating: { type: Number, default: 0 },
    safetyRating: { type: Number, default: 0 },
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }] // references
}, { timestamps: true });

module.exports = mongoose.model('House', houseSchema);
