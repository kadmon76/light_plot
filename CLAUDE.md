# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build/Lint/Test Commands
- Run server: `python manage.py runserver`
- Create migrations: `python manage.py makemigrations`
- Apply migrations: `python manage.py migrate`
- Create superuser: `python manage.py createsuperuser`
- Shell: `python manage.py shell`
- Test all: `python manage.py test`
- Test specific app: `python manage.py test designer`
- Test specific file: `python manage.py test designer.tests.test_models`

## Code Style Guidelines
- **Formatting**: Follow PEP 8 style guide for Python code
- **Imports**: Group imports: 1) Python standard library 2) Django modules 3) Third-party packages 4) Local modules
- **Naming**: snake_case for variables/functions, PascalCase for classes
- **Django Models**: Fields first, then Meta class, then methods
- **Error Handling**: Use try/except blocks; log errors with context; never suppress errors
- **Templates**: Use Django template inheritance with base.html
- **File Structure**: Modular organization - models/ for model modules
- **JavaScript**: Use ES6 syntax; organize code with proper namespacing