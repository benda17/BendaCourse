# Excel User Import Guide

This guide explains how to import users from an Excel file into the course platform database.

## Excel File Format

Your Excel file should have the following columns:

### Required Columns:
- **email** (required): User's email address (will be used as login)
- **password** (required): User's password (will be hashed before storage)

### Optional Columns:
- **name**: User's full name
- **role**: User role - either "STUDENT" or "ADMIN" (default: "STUDENT")
- **courseId**: Course ID to automatically enroll the user in
- **courseSlug**: Course slug to automatically enroll the user in (alternative to courseId)
- **courseTitle**: Course title to automatically enroll the user in (alternative to courseId/courseSlug)

## Example Excel File

| email              | password | name      | role   | courseSlug                    |
|--------------------|----------|-----------|--------|-------------------------------|
| user1@example.com  | pass123  | John Doe  | STUDENT| benda-dropshipping-ebay-course|
| user2@example.com  | pass456  | Jane Smith| STUDENT| benda-dropshipping-ebay-course|
| admin@example.com  | admin123 | Admin User| ADMIN  |                               |

## How to Import

1. **Prepare your Excel file** with the columns mentioned above
2. **Run the import script**:
   ```bash
   npm run import:users path/to/your/file.xlsx
   ```

   Or using tsx directly:
   ```bash
   npx tsx scripts/import-users-from-excel.ts path/to/your/file.xlsx
   ```

## What the Script Does

1. Reads the Excel file
2. For each row:
   - Creates a new user if the email doesn't exist
   - Updates existing user if email already exists (updates password, name, role)
   - Hashes passwords securely using bcrypt
   - Optionally enrolls users in courses if course information is provided
3. Shows a summary of:
   - Number of users created
   - Number of users updated
   - Number of errors encountered

## Notes

- **Passwords are hashed**: All passwords are securely hashed before being stored in the database
- **Email is unique**: If a user with the same email already exists, their information will be updated
- **Course enrollment**: Users will only be enrolled if the course exists in the database. Make sure courses are created first using the sync or seed scripts.
- **Role validation**: Invalid roles will default to "STUDENT"

## Troubleshooting

### "File not found" error
- Make sure the file path is correct
- Use absolute paths if relative paths don't work: `C:\Users\YourName\Documents\users.xlsx`

### "Course not found" warnings
- Make sure courses exist in the database before importing users
- Check that courseId, courseSlug, or courseTitle matches exactly

### Database connection errors
- Make sure your `.env` file has the correct `DATABASE_URL`
- Ensure your database is running and accessible

## Security Notes

- Never commit Excel files with passwords to version control
- Delete Excel files with passwords after import
- Consider using temporary passwords and requiring users to change them on first login

