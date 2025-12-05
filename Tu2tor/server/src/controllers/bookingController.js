import Booking from '../models/Booking.js';
import Tutor from '../models/Tutor.js';
import User from '../models/User.js';

/**
 * @route   GET /api/bookings
 * @desc    Get bookings (filtered by user role)
 * @access  Private
 * @query   status, startDate, endDate
 */
export const getBookings = async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;

    // Build query based on user role
    let query = {};

    if (req.user.role === 'student') {
      query.studentId = req.user._id;
    } else if (req.user.role === 'tutor') {
      // Get tutor profile to find bookings
      const tutor = await Tutor.findOne({ userId: req.user._id });
      if (!tutor) {
        return res.status(404).json({
          error: 'Tutor profile not found',
          message: 'You need to create a tutor profile first'
        });
      }
      query.tutorId = tutor._id;
    } else {
      // Admin can see all bookings
    }

    // Status filter
    if (status) {
      query.status = status;
    }

    // Date range filter
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        query.date.$lte = new Date(endDate);
      }
    }

    const bookings = await Booking.find(query)
      .populate('studentId', 'username email school profilePicture')
      .populate({
        path: 'tutorId',
        populate: {
          path: 'userId',
          select: 'username email school profilePicture'
        }
      })
      .sort({ date: -1, createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      bookings: bookings.map(booking => {
        // Calculate startTime and endTime from date and timeSlot
        let startTime = booking.date;
        let endTime = booking.date;
        
        if (booking.timeSlot) {
          const [startStr, endStr] = booking.timeSlot.split('-');
          if (startStr && endStr) {
            const [startHour, startMin] = startStr.trim().split(':').map(Number);
            const [endHour, endMin] = endStr.trim().split(':').map(Number);
            
            startTime = new Date(booking.date);
            startTime.setHours(startHour, startMin, 0, 0);
            
            endTime = new Date(booking.date);
            endTime.setHours(endHour, endMin, 0, 0);
          }
        }

        const result = {
          _id: booking._id,
          id: booking._id,
          bookingId: booking._id,
          subject: booking.subject,
          date: booking.date,
          timeSlot: booking.timeSlot,
          startTime: startTime,
          endTime: endTime,
          duration: booking.duration,
          location: booking.location,
          status: booking.status,
          cost: booking.cost,
          notes: booking.notes,
          sessionType: booking.sessionType,
          meetingRoomId: booking.meetingRoomId,
          hasReview: booking.hasReview,
          createdAt: booking.createdAt,
          updatedAt: booking.updatedAt
        };

        // Add student info if populated
        if (booking.studentId) {
          result.student = {
            id: booking.studentId._id,
            username: booking.studentId.username,
            email: booking.studentId.email,
            school: booking.studentId.school,
            profilePicture: booking.studentId.profilePicture
          };
        }

        // Add tutor info if populated
        if (booking.tutorId && booking.tutorId.userId) {
          result.tutor = {
            id: booking.tutorId._id,
            userId: booking.tutorId.userId._id,
            username: booking.tutorId.userId.username,
            email: booking.tutorId.userId.email,
            school: booking.tutorId.userId.school,
            profilePicture: booking.tutorId.userId.profilePicture
          };
        }

        return result;
      })
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      error: 'Failed to fetch bookings',
      message: error.message
    });
  }
};

/**
 * @route   GET /api/bookings/:id
 * @desc    Get specific booking by ID
 * @access  Private
 */
