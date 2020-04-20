const express = require("express");
const cors = require("cors");
const { uuid, isUuid } = require("uuidv4");

const app = express();
const repositories = [];

// Middlewares
function log(request, response, next) {
  const { method, url } = request;
  const message = `[${method.toUpperCase()}] ${url}`;

  console.log(message);

  return next();
}

function validateRepositoryCreation(request, response, next) {
  const { title, url, techs } = request.body;

  if (title && url && techs) {
    return next();
  }

  return response.status(400).json({ error: "Invalid params" });
}

function validateRepositoryId(request, response, next) {
  const { id } = request.params;

  const hasId = repositories.some((repository) => repository.id === id);

  if (hasId && isUuid(id)) {
    return next();
  }

  return response.status(400).json({ error: "Repository not found." });
}

app.use(express.json());
app.use(cors());
app.use(log);
app.use("/repositories/:id", validateRepositoryId);

// Routes
app.get("/repositories", (request, response) => {
  return response.json([...repositories]);
});

app.post("/repositories", validateRepositoryCreation, (request, response) => {
  const { title, url, techs } = request.body;

  const newRepository = {
    id: uuid(),
    title,
    url,
    techs,
    likes: 0,
  };

  repositories.push(newRepository);

  return response.json(newRepository);
});

app.put("/repositories/:id", (request, response) => {
  const { id } = request.params;
  const { title, url, techs } = request.body;

  const repositoryIndex = getRepositoryIndexById(id);
  const repository = repositories[repositoryIndex];
  const repositoryUpdated = {
    ...repository,
    ...(title ? { title } : {}),
    ...(url ? { url } : {}),
    ...(techs ? { techs } : {}),
  };
  repositories[repositoryIndex] = repositoryUpdated;

  return response.json(repositoryUpdated);
});

app.delete("/repositories/:id", (request, response) => {
  const { id } = request.params;

  const repositoryIndex = getRepositoryIndexById(id);
  repositories.splice(repositoryIndex, 1);

  return response.status(204).send();
});

app.post("/repositories/:id/like", (request, response) => {
  const { id } = request.params;

  const repositoryIndex = getRepositoryIndexById(id);
  const repository = repositories[repositoryIndex];
  const repositoryUpdated = {
    ...repository,
    likes: repository.likes + 1,
  };
  repositories[repositoryIndex] = repositoryUpdated;

  return response.json(repositoryUpdated);
});

// Helper
function getRepositoryIndexById(id) {
  return repositories.findIndex((repository) => repository.id === id);
}

module.exports = app;
