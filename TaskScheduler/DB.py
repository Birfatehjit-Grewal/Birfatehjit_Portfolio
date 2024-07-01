import sqlite3


class DBController:
    def __init__(self, db_name):
        self.db_name = db_name
        self.conn = None
        self.cursor = None
        self.connect()
        self.create_table_if_not_exists()

    def connect(self):
        """Connect to the SQLite database."""
        self.conn = sqlite3.connect(self.db_name)
        self.cursor = self.conn.cursor()

    def close(self):
        """Close the connection to the database."""
        if self.conn:
            self.conn.close()

    def create_table_if_not_exists(self):
        """Create the tasks table if it does not already exist."""
        create_table_sql = '''
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY,
            description TEXT NOT NULL,
            start_date TEXT NOT NULL,
            end_date TEXT NOT NULL,
            completed BOOLEAN NOT NULL CHECK (completed IN (0, 1))
        )
        '''
        self.cursor.execute(create_table_sql)
        self.conn.commit()

    def add_task(self, description, start_date, end_date, completed=False):
        """Add a new task to the database."""
        insert_sql = '''
        INSERT INTO tasks (description, start_date, end_date, completed)
        VALUES (?, ?, ?, ?)
        '''
        self.cursor.execute(insert_sql, (description, start_date, end_date, completed))
        self.conn.commit()
        return self.cursor.lastrowid

    def get_tasks(self, start=None, end=None, completed=False):
        """Retrieve all tasks from the database, optionally filtering by date range."""
        query = "SELECT id, description, start_date, end_date, completed FROM tasks"
        params = []

        if start and end:
            query += " WHERE end_date >= ? AND end_date <= ? AND completed = ?"
            params.extend([start, end, 1 if completed else 0])
        else:
            query += " WHERE completed = ?"
            params.append(1 if completed else 0)

        query += " ORDER BY end_date ASC"
        self.cursor.execute(query, tuple(params))
        return self.cursor.fetchall()

    def get_late_tasks(self, start=None, end=None, completed=False):
        """Retrieve all tasks from the database that have not been completed and are past there end date"""
        query = "SELECT id, description, start_date, end_date, completed FROM tasks"
        params = []

        if start and end:
            query += " WHERE end_date < ? AND completed = ?"
            params.extend([start, 1 if completed else 0])
        query += " ORDER BY end_date ASC"
        self.cursor.execute(query, tuple(params))
        return self.cursor.fetchall()
    def update_task(self, task_id, completed):
        """Update the completed status of a task."""
        update_sql = "UPDATE tasks SET completed = ? WHERE id = ?"
        self.cursor.execute(update_sql, (completed, task_id))
        self.conn.commit()

    def delete_task(self, task_id):
        """Delete a task from the database."""
        delete_sql = "DELETE FROM tasks WHERE id = ?"
        self.cursor.execute(delete_sql, (task_id,))
        self.conn.commit()
