# CampusFind — College Lost & Found Portal

A beginner-friendly full-stack project built with HTML, CSS, JavaScript, Node.js, Express.js, and MySQL.

## Features
- Add a lost or found item
- Search by item name, location, or description
- Filter listings by Lost or Found
- Mark an item as Returned
- Save records in MySQL so they remain after refresh
- Responsive layout for desktop and mobile

## Requirements
- Node.js installed
- MySQL Server installed and running
- VS Code (recommended)

## Setup in VS Code

### 1. Extract the ZIP
Extract the project folder, then open `college-lost-found` in VS Code.

### 2. Create the database
Open MySQL Workbench (or the MySQL command line) and run the contents of `setup.sql`. This creates the database and table, plus two optional demo items.

### 3. Configure your database password
Copy `.env.example` and rename the copy to `.env`.
Open `.env` and set `DB_PASSWORD` to your own MySQL password. If your MySQL username is not `root`, update `DB_USER` too.

Example:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_actual_password
DB_NAME=college_lost_found
PORT=3000
```
Do not share your `.env` file or password.

### 4. Install dependencies
Open Terminal in the project folder and run:
```bash
npm install
```

### 5. Start the project
```bash
npm start
```
Open this address in your browser:
http://localhost:3000

For development with automatic server restart (supported Node versions):
```bash
npm run dev
```

## How to demo it
1. Add a listing such as “Black Water Bottle” with type “Found”.
2. Search for “Water Bottle”.
3. Click “Mark returned”.
4. Refresh the page to show the data is stored in MySQL.

## Common problems
- **Access denied for user**: check `DB_USER` and `DB_PASSWORD` in `.env`.
- **Unknown database**: run `setup.sql` in MySQL.
- **Could not load items**: make sure MySQL is running and the database/table exist.
- **Port already in use**: change `PORT=3001` in `.env`, then open `http://localhost:3001`.

## Notes
This is a college demo project, not a production service. It does not include login, verified ownership, or secure user accounts. Avoid posting private details or full identity-card numbers in demo listings.
