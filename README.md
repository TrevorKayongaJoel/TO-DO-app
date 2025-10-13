# 📝 To-Do

A full-stack To-Do web app built with **React (Vite)** on the frontend and **Flask** on the backend.
Persistent storage via **SQLite**.

## Tech

- Frontend: React + Vite + Axios + @hello-pangea/dnd
- Backend: Flask + SQLAlchemy + CORS
- DB: SQLite

## Run locally

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate   # or venv\Scripts\activate on Windows
pip install -r requirements.txt
flask init-db
flask run
```

Serves API at `http://127.0.0.1:5000`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173`

## Features

- CRUD Tasks
- Filter by All / Completed / Pending
- Drag & Drop re-order (persisted)
- Inline edit (title/description)
- User authentication
- Email notifications on registration

## Email Configuration

To enable email notifications on registration, you need to configure the email settings by setting the following environment variables before running the backend server:

- `MAIL_SERVER`: The SMTP server of your email provider (e.g., `smtp.gmail.com` for Gmail).
- `MAIL_PORT`: The port of the SMTP server (e.g., `587` for Gmail with TLS).
- `MAIL_USE_TLS`: Set this to `True` if your server uses TLS (which is recommended).
- `MAIL_USERNAME`: Your email address.
- `MAIL_PASSWORD`: Your email password or an app-specific password.
- `MAIL_DEFAULT_SENDER`: The email address that will appear as the sender.

**Example for Gmail:**

If you are using Gmail, you will need to enable "Less secure app access" in your Google account settings, or preferably, create an "App Password".

Here's how you would set the environment variables in your terminal before running the Flask app:

```bash
export MAIL_SERVER='smtp.gmail.com'
export MAIL_PORT=587
export MAIL_USE_TLS=True
export MAIL_USERNAME='joeltrevork@gmail.com'
export MAIL_PASSWORD='jota pnuu dkyu muti'
export MAIL_DEFAULT_SENDER='joeltrevork@gmail.com'

cd backend
./venv/bin/flask run
```

**Important:**

- Remember to replace the placeholder values with your actual credentials.
- Do not share your credentials or commit them to version control.
- For production use, it is highly recommended to use a dedicated email sending service (e.g., SendGrid, Mailgun) and a more secure way to manage your credentials (e.g., a `.env` file with `python-dotenv`, or your hosting provider's secret management tools).
