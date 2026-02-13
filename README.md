# Sowron Interiors - Full Stack MERN Platform

Sowron Interiors is a full-stack interior design platform with:
- Public website (portfolio, gallery, enquiry, booking, estimate)
- OTP-based user authentication
- Admin panel for content + lead operations
- Real-time admin updates via Socket.IO

---

## Project Analysis (Codebase Summary)

This repository is a **split frontend/backend MERN project**:

- `frontend`: React + Vite + Tailwind app with public pages and admin dashboard
- `backend`: Express + MongoDB API with OTP auth, admin auth, media upload, analytics, and rate limiting

Core business modules in backend:
- Portfolio
- Gallery
- Categories
- Bookings
- Enquiries
- Estimates
- Feedback
- Admin auth + dashboard analytics
- User profile (OTP-based users)

---

## Key Features

- OTP registration/login for users (`/api/otp/*`)
- Admin login with password + OTP verification (`/api/admin/*`)
- Cloudinary image/file uploads
- Signed gallery image URLs with watermark support
- Booking slot blocking + status pipeline
- Lead management (enquiries + estimates) in admin panel
- Dashboard analytics (counts, trends, top cities/categories, activity feed)
- Real-time booking notifications via Socket.IO
- XLSX export in admin lists (bookings/enquiries/estimates)
- Security middlewares: Helmet, CORS whitelist, rate limiting, admin IP whitelist, admin audit logging

---

## Tech Stack

### Frontend
- React 19
- Vite
- Tailwind CSS
- React Router
- Axios
- Framer Motion
- Socket.IO Client
- Chart.js / react-chartjs-2
- XLSX + file-saver

### Backend
- Node.js + Express 5
- MongoDB + Mongoose
- JWT auth
- Cloudinary + Multer
- Nodemailer / Resend (email)
- Twilio API (SMS)
- Socket.IO
- express-rate-limit, helmet, compression, cookie-parser, morgan

---


<img width="1919" height="875" alt="Screenshot 2026-02-13 163522" src="https://github.com/user-attachments/assets/fd01d5ea-a320-4385-a824-dfcf222cd3b1" />

<img width="1918" height="868" alt="Screenshot 2026-02-13 163532" src="https://github.com/user-attachments/assets/31ffe61b-c182-40c4-a9e0-edf6d19dcc0c" />

<img width="1919" height="867" alt="Screenshot 2026-02-13 163606" src="https://github.com/user-attachments/assets/39a65ddb-34f1-496e-b216-0c787938460d" />

<img width="1664" height="839" alt="Screenshot 2026-02-13 163647" src="https://github.com/user-attachments/assets/1da24ccd-238a-42f0-83ff-9de29efbcf95" />

<img width="1590" height="846" alt="Screenshot 2026-02-13 163657" src="https://github.com/user-attachments/assets/bde107b5-ea26-4b51-9f74-208451641f59" />

<img width="1898" height="873" alt="Screenshot 2026-02-13 163809" src="https://github.com/user-attachments/assets/e6269a21-1a6d-44a2-a185-408ed3af9685" />

<img width="1919" height="884" alt="Screenshot 2026-02-13 163818" src="https://github.com/user-attachments/assets/27d3ef27-2236-4746-ab90-f240153eaa32" />

<img width="1919" height="873" alt="Screenshot 2026-02-13 163829" src="https://github.com/user-attachments/assets/3754200b-9d67-4dd4-b35a-21d6ad2e8b4d" />

<img width="1919" height="869" alt="Screenshot 2026-02-13 163840" src="https://github.com/user-attachments/assets/4b2f2560-3692-44ec-b6a3-92ed79571652" />

<img width="1919" height="871" alt="Screenshot 2026-02-13 163853" src="https://github.com/user-attachments/assets/6fecc2ee-ec01-4c4c-b973-cee6d03918ad" />

<img width="1919" height="881" alt="Screenshot 2026-02-13 163902" src="https://github.com/user-attachments/assets/9b3b3487-0e29-49de-bbd4-9917aa2d14b6" />

<img width="1897" height="871" alt="Screenshot 2026-02-13 163914" src="https://github.com/user-attachments/assets/74d1cf34-b41f-49d2-b728-59cea791d8f3" />
