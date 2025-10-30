import Tutor from '../models/Tutor.js';
import User from '../models/User.js';

/**
 * @route   GET /api/tutors
 * @desc    Get all tutors with optional filters
 * @access  Public
 * @query   subject, school, minRating, maxRate, availability
 */
export const getTutors = async (req, res) => {
  try {
    const {
      subject,
      school,
      minRating,
      maxRate,
      availability,
      location,
      search,
      page = 1,
      limit = 20
    } = req.query;

    // Build query
    let query = { isAvailable: true };

    // Subject filter
    if (subject) {
      query['subjects.code'] = { $regex: subject, $options: 'i' };
    }

    // Rating filter
    if (minRating) {
      query.averageRating = { $gte: parseFloat(minRating) };
    }

    // Rate filter
    if (maxRate) {
      query.hourlyRate = { $lte: parseFloat(maxRate) };
    }

    // Location filter
    if (location) {
      query.preferredLocations = { $in: [location] };
    }

    // Get tutors with populated user data
    const tutors = await Tutor.find(query)
      .populate({
        path: 'userId',
        select: 'username email school major yearOfStudy profilePicture',
        match: school ? { school: { $regex: school, $options: 'i' } } : {}
      })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ averageRating: -1, totalSessions: -1 });

    // Filter out tutors where user data didn't match (due to populate match)
    const filteredTutors = tutors.filter(tutor => tutor.userId);

    // Apply search filter if provided (search in username, bio, subjects)
    let results = filteredTutors;
    if (search) {
      const searchLower = search.toLowerCase();
      results = filteredTutors.filter(tutor => {
        const username = tutor.userId.username.toLowerCase();
        const bio = tutor.bio?.toLowerCase() || '';
        const subjects = tutor.subjects.map(s => s.name.toLowerCase()).join(' ');
        return username.includes(searchLower) ||
               bio.includes(searchLower) ||
               subjects.includes(searchLower);
      });
    }

    // Get total count for pagination
    const total = await Tutor.countDocuments(query);

    res.json({
      success: true,
      count: results.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      tutors: results.map(tutor => ({
        id: tutor._id,
        userId: tutor.userId._id,
        username: tutor.userId.username,
        email: tutor.userId.email,
        school: tutor.userId.school,
        major: tutor.userId.major,
        yearOfStudy: tutor.userId.yearOfStudy,
        profilePicture: tutor.userId.profilePicture,
        bio: tutor.bio,
        subjects: tutor.subjects,
        hourlyRate: tutor.hourlyRate,
        availableSlots: tutor.availableSlots,
        preferredLocations: tutor.preferredLocations,
        averageRating: tutor.averageRating,
        totalReviews: tutor.totalReviews,
        totalSessions: tutor.totalSessions,
        responseTime: tutor.responseTime,
        isAvailable: tutor.isAvailable
      }))
    });
  } catch (error) {
    console.error('Get tutors error:', error);
    res.status(500).json({
      error: 'Failed to fetch tutors',
      message: error.message
    });
  }
};

/**
 * @route   GET /api/tutors/:id
 * @desc    Get specific tutor by ID
 * @access  Public
 */
export const getTutorById = async (req, res) => {
  try {
    const tutor = await Tutor.findById(req.params.id)
      .populate('userId', 'username email school major yearOfStudy profilePicture bio');

    if (!tutor) {
      return res.status(404).json({
        error: 'Tutor not found',
        message: 'No tutor found with this ID'
      });
    }

    res.json({
      success: true,
      tutor: {
        id: tutor._id,
        userId: tutor.userId._id,
        username: tutor.userId.username,
        email: tutor.userId.email,
        school: tutor.userId.school,
        major: tutor.userId.major,
        yearOfStudy: tutor.userId.yearOfStudy,
        profilePicture: tutor.userId.profilePicture,
        bio: tutor.bio,
        subjects: tutor.subjects,
        hourlyRate: tutor.hourlyRate,
        availableSlots: tutor.availableSlots,
        preferredLocations: tutor.preferredLocations,
        averageRating: tutor.averageRating,
        totalReviews: tutor.totalReviews,
        totalSessions: tutor.totalSessions,
        completedSessions: tutor.completedSessions,
        responseTime: tutor.responseTime,
        isAvailable: tutor.isAvailable,
        createdAt: tutor.createdAt
      }
    });
  } catch (error) {
    console.error('Get tutor error:', error);
    res.status(500).json({
      error: 'Failed to fetch tutor',
      message: error.message
    });
  }
};

/**
 * @route   POST /api/tutors
 * @desc    Create/register as a tutor
 * @access  Private
 */
