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
    const { search, projectId, applicant, projectName, status, place, user } =
      request.query;
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

    // Handle multi-select status filter
    if (status) {
      if (Array.isArray(status)) {
        const placeholders = status.map((_, i) => `$${params.length + i + 1}`);
        conditions.push(`status IN (${placeholders.join(", ")})`);
        params.push(...status);
      } else if (typeof status === "string" && status.trim()) {
        conditions.push(`status = $${params.length + 1}`);
        params.push(status);
      }
    }

    // Handle multi-select place filter
    if (place) {
      if (Array.isArray(place)) {
        const placeholders = place.map((_, i) => `$${params.length + i + 1}`);
        conditions.push(`place IN (${placeholders.join(", ")})`);
        params.push(...place);
      } else if (typeof place === "string" && place.trim()) {
        conditions.push(`place = $${params.length + 1}`);
        params.push(place);
      }
    }

    // Handle multi-select user filter
    if (user) {
      if (Array.isArray(user)) {
        const placeholders = user.map((_, i) => `$${params.length + i + 1}`);
        conditions.push(`"user" IN (${placeholders.join(", ")})`);
        params.push(...user);
      } else if (typeof user === "string" && user.trim()) {
        conditions.push(`"user" = $${params.length + 1}`);
        params.push(user);
      }
    }

    // Add WHERE clause if there are conditions
    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }

    query += ` ORDER BY "project id" DESC`;

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
    // Capitalize first letter of status
    const capitalizedStatus =
      status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    const result = await client.query(insertQuery, [
      name,
      capitalizedStatus,
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

// Get all distinct project statuses
fastify.get("/api/project-statuses", async (request, reply) => {
  try {
    const client = await pool.connect();
    const result = await client.query(
      "SELECT DISTINCT status FROM projects ORDER BY status ASC"
    );
    client.release();
    return {
      success: true,
      statuses: result.rows.map((row) => row.status).filter(Boolean),
    };
  } catch (error) {
    fastify.log.error(error);
    return reply.status(500).send({
      success: false,
      error: "Failed to fetch statuses",
      details: error.message,
    });
  }
});

// Get all distinct project places (cities)
fastify.get("/api/project-places", async (request, reply) => {
  try {
    const client = await pool.connect();
    const result = await client.query(
      "SELECT DISTINCT place FROM projects ORDER BY place ASC"
    );
    client.release();
    return {
      success: true,
      places: result.rows.map((row) => row.place).filter(Boolean),
    };
  } catch (error) {
    fastify.log.error(error);
    return reply.status(500).send({
      success: false,
      error: "Failed to fetch places",
      details: error.message,
    });
  }
});

// Get all distinct project users
fastify.get("/api/project-users", async (request, reply) => {
  try {
    const client = await pool.connect();
    const result = await client.query(
      'SELECT DISTINCT "user" FROM projects ORDER BY "user" ASC'
    );
    client.release();
    return {
      success: true,
      users: result.rows.map((row) => row.user).filter(Boolean),
    };
  } catch (error) {
    fastify.log.error(error);
    return reply.status(500).send({
      success: false,
      error: "Failed to fetch users",
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
