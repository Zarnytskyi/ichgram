export const formatUser = (userDoc, posts = []) => ({
  _id: userDoc._id,
  username: userDoc.username,
  email: userDoc.email,
  fullName: userDoc.fullName,
  profilePicture: userDoc.profilePicture,
  bio: userDoc.bio,
  gender: userDoc.gender,
  followers: userDoc.followers,
  following: userDoc.following,
  posts,
});
