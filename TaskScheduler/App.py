from PyQt6.QtGui import QColor, QPalette
from PyQt6.QtWidgets import (
    QApplication, QMainWindow, QTabWidget, QVBoxLayout, QHBoxLayout, QWidget, QLineEdit,
    QLabel, QScrollArea, QPushButton, QGridLayout, QSpacerItem, QSizePolicy, QDialog,
    QDialogButtonBox, QDateEdit
)
from PyQt6.QtCore import Qt, QDate
import sys
import DB


class TaskDialog(QDialog):
    def __init__(self):
        super().__init__()

        self.setWindowTitle("Add Task")
        self.setModal(True)
        self.layout = QVBoxLayout(self)

        self.task_description = QLineEdit(self)
        self.task_description.setPlaceholderText("Enter task description...")
        self.layout.addWidget(self.task_description)

        self.start_date_edit = QDateEdit(self)
        self.start_date_edit.setCalendarPopup(True)
        self.start_date_edit.setDate(QDate.currentDate())
        self.layout.addWidget(QLabel("Start Date:"))
        self.layout.addWidget(self.start_date_edit)

        self.end_date_edit = QDateEdit(self)
        self.end_date_edit.setCalendarPopup(True)
        self.end_date_edit.setDate(QDate.currentDate())
        self.layout.addWidget(QLabel("End Date:"))
        self.layout.addWidget(self.end_date_edit)

        # Adjust stylesheet for QDateEdit to increase padding around arrows
        self.start_date_edit.setStyleSheet("QDateEdit { padding: 5px; }")
        self.end_date_edit.setStyleSheet("QDateEdit { padding: 5px; }")

        self.buttons = QDialogButtonBox(QDialogButtonBox.StandardButton.Ok | QDialogButtonBox.StandardButton.Cancel)
        self.buttons.accepted.connect(self.accept)
        self.buttons.rejected.connect(self.reject)
        self.layout.addWidget(self.buttons)
        self.setLayout(self.layout)

    def get_task_details(self):
        task_description = self.task_description.text()
        start_date = self.start_date_edit.date().toString(Qt.DateFormat.ISODate)
        end_date = self.end_date_edit.date().toString(Qt.DateFormat.ISODate)
        return task_description, start_date, end_date


