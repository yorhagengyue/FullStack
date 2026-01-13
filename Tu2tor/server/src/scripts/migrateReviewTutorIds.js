import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Review from '../models/Review.js';
import Tutor from '../models/Tutor.js';
import User from '../models/User.js';

dotenv.config();

/**
 * Migration script to fix Review tutorId references
 * 
 * Problem: Some reviews have tutorId pointing to Tutor._id instead of User._id
 * Solution: Find all reviews and update tutorId to point to the correct User._id
 */

const migrateReviewTutorIds = async () => {
  try {
    console.log('[Migration] Starting Review tutorId migration...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tu2tor');
    console.log('[Migration] Connected to MongoDB\n');

    // Get all reviews
    const reviews = await Review.find({});
    console.log(`[Migration] Found ${reviews.length} reviews to check\n`);

    let migratedCount = 0;
    let alreadyCorrectCount = 0;
    let errorCount = 0;

    for (const review of reviews) {
      try {
        // Check if tutorId is a User ID (correct) or Tutor ID (needs migration)
        const user = await User.findById(review.tutorId);
        
        if (user && user.role === 'tutor') {
          // tutorId is already correct (points to User)
          console.log(`✓ Review ${review._id}: tutorId already correct (User ID)`);
          alreadyCorrectCount++;
        } else {
          // tutorId might be a Tutor ID, try to find the correct User ID
          const tutor = await Tutor.findById(review.tutorId);
          
          if (tutor && tutor.userId) {
            // Found the Tutor, update review to use User ID
            const oldTutorId = review.tutorId;
            review.tutorId = tutor.userId;
            await review.save();
            
            console.log(`[Migration] Review ${review._id}: Migrated tutorId`);
            console.log(`   Old (Tutor ID): ${oldTutorId}`);
            console.log(`   New (User ID):  ${tutor.userId}\n`);
            migratedCount++;
          } else {
            console.log(`[Migration] WARNING: Review ${review._id}: Could not find corresponding Tutor or User`);
            errorCount++;
          }
        }
      } catch (err) {
        console.error(`[Migration] Error processing review ${review._id}:`, err.message);
        errorCount++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('[Migration] Summary:');
    console.log('='.repeat(60));
    console.log(`Total reviews:        ${reviews.length}`);
    console.log(`Already correct:      ${alreadyCorrectCount}`);
    console.log(`Successfully migrated: ${migratedCount}`);
    console.log(`Errors:               ${errorCount}`);
    console.log('='.repeat(60) + '\n');

    // Recalculate tutor stats for all tutors
    console.log('[Migration] Recalculating tutor statistics...\n');
    
    const tutors = await Tutor.find({});
    for (const tutor of tutors) {
      try {
        const stats = await Review.getAverageRatingForTutor(tutor.userId);
        tutor.averageRating = Math.round(stats.averageRating * 100) / 100;
        tutor.totalReviews = stats.totalReviews;
        await tutor.save();
        
        console.log(`[Migration] Updated stats for tutor ${tutor.userId}:`, {
          averageRating: tutor.averageRating,
          totalReviews: tutor.totalReviews
        });
      } catch (err) {
        console.error(`[Migration] Error updating tutor ${tutor._id}:`, err.message);
      }
    }

    console.log('\n[Migration] Completed successfully!\n');
    
  } catch (error) {
    console.error('[Migration] Failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('[Migration] Database connection closed');
    process.exit(0);
  }
};

// Run migration
migrateReviewTutorIds();