export const createTutor = async (req, res) => {
  try {
    // Check if user is already a tutor
    const existingTutor = await Tutor.findOne({ userId: req.user._id });

    if (existingTutor) {
      return res.status(400).json({
        error: 'Already a tutor',
        message: 'You are already registered as a tutor'
      });
    }

    const {
      bio,
      subjects,
      hourlyRate,
      availableSlots,
      preferredLocations
    } = req.body;

    // Validation
    if (!subjects || subjects.length === 0) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Please provide at least one subject'
      });
    }

    if (!hourlyRate) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Please provide an hourly rate'
      });
    }

    // Create tutor profile
    const tutor = await Tutor.create({
      userId: req.user._id,
      bio,
      subjects,
      hourlyRate,
      availableSlots: availableSlots || [],
      preferredLocations: preferredLocations || []
    });

    // Update user role to tutor
    await User.findByIdAndUpdate(req.user._id, { role: 'tutor' });

    // Populate user data
    await tutor.populate('userId', 'username email school major yearOfStudy profilePicture');

    res.status(201).json({
      success: true,
      message: 'Tutor profile created successfully',
      tutor: {
        id: tutor._id,
        userId: tutor.userId._id,
        username: tutor.userId.username,
        bio: tutor.bio,
        subjects: tutor.subjects,
        hourlyRate: tutor.hourlyRate,
        availableSlots: tutor.availableSlots,
        preferredLocations: tutor.preferredLocations
      }
    });
  } catch (error) {
    console.error('Create tutor error:', error);
    res.status(500).json({
      error: 'Failed to create tutor profile',
      message: error.message
    });
  }
};

/**
 * @route   PUT /api/tutors/:id
 * @desc    Update tutor profile
 * @access  Private (must be the tutor owner)
 */
export const updateTutor = async (req, res) => {
  try {
    const tutor = await Tutor.findById(req.params.id);

    if (!tutor) {
      return res.status(404).json({
        error: 'Tutor not found',
        message: 'No tutor found with this ID'
      });
    }

    // Check if user owns this tutor profile
    if (tutor.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only update your own tutor profile'
      });
    }

    const allowedUpdates = [
      'bio',
      'subjects',
      'hourlyRate',
      'availableSlots',
      'preferredLocations',
      'isAvailable'
    ];

    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const updatedTutor = await Tutor.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate('userId', 'username email school major yearOfStudy profilePicture');

    res.json({
      success: true,
      message: 'Tutor profile updated successfully',
      tutor: {
        id: updatedTutor._id,
        userId: updatedTutor.userId._id,
        username: updatedTutor.userId.username,
        bio: updatedTutor.bio,
        subjects: updatedTutor.subjects,
        hourlyRate: updatedTutor.hourlyRate,
        availableSlots: updatedTutor.availableSlots,
        preferredLocations: updatedTutor.preferredLocations,
        averageRating: updatedTutor.averageRating,
        totalReviews: updatedTutor.totalReviews,
        isAvailable: updatedTutor.isAvailable
      }
    });
  } catch (error) {
    console.error('Update tutor error:', error);
    res.status(500).json({
      error: 'Failed to update tutor profile',
      message: error.message
    });
  }
};

/**
 * @route   GET /api/tutors/user/:userId
 * @desc    Get tutor profile by user ID
 * @access  Public
 */
export const getTutorByUserId = async (req, res) => {
  try {
    const tutor = await Tutor.findOne({ userId: req.params.userId })
      .populate('userId', 'username email school major yearOfStudy profilePicture bio');

    if (!tutor) {
      return res.status(404).json({
        error: 'Tutor not found',
        message: 'This user is not registered as a tutor'
      });
    }

    res.json({
      success: true,
      tutor: {
        id: tutor._id,
        userId: tutor.userId._id,
        username: tutor.userId.username,
        email: tutor.userId.email,
        school: tutor.userId.school,
        major: tutor.userId.major,
        yearOfStudy: tutor.userId.yearOfStudy,
        profilePicture: tutor.userId.profilePicture,
        bio: tutor.bio,
        subjects: tutor.subjects,
        hourlyRate: tutor.hourlyRate,
        availableSlots: tutor.availableSlots,
        preferredLocations: tutor.preferredLocations,
        averageRating: tutor.averageRating,
        totalReviews: tutor.totalReviews,
        totalSessions: tutor.totalSessions,
        completedSessions: tutor.completedSessions,
        responseTime: tutor.responseTime,
        isAvailable: tutor.isAvailable
      }
    });
  } catch (error) {
    console.error('Get tutor by user ID error:', error);
    res.status(500).json({
      error: 'Failed to fetch tutor',
      message: error.message
    });
  }
};
