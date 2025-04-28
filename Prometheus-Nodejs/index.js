import Fastify from "fastify";
import db from "./database.js";
import fastifyCookie from "@fastify/cookie";
import fastifySession from "@fastify/session";
import formbody from "@fastify/formbody";
import metricsPlugin from "fastify-metrics";
import { register, Counter, Gauge, Histogram } from "prom-client";
import { performance } from "perf_hooks";

const fastify = Fastify({ logger: true });
await fastify.register(metricsPlugin, { endpoint: "/metrics" });

fastify.register(fastifyCookie);
fastify.register(fastifySession, {
  secret: "a_very_secret_key_that_should_be_changed",
  cookie: { secure: false },
  saveUninitialized: false,
  resave: false,
});

// Register formbody plugin to parse application/x-www-form-urlencoded
fastify.register(formbody);

// Prometheus metrics
const requestCounter = new Counter({
    name: "http_requests_total",
    help: "Total number of HTTP requests",
    labelNames: ["method", "route"],
  });
  
const loginUsersGauge = new Gauge({
  name: "logged_in_users",
  help: "Number of currently logged-in users",
});

const dbQueryDurationHistogram = new Histogram({
  name: "db_query_duration_seconds",
  help: "Histogram of database query durations in seconds",
  labelNames: ["method", "route"],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.075, 0.1],
});

// In-memory user store for demo purposes
const users = {
  user1: { username: "user1", password: "password1" },
  user2: { username: "user2", password: "password2" },
};

// Handle login form submissions
fastify.post("/login", async (request, reply) => {
  const { username, password } = request.body;
  const user = users[username];

  if (user && user.password === password) {
    request.session.user = { username: user.username };
	loginUsersGauge.inc(); // Increment gauge on successful login
    return reply.send({ message: "Login successful", username: user.username });
  } else {
    return reply.status(401).send({ error: "Invalid username or password" });
  }
});

// Handle logout
fastify.post("/logout", async (request, reply) => {
  if (request.session.user) {
	  loginUsersGauge.dec(); // Decrement gauge on logout
    delete request.session.user;
    return reply.send({ message: "Logout successful" });
  } else {
    return reply.status(401).send({ error: "Not logged in" });
  }
});

// Define a route for '/'
fastify.get("/", async (request, reply) => {
  requestCounter.labels(request.method, request.routerPath).inc();
  const dbQueryStart = performance.now();
  const rows = await new Promise((resolve, reject) => {
    db.all("SELECT title, release_date, tagline FROM movies", (err, rows) => {
      if (err) {
        console.error(err.message);
        reject(err);
      }
      resolve(rows);
    });
  });
  const dbQueryDuration = (performance.now() - dbQueryStart) / 1000;
  dbQueryDurationHistogram
 .labels(request.method, request.routerPath)
 .observe(dbQueryDuration);
  return rows.splice(0, 8);
});

fastify.listen({ port: 3000, host: '0.0.0.0' }, (err) => {
  if (err) throw err;
  console.log(`server listening on ${fastify.server.address().port}`);
});
