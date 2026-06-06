import ActivityLog from '../models/ActivityLog.js';

export const logActivity = async (user, action, details) => {
  try {
    if (!user) return;
    await ActivityLog.create({
      userId: user._id,
      userName: user.name,
      userRole: user.role,
      action,
      details,
    });
  } catch (error) {
    console.error('Error logging activity:', error.message);
  }
};
