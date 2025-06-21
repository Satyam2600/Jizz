const fs = require('fs');
const path = require('path');
const { uploadToCloudinary } = require('../utils/cloudinary');
const Post = require('../models/Post');
const User = require('../models/User');
const Community = require('../models/Community');
const Event = require('../models/Event');
const Confession = require('../models/confession');

// Migration script to move local files to Cloudinary
async function migrateToCloudinary() {
  console.log('🚀 Starting migration to Cloudinary...');
  
  try {
    // 1. Migrate Post Media
    console.log('\n📝 Migrating post media...');
    const posts = await Post.find({ 
      $or: [
        { image: { $exists: true, $ne: null } },
        { video: { $exists: true, $ne: null } }
      ]
    });
    
    for (const post of posts) {
      if (post.image && !post.image.includes('cloudinary.com')) {
        try {
          const localPath = path.join(__dirname, '..', post.image);
          if (fs.existsSync(localPath)) {
            console.log(`Uploading post image: ${post.image}`);
            const result = await uploadToCloudinary(localPath, 'posts');
            post.image = result.url;
            await post.save();
            console.log(`✅ Migrated post image: ${result.url}`);
          }
        } catch (error) {
          console.error(`❌ Failed to migrate post image: ${post.image}`, error.message);
        }
      }
      
      if (post.video && !post.video.includes('cloudinary.com')) {
        try {
          const localPath = path.join(__dirname, '..', post.video);
          if (fs.existsSync(localPath)) {
            console.log(`Uploading post video: ${post.video}`);
            const result = await uploadToCloudinary(localPath, 'posts');
            post.video = result.url;
            await post.save();
            console.log(`✅ Migrated post video: ${result.url}`);
          }
        } catch (error) {
          console.error(`❌ Failed to migrate post video: ${post.video}`, error.message);
        }
      }
    }
    
    // 2. Migrate User Avatars
    console.log('\n👤 Migrating user avatars...');
    const users = await User.find({ 
      avatar: { $exists: true, $ne: null, $ne: '/assets/images/default-avatar.png' }
    });
    
    for (const user of users) {
      if (user.avatar && !user.avatar.includes('cloudinary.com')) {
        try {
          const localPath = path.join(__dirname, '..', user.avatar);
          if (fs.existsSync(localPath)) {
            console.log(`Uploading user avatar: ${user.avatar}`);
            const result = await uploadToCloudinary(localPath, 'avatars');
            user.avatar = result.url;
            await user.save();
            console.log(`✅ Migrated user avatar: ${result.url}`);
          }
        } catch (error) {
          console.error(`❌ Failed to migrate user avatar: ${user.avatar}`, error.message);
        }
      }
    }
    
    // 3. Migrate User Banners
    console.log('\n🖼️ Migrating user banners...');
    const usersWithBanners = await User.find({ 
      banner: { $exists: true, $ne: null, $ne: '/assets/images/default-banner.jpg' }
    });
    
    for (const user of usersWithBanners) {
      if (user.banner && !user.banner.includes('cloudinary.com')) {
        try {
          const localPath = path.join(__dirname, '..', user.banner);
          if (fs.existsSync(localPath)) {
            console.log(`Uploading user banner: ${user.banner}`);
            const result = await uploadToCloudinary(localPath, 'banners');
            user.banner = result.url;
            await user.save();
            console.log(`✅ Migrated user banner: ${result.url}`);
          }
        } catch (error) {
          console.error(`❌ Failed to migrate user banner: ${user.banner}`, error.message);
        }
      }
    }
    
    // 4. Migrate Community Images
    console.log('\n🏘️ Migrating community images...');
    const communities = await Community.find({ 
      image: { $exists: true, $ne: null }
    });
    
    for (const community of communities) {
      if (community.image && !community.image.includes('cloudinary.com')) {
        try {
          const localPath = path.join(__dirname, '..', community.image);
          if (fs.existsSync(localPath)) {
            console.log(`Uploading community image: ${community.image}`);
            const result = await uploadToCloudinary(localPath, 'communities');
            community.image = result.url;
            await community.save();
            console.log(`✅ Migrated community image: ${result.url}`);
          }
        } catch (error) {
          console.error(`❌ Failed to migrate community image: ${community.image}`, error.message);
        }
      }
    }
    
    // 5. Migrate Event Images
    console.log('\n🎉 Migrating event images...');
    const events = await Event.find({ 
      coverImage: { $exists: true, $ne: null }
    });
    
    for (const event of events) {
      if (event.coverImage && !event.coverImage.includes('cloudinary.com')) {
        try {
          const localPath = path.join(__dirname, '..', event.coverImage);
          if (fs.existsSync(localPath)) {
            console.log(`Uploading event image: ${event.coverImage}`);
            const result = await uploadToCloudinary(localPath, 'events');
            event.coverImage = result.url;
            await event.save();
            console.log(`✅ Migrated event image: ${result.url}`);
          }
        } catch (error) {
          console.error(`❌ Failed to migrate event image: ${event.coverImage}`, error.message);
        }
      }
    }
    
    // 6. Migrate Confession Images
    console.log('\n🤫 Migrating confession images...');
    const confessions = await Confession.find({ 
      image: { $exists: true, $ne: null }
    });
    
    for (const confession of confessions) {
      if (confession.image && !confession.image.includes('cloudinary.com')) {
        try {
          const localPath = path.join(__dirname, '..', confession.image);
          if (fs.existsSync(localPath)) {
            console.log(`Uploading confession image: ${confession.image}`);
            const result = await uploadToCloudinary(localPath, 'confessions');
            confession.image = result.url;
            await confession.save();
            console.log(`✅ Migrated confession image: ${result.url}`);
          }
        } catch (error) {
          console.error(`❌ Failed to migrate confession image: ${confession.image}`, error.message);
        }
      }
    }
    
    console.log('\n🎉 Migration completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Verify all files are uploaded to Cloudinary');
    console.log('2. Test the application functionality');
    console.log('3. Remove local upload directories');
    console.log('4. Update .gitignore to exclude upload directories');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Clean up local upload directories
async function cleanupLocalFiles() {
  console.log('\n🧹 Cleaning up local upload directories...');
  
  const directories = [
    path.join(__dirname, '..', 'uploads'),
    path.join(__dirname, '..', '..', 'frontend', 'assets', 'uploads')
  ];
  
  for (const dir of directories) {
    if (fs.existsSync(dir)) {
      try {
        fs.rmSync(dir, { recursive: true, force: true });
        console.log(`✅ Removed directory: ${dir}`);
      } catch (error) {
        console.error(`❌ Failed to remove directory: ${dir}`, error.message);
      }
    }
  }
  
  console.log('🧹 Cleanup completed!');
}

// Main execution
if (require.main === module) {
  const command = process.argv[2];
  
  if (command === 'cleanup') {
    cleanupLocalFiles();
  } else {
    migrateToCloudinary();
  }
}

module.exports = { migrateToCloudinary, cleanupLocalFiles }; 