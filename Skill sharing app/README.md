Skill Sharing App - Setup Guide
A skill sharing platform where people can teach and learn from each other. You can create listings for skills you want to teach, browse what others are offering, message people directly, and leave reviews.

Getting Started
You'll need:

XAMPP (comes with MySQL and PHP 8.1+)
Node.js 18 or newer
Composer for PHP packages
Quick Setup
The fastest way to get everything running:

Set up the database

Open phpMyAdmin at http://localhost/phpmyadmin
Import the skillshare.sql file
This creates all the necessary tables
Add a few missing columns

In phpMyAdmin, go to the users table → Structure tab
Add these columns if they don't exist:
status (ENUM: active, pending, inactive) - default: active
bio (TEXT) - can be empty
avatar_url (VARCHAR 255) - can be empty
rating (FLOAT) - default: 0
total_reviews (INT) - default: 0
Start the backend

It'll run on http://localhost:8000

Start the frontend (open a new terminal)

This runs on http://localhost:3000

You're done!

Open http://localhost:3000 in your browser
Create an account and start exploring
How the App Works
What You Can Do
Sign up with email and password
Create skill listings if you want to teach something
Browse skills others are offering
Request exchanges when you find something you want to learn
Message people directly about exchanges
Leave reviews after completing exchanges
Save favorites with the bookmark feature
The Backend
The backend runs on Laravel and handles:

User registration and login
Skill management (create, edit, delete)
Managing exchange requests
Messaging system
Reviews and ratings
User profiles
All the .env settings are already configured, so you just need to make sure your MySQL database is running.

The Frontend
Built with Next.js, it talks directly to the backend API. Every page loads real data - there's no fake demo data anywhere.

The main pages are:

Home - See featured skills
Skills - Browse, search, and filter all available skills
Create Skill - Post something new you want to teach (need to be logged in)
Exchanges - See all your active skill exchanges
Messages - Chat with people about exchanges
Profile - View and edit your profile, see your teaching history
Database Tables
The app uses 8 tables:

users - All user accounts
skills - The skills people are offering to teach
categories - Types of skills (programming, design, cooking, etc.)
exchanges - Requests to learn a skill
messages - Messages between people in an exchange
reviews - Ratings and feedback after exchanges
bookmarks - Saved skills for later
personal_access_tokens - Login tokens
Running It All
You need three things running at the same time:

Terminal 1 - Database

Just start MySQL in XAMPP, or if you're comfortable with command line:
Terminal 2 - Backend

Terminal 3 - Frontend

Once all three are running, go to http://localhost:3000

API Endpoints
If you need to know what API calls the frontend is making, here's what's available:

User stuff:

POST /auth/register - Create new account
POST /auth/login - Log in
POST /auth/logout - Log out
GET /auth/me - Get your current profile
PUT /users/profile - Update your profile
Skills:

GET /skills - Get all skills
GET /skills/{id} - Get details about one skill
POST /skills - Create a new skill
PUT /skills/{id} - Edit your skill
DELETE /skills/{id} - Remove your skill
GET /skills?search=keyword - Search for skills
Exchanges:

GET /exchanges - See your exchanges
POST /exchanges - Request a skill exchange
POST /exchanges/{id}/accept - Accept a request
POST /exchanges/{id}/complete - Mark as done
POST /exchanges/{id}/cancel - Cancel it
Messages:

GET /messages/exchange/{id} - Get messages in an exchange
POST /messages - Send a message
PUT /messages/{id}/read - Mark message as read
Reviews:

POST /reviews - Leave a review
GET /reviews/user/{id} - See reviews about someone
Bookmarks:

POST /bookmarks - Save a skill
DELETE /bookmarks/{skillId} - Unsave it
GET /bookmarks - See your saved skills
Categories:

GET /categories - Get all skill categories
Common Issues
"Unknown column 'status'" error when signing up

You need to add those 5 columns to the users table (see setup section above)
Frontend shows blank page or errors

Check the browser console (press F12)
Make sure the backend is actually running on port 8000
Look at the Network tab to see if API calls are failing
Can't connect to the database

Make sure MySQL is running (check XAMPP)
Verify the database name is skillshare
Username should be root with no password
Getting CORS errors

The backend is set up to allow frontend on localhost:3000
If you changed ports, you might need to update CORS settings in the backend config
Node modules are causing issues

Features
User authentication (sign up, log in)
Create and manage skills
Search and filter skills
Request skill exchanges
Messaging system for coordination
Reviews and ratings
Bookmark skills to save for later
User profiles with history
File uploads for avatars and skill images
Works on mobile and desktop
What's Where
When You're Ready for Production
Before deploying to a real server:

Change APP_DEBUG to false in the backend .env
Use a real database, not localhost
Switch to HTTPS
Update CORS settings for your actual domain
Set up a real email service
Use cloud storage for file uploads instead of local storage
Set up proper logging and monitoring