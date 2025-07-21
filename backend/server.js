const fastify = require("fastify")({ logger: true });
const cors = require("@fastify/cors");
require("dotenv").config();

// PostgreSQL connection
const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || "projects_db",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "password",
});

// Register CORS with specific origin
fastify.register(cors, {
  origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
});

// Health check endpoint
fastify.get("/health", async (request, reply) => {
  return { status: "OK", message: "Server is running" };
});

// Get all projects with search functionality
fastify.get("/api/projects", async (request, reply) => {
  try {
    const { search, projectId, applicant, projectName } = request.query;
    const client = await pool.connect();

    let query = `
      SELECT 
        "project id",
        "project name", 
        status, 
        applicant, 
        "submission date",
        place,
        "user"
      FROM projects 
    `;

    const params = [];
    const conditions = [];

    // Handle search parameter (searches across multiple fields)
    if (search && search.trim()) {
      const searchTerm = `%${search.trim()}%`;
      conditions.push(`(
        CAST("project id" AS TEXT) ILIKE $${params.length + 1} OR
        "project name" ILIKE $${params.length + 1} OR
        applicant ILIKE $${params.length + 1}
      )`);
      params.push(searchTerm);
    }

    // Handle specific field searches
    if (projectId && projectId.trim()) {
      conditions.push(`CAST("project id" AS TEXT) ILIKE $${params.length + 1}`);
      params.push(`%${projectId.trim()}%`);
    }

    if (applicant && applicant.trim()) {
      conditions.push(`applicant ILIKE $${params.length + 1}`);
      params.push(`%${applicant.trim()}%`);
    }

    if (projectName && projectName.trim()) {
      conditions.push(`"project name" ILIKE $${params.length + 1}`);
      params.push(`%${projectName.trim()}%`);
    }

    // Add WHERE clause if there are conditions
    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }

    query += ` ORDER BY "submission date" DESC`;

    const result = await client.query(query, params);
    client.release();

    return {
      success: true,
      data: result.rows,
      count: result.rows.length,
      searchApplied: conditions.length > 0,
    };
  } catch (error) {
    fastify.log.error(error);
    return reply.status(500).send({
      success: false,
      error: "Failed to fetch projects",
      details: error.message,
    });
  }
});

// Get project by ID
fastify.get("/api/projects/:id", async (request, reply) => {
  try {
    const { id } = request.params;
    const client = await pool.connect();
    const result = await client.query(
      `
      SELECT 
        "project id",
        "project name", 
        status, 
        applicant, 
        "submission date",
        place,
        "user"
      FROM projects 
      WHERE "project id" = $1
    `,
      [id]
    );
    client.release();

    if (result.rows.length === 0) {
      return reply.status(404).send({
        success: false,
        error: "Project not found",
      });
    }

    return {
      success: true,
      data: result.rows[0],
    };
  } catch (error) {
    fastify.log.error(error);
    return reply.status(500).send({
      success: false,
      error: "Failed to fetch project",
      details: error.message,
    });
  }
});

// Create project
fastify.post("/api/project", async (request, reply) => {
  try {
    const { name, status, applicant, place, user } = request.body;
    if (!name || !status || !applicant || !place || !user) {
      return reply.status(400).send({
        success: false,
        error: "Missing required fields.",
      });
    }
    const client = await pool.connect();
    const insertQuery = `
      INSERT INTO projects (
        "project name", status, applicant, "submission date", place, "user"
      ) VALUES ($1, $2, $3, NOW(), $4, $5)
      RETURNING 
        "project id",
        "project name",
        status,
        applicant,
        "submission date",
        place,
        "user"
    `;
    const result = await client.query(insertQuery, [
      name,
      status,
      applicant,
      place,
      user,
    ]);
    client.release();
    return {
      success: true,
      data: result.rows[0],
    };
  } catch (error) {
    fastify.log.error(error);
    return reply.status(500).send({
      success: false,
      error: "Failed to create project",
      details: error.message,
    });
  }
});

// Start server
const start = async () => {
  try {
    await fastify.listen({
      port: process.env.PORT || 3001,
      host: "0.0.0.0",
    });
    fastify.log.info(`Server listening on ${fastify.server.address().port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
