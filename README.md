This is a Desktop App written by Electron and Node, to management de CRUD of more than 150,000 records of a table in SQLite.

## Project: Historical Records Management System - Concejo Municipal de Maracaibo

This project is a robust desktop application designed and developed for the Legal Council of the Municipality of Maracaibo in Zulia State, Venezuela. The primary objective of this application is to manage the extensive historical records of the City Hall of Maracaibo, which date back to 1820. The application facilitates the efficient management of these records through a comprehensive CRUD (Create, Read, Update, Delete) interface, ensuring data integrity and accessibility.

### Technical Description

This desktop application is built using a modern technology stack that includes Electron and Node.js, enabling a seamless and efficient user experience. The application is designed to handle a large volume of data, specifically managing over 150,000 records in a structured and reliable manner.

#### Key Features

-   **CRUD Operations**: The core functionality revolves around CRUD operations, allowing users to create new records, read existing ones, update entries, and delete outdated information.
-   **Data Management**: The system efficiently manages a vast dataset of historical records, ensuring data integrity and preventing data loss.
-   **Database**: The application uses SQLite to store historical data, providing a lightweight and embedded database solution suitable for desktop environments.
-   **User Interface**: The application features a user-friendly interface that simplifies navigation and data interaction.

### File Structure and Descriptions

The project includes the following files, organized to ensure clarity and maintainability:

-   `README.md`: This file, providing an overview of the project.
-   `concejo.ico`: Icon for the application.
-   `matrimoniosqlite.db`: SQLite database file storing the records.
-   `package.json`: npm package manager file.
-   `postcss.config.js`: Configuration for PostCSS.
-   `tailwind.config.js`: Configuration for Tailwind CSS.
-   `back/db.js`: Database connection logic.
-   `back/filter.js`: Functionality to filter records.
-   `back/login.js`: User authentication module.
-   `back/main.js`: Main process file for Electron.
-   `back/mariadb.js`: MariaDB database interaction.
-   `back/queries.js`: SQL query helper functions.
-   `back/renderer.js`: Functions for rendering views.
-   `back/rendererMatrimonios.js`: Module for managing matrimony records.
-   `front/index.html`: Main application view.
-   `front/insertaMatrimonios.html`: View to insert new marriage records.
-   `front/login.html`: Login view.
-   `front/menuArchivos.html`: View for file management menu.
-   `front/operador.html`: Main operator view.
-   `front/style.css`: Styles for the front-end components.
-   `public/style.css`: Styles shared between public components.
-   `front/matrimonios/buscar.html`: View to search marriage records.
-   `front/matrimonios/insertar.html`: View to insert marriage records.
-   `front/matrimonios/insertarForm.html`: Form to insert marriage records.
-   `public/img/actas.webp`: Image for acts.
-   `public/img/cementerio.gif`: Image for cemetery.
-   `public/img/laboral.gif`: Image for work.
-   `public/img/matrimonio.gif`: Image for marriage.


