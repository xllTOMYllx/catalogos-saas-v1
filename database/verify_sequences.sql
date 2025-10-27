-- Verification script for database sequences
-- Run this after init.sql to verify sequences are properly set
-- Usage: psql -U postgres -d catalogos_saas -f database/verify_sequences.sql

\echo '=== Verifying Database Sequences ==='
\echo ''

\echo '--- Users Table ---'
SELECT 'Current max ID: ' || COALESCE(MAX(id), 0) AS max_id FROM users;
SELECT 'Next sequence value will be: ' || nextval('users_id_seq') AS next_val;
-- Reset the sequence we just consumed for testing
SELECT setval('users_id_seq', COALESCE((SELECT MAX(id) FROM users), 1), true);

\echo ''
\echo '--- Clients Table ---'
SELECT 'Current max ID: ' || COALESCE(MAX(id), 0) AS max_id FROM clients;
SELECT 'Next sequence value will be: ' || nextval('clients_id_seq') AS next_val;
-- Reset the sequence we just consumed for testing
SELECT setval('clients_id_seq', COALESCE((SELECT MAX(id) FROM clients), 1), true);

\echo ''
\echo '--- Products Table ---'
SELECT 'Current max ID: ' || COALESCE(MAX(id), 0) AS max_id FROM products;
SELECT 'Next sequence value will be: ' || nextval('products_id_seq') AS next_val;
-- Reset the sequence we just consumed for testing
SELECT setval('products_id_seq', COALESCE((SELECT MAX(id) FROM products), 1), true);

\echo ''
\echo '--- Catalogs Table ---'
SELECT 'Current max ID: ' || COALESCE(MAX(id), 0) AS max_id FROM catalogs;
SELECT 'Next sequence value will be: ' || nextval('catalogs_id_seq') AS next_val;
-- Reset the sequence we just consumed for testing
SELECT setval('catalogs_id_seq', COALESCE((SELECT MAX(id) FROM catalogs), 1), true);

\echo ''
\echo '=== Verification Complete ==='
\echo ''
\echo 'The "Next sequence value" should always be greater than "Current max ID".'
\echo 'If not, you may encounter duplicate key errors when inserting new records.'
\echo ''