export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('studentId', 'username email school phoneNumber profilePicture')
      .populate({
        path: 'tutorId',
        populate: {
          path: 'userId',
          select: 'username email school phoneNumber profilePicture'
        }
      });

    if (!booking) {
      return res.status(404).json({
        error: 'Booking not found',
        message: 'No booking found with this ID'
      });
    }

    // Check if user has access to this booking
    const tutor = await Tutor.findById(booking.tutorId._id);
    const isStudent = booking.studentId._id.toString() === req.user._id.toString();
    const isTutor = tutor && tutor.userId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isStudent && !isTutor && !isAdmin) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have access to this booking'
      });
    }

    res.json({
      success: true,
      booking: {
        id: booking._id,
        student: {
          id: booking.studentId._id,
          username: booking.studentId.username,
          email: booking.studentId.email,
          school: booking.studentId.school,
          phoneNumber: booking.studentId.phoneNumber,
          profilePicture: booking.studentId.profilePicture
        },
        tutor: {
          id: booking.tutorId._id,
          userId: booking.tutorId.userId._id,
          username: booking.tutorId.userId.username,
          email: booking.tutorId.userId.email,
          school: booking.tutorId.userId.school,
          phoneNumber: booking.tutorId.userId.phoneNumber,
          profilePicture: booking.tutorId.userId.profilePicture
        },
        subject: booking.subject,
        date: booking.date,
        timeSlot: booking.timeSlot,
        duration: booking.duration,
        location: booking.location,
        status: booking.status,
        cost: booking.cost,
        notes: booking.notes,
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt
      }
    });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      error: 'Failed to fetch booking',
      message: error.message
    });
  }
};

/**
 * @route   POST /api/bookings
 * @desc    Create new booking
 * @access  Private
 */
export const createBooking = async (req, res) => {
  try {
    const {
      tutorId,
      subject,
      date,
      timeSlot,
      duration,
      location,
      notes
    } = req.body;

    // Validation
    if (!tutorId || !subject || !date || !timeSlot) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Please provide tutor, subject, date, and time slot'
      });
    }

    // Check if tutor exists
    const tutor = await Tutor.findById(tutorId);
    if (!tutor) {
      return res.status(404).json({
        error: 'Tutor not found',
        message: 'The selected tutor does not exist'
      });
    }

    // Check if tutor is available
    if (!tutor.isAvailable) {
      return res.status(400).json({
        error: 'Tutor unavailable',
        message: 'This tutor is currently not accepting bookings'
      });
    }

    // Calculate cost
    const cost = tutor.hourlyRate * (duration || 1);

    // Check if student has enough credits
    const student = await User.findById(req.user._id);
    if (student.credits < cost) {
      return res.status(400).json({
        error: 'Insufficient credits',
        message: `You need ${cost} credits but only have ${student.credits} credits`
      });
    }

    // Create booking
    const booking = await Booking.create({
      studentId: req.user._id,
      tutorId,
      subject,
      date: new Date(date),
      timeSlot,
      duration: duration || 1,
      location: location || 'TBD',
      cost,
      notes,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      booking: {
        id: booking._id,
        studentId: booking.studentId,
        tutorId: booking.tutorId,
        subject: booking.subject,
        date: booking.date,
        timeSlot: booking.timeSlot,
        duration: booking.duration,
        location: booking.location,
        status: booking.status,
        cost: booking.cost,
        notes: booking.notes
      }
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      error: 'Failed to create booking',
      message: error.message
    });
  }
};

/**
 * @route   POST /api/bookings/:id/complete
 * @desc    Complete a session (by student or tutor)
 * @access  Private
 */
export const completeSession = async (req, res) => {
  try {
    const { sessionNotes, actualDuration } = req.body;
    
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        error: 'Booking not found',
        message: 'No booking found with this ID'
      });
    }

    // Check authorization - both student and tutor can complete
    const tutor = await Tutor.findById(booking.tutorId);
    const isStudent = booking.studentId.toString() === req.user._id.toString();
    const isTutor = tutor && tutor.userId.toString() === req.user._id.toString();

    if (!isStudent && !isTutor) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only complete your own sessions'
      });
    }

    // Can only complete confirmed sessions
    if (booking.status !== 'confirmed') {
      return res.status(400).json({
        error: 'Invalid status',
        message: 'Only confirmed sessions can be completed'
      });
    }

    // Update booking
    booking.status = 'completed';
    booking.actualEndTime = new Date();
    
    // Calculate actual duration if not provided
    if (actualDuration) {
      booking.actualDuration = actualDuration;
    } else if (booking.actualStartTime) {
      booking.actualDuration = Math.floor((booking.actualEndTime - booking.actualStartTime) / 60000);
    } else {
      booking.actualDuration = booking.duration; // Use scheduled duration
    }
    
    if (sessionNotes) {
      booking.sessionNotes = sessionNotes;
    }

    await booking.save();

    // Update tutor stats (only once)
    if (!tutor.completedSessions || tutor.completedSessions === 0) {
      tutor.completedSessions = 1;
    } else {
      tutor.completedSessions += 1;
    }
    tutor.totalSessions = (tutor.totalSessions || 0) + 1;
    await tutor.save();

    // Handle credits transfer
    const student = await User.findById(booking.studentId);
    if (student.credits >= booking.cost) {
      student.credits -= booking.cost;
      await student.save();

      const tutorUser = await User.findById(tutor.userId);
      tutorUser.credits = (tutorUser.credits || 0) + booking.cost;
      await tutorUser.save();
    }

    // Populate for response
    await booking.populate('studentId', 'username email school profilePicture');
    await booking.populate({
      path: 'tutorId',
      populate: {
        path: 'userId',
        select: 'username email school profilePicture'
      }
    });

    res.json({
      success: true,
      message: 'Session completed successfully',
      booking
    });
  } catch (error) {
    console.error('Complete session error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to complete session'
    });
  }
};