class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Task Scheduler")
        self.resize(960, 500)

        # Set window background color
        palette = self.palette()
        palette.setColor(QPalette.ColorRole.Window, QColor("black"))
        self.setPalette(palette)

        self.tabs = QTabWidget()
        self.tabs.setTabPosition(QTabWidget.TabPosition.West)
        self.tabs.setMovable(False)
        self.tabs.setUsesScrollButtons(False)

        # Set stylesheet to color tab buttons
        self.tabs.setStyleSheet("""
            QTabBar::tab {
                background: #E1E0E0;
                color: black;
                padding: 10px;
                margin: 5px;
            }
            QTabBar::tab:selected {
                background: #616161;
                color: white;
            }
            QTabBar::tab:!selected {
                background: lightgray;
                color: black;
            }
            QTabWidget::pane {
                border: 1px solid black;
            }
        """)

        # Create different layouts for each tab
        self.today_layout = QVBoxLayout()

        self.Daily_label = QLabel("Today's Tasks")
        self.Daily_label.setStyleSheet("""QLabel { font-size: 25px;}""")
        self.Daily_label.setSizePolicy(QSizePolicy.Policy.Fixed, QSizePolicy.Policy.Fixed)
        self.today_layout.addWidget(self.Daily_label)

        # Add a spacer item to push the label to the top
        spacer = QSpacerItem(20, 20, QSizePolicy.Policy.Minimum, QSizePolicy.Policy.Minimum)
        self.today_layout.addItem(spacer)

        self.Daily_Tasks = QWidget()
        self.Daily_layout = QVBoxLayout()
        self.Daily_Tasks.setLayout(self.Daily_layout)

        self.Daily_scroll = QScrollArea()
        self.Daily_scroll.setHorizontalScrollBarPolicy(Qt.ScrollBarPolicy.ScrollBarAlwaysOff)
        self.Daily_scroll.setWidgetResizable(True)
        self.Daily_scroll.setWidget(self.Daily_Tasks)
        self.today_layout.addWidget(self.Daily_scroll)

        self.add_task_button = QPushButton("Add Task")
        self.add_task_button.clicked.connect(self.add_task)
        self.today_layout.addWidget(self.add_task_button)

        self.custom_layout = QVBoxLayout()

        # Custom layout elements
        self.Custom_label = QLabel("Custom Date Range Tasks")
        self.Custom_label.setStyleSheet("""QLabel { font-size: 25px;}""")
        self.Custom_label.setSizePolicy(QSizePolicy.Policy.Fixed, QSizePolicy.Policy.Fixed)
        self.custom_layout.addWidget(self.Custom_label)

        self.start_date_picker = QDateEdit(self)
        self.start_date_picker.setCalendarPopup(True)
        self.start_date_picker.setDate(QDate.currentDate())
        self.custom_layout.addWidget(QLabel("Start Date:"))
        self.custom_layout.addWidget(self.start_date_picker)

        self.end_date_picker = QDateEdit(self)
        self.end_date_picker.setCalendarPopup(True)
        self.end_date_picker.setDate(QDate.currentDate())
        self.custom_layout.addWidget(QLabel("End Date:"))
        self.custom_layout.addWidget(self.end_date_picker)

        self.filter_button = QPushButton("Filter Tasks")
        self.filter_button.clicked.connect(self.filter_tasks_by_date)
        self.custom_layout.addWidget(self.filter_button)

        self.Custom_Tasks = QWidget()

        self.Custom_task_layout = QVBoxLayout()
        self.Custom_Tasks.setLayout(self.Custom_task_layout)

        self.Custom_scroll = QScrollArea()
        self.Custom_scroll.setHorizontalScrollBarPolicy(Qt.ScrollBarPolicy.ScrollBarAlwaysOff)
        self.Custom_scroll.setWidgetResizable(True)
        self.Custom_scroll.setWidget(self.Custom_Tasks)
        self.custom_layout.addWidget(self.Custom_scroll)

        # Create dummy widgets to add to tabs
        self.today_widget = QWidget()
        self.today_widget.setLayout(self.today_layout)

        self.custom_widget = QWidget()
        self.custom_widget.setStyleSheet("""QPushButton {
            background: black;
            color: white;
        }
        QDateEdit {
        background: #CECECE;
        color: black;
        }
        
        """)
        self.custom_widget.setLayout(self.custom_layout)

        # Add tabs
        self.tabs.addTab(self.today_widget, "Today")
        self.tabs.addTab(self.custom_widget, "Custom")

        # Add the tab widget to a main layout
        main_layout = QHBoxLayout()
        main_layout.addWidget(self.tabs)

        # Create a main widget and set the layout
        main_widget = QWidget()
        main_widget.setStyleSheet("""QWidget {
                        background-color: #C6C5C5;
                        }
                        QLabel {
                        color: black;
                        } """)
        main_widget.setLayout(main_layout)

        self.DBController = DB.DBController('TaskDB.db')

        self.current_date = QDate.currentDate().toString(Qt.DateFormat.ISODate)
        self.custom_start_date = QDate.currentDate().toString(Qt.DateFormat.ISODate)
        self.custom_end_date = QDate.currentDate().toString(Qt.DateFormat.ISODate)
        self.load_tasks()

        self.setCentralWidget(main_widget)

    def load_tasks(self):
        self.clear_layout(self.Daily_layout)
        self.clear_layout(self.Custom_task_layout)

        late_tasks = self.DBController.get_late_tasks(self.current_date, self.current_date)
        for task in late_tasks:
            self.AddTask(task[1], task[2], task[3], task[4], task[0], self.Daily_layout,False)

        tasks = self.DBController.get_tasks(self.current_date, self.current_date)
        for task in tasks:
            self.AddTask(task[1], task[2], task[3], task[4],task[0],self.Daily_layout, True)

        completed_tasks = self.DBController.get_tasks(self.current_date, self.current_date, True)
        for completed_task in completed_tasks:
            self.AddTask(completed_task[1], completed_task[2], completed_task[3], completed_task[4],completed_task[0],self.Daily_layout, True)

        tasks = self.DBController.get_tasks(self.custom_start_date, self.custom_end_date)
        for task in tasks:
            self.AddTask(task[1], task[2], task[3], task[4], task[0], self.Custom_task_layout,True)

        completed_tasks = self.DBController.get_tasks(self.custom_start_date, self.custom_end_date, True)
        for completed_task in completed_tasks:
            self.AddTask(completed_task[1], completed_task[2], completed_task[3], completed_task[4], completed_task[0], self.Custom_task_layout,True)

    def add_task(self):
        dialog = TaskDialog()
        if dialog.exec() == QDialog.DialogCode.Accepted:
            task_description, start_date, end_date = dialog.get_task_details()
            self.DBController.add_task(task_description, start_date, end_date)
            self.load_tasks()

    def AddTask(self, text, start_date, end_date, completed, task_id, widget, not_late):
        TaskWidget = QWidget()
        TaskWidget.setSizePolicy(QSizePolicy.Policy.Preferred, QSizePolicy.Policy.Fixed)
        GridLayout = QGridLayout()
        Short_text = self.truncate_text(text, 100)
        TaskLabel = QLabel(Short_text)
        TaskLabel.setWordWrap(True)
        TaskLabel.setTextInteractionFlags(Qt.TextInteractionFlag.TextSelectableByMouse)
        TaskLabel.setStyleSheet("QLabel { color: black; }")

        StartDateLabel = QLabel(f"Start: {start_date}")
        EndDateLabel = QLabel(f"End: {end_date}")
        DoneButton = QPushButton("Done")
        DoneButton.setCheckable(True)
        DoneButton.clicked.connect(lambda: self.complete_task(task_id))
        DeleteButton = QPushButton("Delete")
        DeleteButton.setCheckable(True)
        DeleteButton.clicked.connect(lambda: self.remove_task(task_id))
        GridLayout.addWidget(TaskLabel, 0, 0, 1, 2)
        GridLayout.addWidget(StartDateLabel, 1, 0)
        GridLayout.addWidget(EndDateLabel, 1, 1)
        GridLayout.addWidget(DeleteButton, 2, 0, 1, 1)

        TaskWidget.setLayout(GridLayout)
        if(not_late):
            if(completed):
                TaskWidget.setStyleSheet("""QWidget { background-color: #77FEC4;}
                                         QLabel { color: black;}
                                         QPushButton {background-color: black; color: white; border-radius: 100px;}"""
                                         )
            else:
                GridLayout.addWidget(DoneButton, 2, 1, 1, 1)
                TaskWidget.setStyleSheet("""QWidget { background-color: #77F5FE;}
                                         QLabel { color: black;}
                                         QPushButton {background-color: black; color: white; border-radius: 100px;}""")
        else:
            GridLayout.addWidget(DoneButton, 2, 1, 1, 1)
            TaskWidget.setStyleSheet("""QWidget { background-color: #FE7D7D;}
                                                     QLabel { color: black;}
                                                     QPushButton {background-color: black; color: white; border-radius: 100px;}""")
        widget.addWidget(TaskWidget)

        # Add a spacer to push tasks to the top and prevent them from expanding
        self.add_spacer(widget)

    def complete_task(self, task_id):
        self.DBController.update_task(task_id,True)
        self.clear_layout(self.Daily_layout)
        self.load_tasks()

    def clear_layout(self, layout):
        if layout is not None:
            while layout.count():
                item = layout.takeAt(0)
                widget = item.widget()
                if widget is not None:
                    widget.deleteLater()
                else:
                    layout.removeItem(item)

    def remove_task(self,task_id):
        self.DBController.delete_task(task_id)
        self.load_tasks()

    def add_spacer(self, widget):
        # Remove all existing spacers
        for i in reversed(range(widget.count())):
            item = widget.itemAt(i)
            if isinstance(item, QSpacerItem):
                widget.removeItem(item)

        # Add a new spacer item at the bottom
        spacer = QSpacerItem(20, 20, QSizePolicy.Policy.Minimum, QSizePolicy.Policy.Expanding)
        widget.addItem(spacer)

    def truncate_text(self,text, max_length):
        if len(text) > max_length:
            return text[:max_length] + "..."
        return text

    def filter_tasks_by_date(self):
        self.custom_start_date = self.start_date_picker.date().toString(Qt.DateFormat.ISODate)
        self.custom_end_date = self.end_date_picker.date().toString(Qt.DateFormat.ISODate)
        self.load_tasks()

app = QApplication(sys.argv)
window = MainWindow()
window.show()
app.exec()
