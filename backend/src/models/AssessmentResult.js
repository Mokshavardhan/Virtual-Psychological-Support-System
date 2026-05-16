// backend/src/models/AssessmentResult.js
import mongoose from 'mongoose';

const assessmentResultSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    type: {
        type: String,
        required: true // e.g., 'pss10', 'gad7', 'phq9', 'burnout'
    },
    score: {
        type: Number,
        required: true
    },
    severity: {
        type: String,
        required: true // e.g., 'low', 'moderate', 'high'
    },
    answers: {
        type: mongoose.Schema.Types.Mixed, // Array of scores or objects
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

// Index for efficient retrieval of latest assessment or history
assessmentResultSchema.index({ userId: 1, timestamp: -1 });

export const AssessmentResult = mongoose.model('AssessmentResult', assessmentResultSchema);
