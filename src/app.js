const express = require("express");
const cors = require("cors");
const { uuid, isUuid } = require("uuidv4");

const app = express();
const repositories = [];

// Middlewares
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

app.put("/repositories/:id", validateRepositoryId, (request, response) => {
  const { id } = request.params;
  const { title, url, techs } = request.body;

  const repositoryIndex = repositories.findIndex(
    (repository) => repository.id === id
  );
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

app.delete("/repositories/:id", validateRepositoryId, (request, response) => {
  const { id } = request.params;
  const repositoryIndex = repositories.findIndex(
    (repository) => repository.id === id
  );
  repositories.splice(repositoryIndex, 1);

  return response.status(204).send();
});

app.post("/repositories/:id/like", (request, response) => {
  // TODO
});

module.exports = app;
