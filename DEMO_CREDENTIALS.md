# 🔐 Demo Login Credentials

This document contains all demo login credentials for testing the application.

## ⚠️ Important
- These are **demo/test credentials only**
- Do **NOT** use these in production
- Credentials are stored in-memory (browser localStorage)
- All users are pre-configured for testing

---

## 👨‍💼 Admin Users

### Admin User
- **Email**: `admin@datamorphosis.in`
- **Password**: `password123`
- **Role**: Admin
- **Dashboard**: `/admin`
- **Access**: Full admin access, can view all customers

---

## 👥 Customer Users

### 1. Renka Premices (Primary Customer)
- **Email**: `renka@premices.com`
- **Password**: `renka123`
- **Role**: Customer
- **Dashboard**: `/customer`
- **Name**: Renka Premices
- **Phone**: +91 9876543211

### 2. John Smith
- **Email**: `john.smith@example.com`
- **Password**: `john123`
- **Role**: Customer
- **Dashboard**: `/customer`
- **Name**: John Smith
- **Phone**: +91 9876543212

### 3. Sarah Johnson
- **Email**: `sarah.johnson@example.com`
- **Password**: `sarah123`
- **Role**: Customer
- **Dashboard**: `/customer`
- **Name**: Sarah Johnson
- **Phone**: +91 9876543213

### 4. Michael Chen
- **Email**: `michael.chen@example.com`
- **Password**: `michael123`
- **Role**: Customer
- **Dashboard**: `/customer`
- **Name**: Michael Chen
- **Phone**: +91 9876543214

### 5. Emily Davis
- **Email**: `emily.davis@example.com`
- **Password**: `emily123`
- **Role**: Customer
- **Dashboard**: `/customer`
- **Name**: Emily Davis
- **Phone**: +91 9876543215

---

---

## 📋 Quick Reference Table

| Role | Email | Password | Dashboard |
|------|-------|----------|-----------|
| Admin | `admin@datamorphosis.in` | `password123` | `/admin` |
| Customer | `renka@premices.com` | `renka123` | `/customer` |
| Customer | `john.smith@example.com` | `john123` | `/customer` |
| Customer | `sarah.johnson@example.com` | `sarah123` | `/customer` |
| Customer | `michael.chen@example.com` | `michael123` | `/customer` |
| Customer | `emily.davis@example.com` | `emily123` | `/customer` |

---

## 🚀 How to Use

1. **Start the application**: `npm run dev`
2. **Navigate to**: `http://localhost:5173/login`
3. **Enter credentials** from the table above
4. **Click "Sign In"**
5. **You'll be redirected** to the appropriate dashboard

---

## 🎯 Testing Scenarios

### Admin Testing
- Login as: `admin@datamorphosis.in` / `password123`
- Should see all customers in admin dashboard
- Can manage customers and view analytics

### Customer Testing (Renka Premices)
- Login as: `renka@premices.com` / `renka123`
- Should see customer dashboard
- Can view analytics, cameras, and settings
- Appears in admin dashboard when admin logs in

### Multiple Customers (Companies)
- Test with different customer accounts
- Each customer represents a company
- All companies visible to admin in Companies tab

---

## 📝 Notes

- All passwords follow pattern: `{firstname}123`
- Admin password: `password123`
- All users are pre-created and ready to use
- Data persists in browser localStorage
- Can register new users (they'll be added to the list)

---

## 🔄 Register New Users

You can also register new users:
1. Go to `/register`
2. Fill in the form
3. New user will be created
4. Auto-login and redirect to dashboard

New registered users will have:
- Role: Customer (default)
- Password: What you entered
- Stored in browser localStorage

---

**Last Updated**: 2024-12-20

