## Flight Management System ✈️
## Overview 
The Flight Management System is a full-featured web application that allows users to book flights, manage passenger details, handle payments via Stripe API, check-in online, reserve seats, check luggage, and print boarding passes. This project provides a streamlined experience for both travelers and airline staff.

## Features
### User side
- Flight Booking: Book flights with real-time availability.
- Passenger Details: Entry and management of passenger information.
- Payment Integration: Secure payment processing through Stripe.
- Online Check-in: Check-in from home and select seats.
- Seat Reservation: Choose preferred seats during the booking or check-in process.
- Luggage Check-in: Add and pay for luggage at the time of booking.
- Boarding Pass: Generate and print your boarding pass after check-in.

### Admin Dashboard
- Employee Management: Add, edit, and delete employee details.
- Flight Management: View, add, and update flight information.
- Department Overview: See details of various departments and their employees.
- Passenger Management: View and manage passenger details.
- Customer Reviews: Read and respond to reviews or feedback from passengers.

## Technologies Used
- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express.js (or mention your preferred framework)
- Database: MySQL/PostgreSQL/MongoDB (or any other database you're using)
- Payment Gateway: Stripe API
- Authentication: JWT or OAuth (if used)
- Version Control: Git

## Working Screenshots:
### User side
##### Home Page:
![home](https://github.com/user-attachments/assets/e712a220-8227-4a8f-b3af-e11afd206d3a)
#### Ticket Booking:
![book_in](https://github.com/user-attachments/assets/6acba941-0792-4468-b117-b75fdac7ac8c)
![passengerInfo](https://github.com/user-attachments/assets/c02a4536-86eb-40b4-8c8e-483b913905de)
![checkout](https://github.com/user-attachments/assets/e30b43b6-cde7-49af-a49e-110eb73d0207)

#### Stripe Payment API
![STRIPE](https://github.com/user-attachments/assets/73d05a5c-d8ac-45f5-9355-84da12364a70)

#### Check-in
![check-in](https://github.com/user-attachments/assets/4c512557-c445-453c-a78e-76e6088a1dc7)
![boardingpass](https://github.com/user-attachments/assets/b314e99a-0fa7-4e65-a84a-738862c406a2)

### Admin Side
#### Admin Dashboard
![admindash](https://github.com/user-attachments/assets/81663bb6-51d4-494c-b5a2-de39f26afa9f)
#### Admin Options
![admin](https://github.com/user-attachments/assets/c3fd833b-b212-4675-8cad-5d40a2fbc8e0)

#### Customer Reviews
![reveiws](https://github.com/user-attachments/assets/6c38e359-39b6-4b66-a0b9-ce9992ee8c08)


## Steps to install
1. Clone the repository:
   ```
   git clone https://github.com/alpha0352/SE-Project.git
   cd SE-Project
   ```

2. npm install
3. Configure the environment variables. Create a .env file in the root directory and provide the following details:
```
  STRIPE_SECRET_KEY=your_stripe_secret_key
  DB_HOST=your_database_host
  DB_USER=your_database_user
  DB_PASSWORD=your_database_password
  DB_NAME=your_database_name
```
4. Run the application:
   `npm start`