/**
 * @route   POST /api/bookings/:id/start
 * @desc    Mark session as started
 * @access  Private
 */
export const startSession = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        error: 'Booking not found',
        message: 'No booking found with this ID'
      });
    }

    // Check authorization
    const tutor = await Tutor.findById(booking.tutorId);
    const isStudent = booking.studentId.toString() === req.user._id.toString();
    const isTutor = tutor && tutor.userId.toString() === req.user._id.toString();

    if (!isStudent && !isTutor) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only start your own sessions'
      });
    }

    // Only set start time if not already set
    if (!booking.actualStartTime) {
      booking.actualStartTime = new Date();
      await booking.save();
    }

    res.json({
      success: true,
      message: 'Session started',
      booking
    });
  } catch (error) {
    console.error('Start session error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to start session'
    });
  }
};

/**
 * @route   PUT /api/bookings/:id
 * @desc    Update booking status
 * @access  Private
 */
export const updateBooking = async (req, res) => {
  try {
    const { status, location, notes } = req.body;

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        error: 'Booking not found',
        message: 'No booking found with this ID'
      });
    }

    // Check authorization
    const tutor = await Tutor.findById(booking.tutorId);
    const isStudent = booking.studentId.toString() === req.user._id.toString();
    const isTutor = tutor && tutor.userId.toString() === req.user._id.toString();

    if (!isStudent && !isTutor) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only update your own bookings'
      });
    }

    // Status update logic
    if (status) {
      // Students can only cancel pending bookings
      if (isStudent && status === 'cancelled' && booking.status === 'pending') {
        booking.status = 'cancelled';
      }
      // Tutors can confirm bookings
      else if (isTutor) {
        if (status === 'confirmed' && booking.status === 'pending') {
          booking.status = 'confirmed';
        } else if (status === 'cancelled') {
          booking.status = 'cancelled';
        }
      }
    }

    // Update other fields
    if (location) booking.location = location;
    if (notes) booking.notes = notes;

    await booking.save();

    // Populate for response
    await booking.populate('studentId', 'username email school profilePicture');
    await booking.populate({
      path: 'tutorId',
      populate: {
        path: 'userId',
        select: 'username email school profilePicture'
      }
    });

    res.json({
      success: true,
      message: 'Booking updated successfully',
      booking: {
        id: booking._id,
        status: booking.status,
        location: booking.location,
        notes: booking.notes,
        updatedAt: booking.updatedAt
      }
    });
  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({
      error: 'Failed to update booking',
      message: error.message
    });
  }
};

/**
 * @route   DELETE /api/bookings/:id
 * @desc    Delete booking
 * @access  Private (Admin only)
 */
export const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        error: 'Booking not found',
        message: 'No booking found with this ID'
      });
    }

    await booking.deleteOne();

    res.json({
      success: true,
      message: 'Booking deleted successfully'
    });
  } catch (error) {
    console.error('Delete booking error:', error);
    res.status(500).json({
      error: 'Failed to delete booking',
      message: error.message
    });
  }
};
