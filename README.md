# Auto Service Management System

A browser-based Auto Service Management System built with HTML, CSS, and JavaScript. The app lets a workshop register customers, register their vehicles, add diagnosis/service details, and look up a customer's linked vehicle records by name.

## Features

- User registration with name, phone, email, and address
- Vehicle registration linked to the registered user
- Diagnosis and service details for each vehicle
- User Vehicle Lookup page to search by customer name
- Service Records page with all registered user and vehicle records
- Edit and delete existing records
- Clear all records
- Left-side navigation that switches between Registration, User Vehicle Lookup, and Service Records
- Data saved in browser `localStorage`

## How To Use

1. Open the app in your browser.
2. Click **Registration** from the left panel.
3. Enter the user details, vehicle details, and diagnosis.
4. Submit the form to save the record.
5. Click **User Vehicle Lookup** and search by user name to see linked vehicle details.
6. Click **Service Records** to view, edit, delete, or clear records.

## Data Storage

This project uses browser `localStorage`, so records are saved only in the current browser on the current computer. Clearing browser storage or clicking **Clear All** will remove the saved records.

## Technologies Used

- HTML
- CSS
- JavaScript
- Browser localStorage
