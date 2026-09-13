const fs = require("fs");
const path = require("path");
const pool = require("./db");

async function runMigrations() {
    const client = await pool.connect();

    try {
        const dbInfo = await client.query(`
    SELECT current_database(), current_schema()
`);

        console.log(dbInfo.rows[0]);
        await client.query(`
            CREATE TABLE IF NOT EXISTS schema_migrations (
                id SERIAL PRIMARY KEY,
                migration_name VARCHAR(255) UNIQUE NOT NULL,
                executed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
        `);

        const migrationsPath = path.join(__dirname, "../migrations");

        const files = fs
            .readdirSync(migrationsPath)
            .filter((file) => file.endsWith(".sql"))
            .sort();

        for (const file of files) {
            const result = await client.query(
                "SELECT 1 FROM schema_migrations WHERE migration_name = $1",
                [file]
            );

            if (result.rowCount > 0) {
                console.log(`Already applied: ${file}`);
                continue;
            }

            console.log(`Running: ${file}`);

            const sql = fs.readFileSync(
                path.join(migrationsPath, file),
                "utf-8"
            );

            await client.query("BEGIN");

            try {
                await client.query(sql);

                await client.query(
                    "INSERT INTO schema_migrations (migration_name) VALUES ($1)",
                    [file]
                );

                await client.query("COMMIT");

                console.log(`Applied: ${file}`);
            } catch (error) {
                await client.query("ROLLBACK");
                throw error;
            }
        }

        console.log("Migrations completed.");
    } catch (error) {
        console.error("Migration failed:", error.message);
        process.exitCode = 1;
    } finally {
        client.release();
        await pool.end();
    }
}

runMigrations();