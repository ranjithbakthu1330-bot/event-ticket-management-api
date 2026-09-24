# Event Ticket Management API

A secure RESTful backend for managing college event ticket bookings, built during a 5-hour FullStack AI Hackathon.

## Tech Stack
* Node.js & Express
* SQLite3 (In-memory/Local)
* JWT Authentication & bcryptjs

## Core Features
1. **Role-Based Access:** Users can book tickets; Admins can manage events.
2. **Concurrency Control:** SQLite transactions prevent double-booking and race conditions.
3. **Capacity Management:** Real-time checking and updating of available seats.

## API Endpoints
* `POST /register` - Register a new user/admin
* `POST /login` - Authenticate and receive JWT
* `POST /events` - (Admin) Create a new event
* `GET /events` - View all active events
* `POST /bookings` - (User) Book a ticket (fails if capacity is met)
* `GET /bookings` - (User) View your booking history
* `PUT /bookings/:id/cancel` - (User) Cancel a booking and free up capacity
