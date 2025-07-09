# Database Migrations and Seeding

This directory contains the database migration and seeding infrastructure for the BesicMining application.

## Directory Structure

- `migrations/` - Contains TypeORM migration files
- `seeds/` - Contains seeder files for populating the database with initial data
- `data-source.ts` - TypeORM data source configuration
- `database.module.ts` - NestJS module for database integration
- `database-cli.module.ts` - CLI commands for database operations

## Migrations

Migrations allow you to version control your database schema. They provide a way to incrementally update the database schema to keep it in sync with the application's data model while preserving existing data.

### Commands

- Generate a new migration (based on entity changes):
  ```bash
  npm run migration:generate -- migrations/MigrationName
  ```

- Create an empty migration file:
  ```bash
  npm run migration:create -- migrations/MigrationName
  ```

- Run pending migrations:
  ```bash
  npm run migration:run
  ```

- Revert the last migration:
  ```bash
  npm run migration:revert
  ```

## Seeding

Seeding allows you to populate your database with initial data for development and testing.

### Commands

- Create a new seeder:
  ```bash
  npm run seed:create -- SeedName
  ```

- Run all seeders:
  ```bash
  npm run seed:run
  ```

### Seeder Structure

- `base.seeder.ts` - Base seeder class with utility methods
- `main.seeder.ts` - Main seeder that orchestrates all other seeders
- Individual seeders (e.g., `user.seeder.ts`, `product.seeder.ts`)

## CLI Commands

The application also provides NestJS CLI commands for database operations:

- Run migrations:
  ```bash
  npm run cli:migrate
  ```

- Run seeders:
  ```bash
  npm run cli:seed
  ```

- Setup database (run migrations and seeders):
  ```bash
  npm run db:setup
  ``` 