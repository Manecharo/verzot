# Supabase Database Connection Guide

## Overview

This document provides detailed information about the Supabase PostgreSQL database connection setup for the Verzot application, including connection options, troubleshooting steps, and best practices.

## Connection Options

Supabase offers multiple ways to connect to your PostgreSQL database:

### 1. Direct Connection

```
postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
```

- Uses IPv6 addressing
- Ideal for persistent servers that support IPv6
- Provides lowest latency connection directly to the database
- Not recommended for environments without IPv6 support

### 2. Connection Pooler (Session Mode)

```
postgres://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres
```

- Uses IPv4 addressing
- Maintains connection across multiple queries
- Good for traditional web applications
- Our preferred method for the Verzot application

### 3. Connection Pooler (Transaction Mode)

```
postgres://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

- Uses IPv4 addressing
- Releases connection after each transaction
- Ideal for serverless functions or edge environments
- Does not support prepared statements

## Current Configuration

We are using the Connection Pooler in Session Mode with the following configuration:

```javascript
// Environment variable (in .env)
DATABASE_URL=postgres://postgres.iqnkstwzzymqyahlztdx:123Verzot123!@aws-0-us-east-1.pooler.supabase.com:5432/postgres

// Sequelize configuration (in db.config.js)
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false // Important for connecting to Supabase
    }
  }
});
```

## Common Issues and Troubleshooting

### 1. "Host not found" error

```
Error: getaddrinfo ENOTFOUND db.iqnkstwzzymqyahlztdx.supabase.co
```

- **Cause**: DNS resolution failure, commonly due to IPv6 issues
- **Solution**: Use the Connection Pooler option which uses IPv4 addressing

### 2. "Tenant or user not found" error

```
Error: Tenant or user not found
```

- **Cause**: Incorrect username format in the connection string
- **Solution**: Ensure username has the format `postgres.[PROJECT_REF]` for connection pooler

### 3. SSL/TLS Connection Issues

```
Error: self signed certificate
```

- **Cause**: SSL verification problems
- **Solution**: Set `rejectUnauthorized: false` in dialectOptions.ssl (for development only)

### 4. Connection Timeout

```
Error: Connection timed out
```

- **Cause**: Network restrictions or firewall issues
- **Solution**: Check firewall settings and network connectivity

## Testing Database Connection

We've created a utility script for testing the database connection:

```javascript
// utils/test-db-connection.js
require('dotenv').config();
const { sequelize, testConnection } = require('../config/db.config');

async function testDatabaseConnection() {
  // Test connection and display results
  // ...
}

testDatabaseConnection();
```

To run the test:

```bash
cd verzot/backend
node utils/test-db-connection.js
```

## Best Practices

1. **Security**: 
   - Never commit database credentials to version control
   - Use environment variables for all sensitive information

2. **Connection Pooling**:
   - Use appropriate pool settings based on expected load
   - Default max: 5 connections is sufficient for development

3. **Error Handling**:
   - Implement comprehensive error handling for database operations
   - Log meaningful error messages for troubleshooting

4. **Connection Management**:
   - Release connections when no longer needed
   - Handle reconnection attempts for transient failures

5. **Monitoring**:
   - Monitor connection usage and performance
   - Set up alerts for database connectivity issues

## References

- [Supabase Database Connection Documentation](https://supabase.com/docs/guides/database/connecting-to-postgres)
- [Sequelize Documentation](https://sequelize.org/master/)
- [PostgreSQL Connection Settings](https://www.postgresql.org/docs/current/runtime-config-connection.html) 