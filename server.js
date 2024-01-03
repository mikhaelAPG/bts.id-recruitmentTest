const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = 8080;

app.use(bodyParser.json());

let users = [];

let checklists = [];
let checklistItems = {};

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    return res.sendStatus(401);
  }

  jwt.verify(token, "rahasia-rahasia", (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }
    req.user = user;
    next();
  });
};

app.get("/checklist", authenticateToken, (req, res) => {
  res.json(checklists);
});

app.post("/checklist", authenticateToken, (req, res) => {
  const { name } = req.body;
  const newChecklist = { id: checklists.length + 1, name, items: [] };
  checklists.push(newChecklist);
  checklistItems[newChecklist.id] = [];
  res.status(201).json({ message: "New checklist created successfully" });
});

app.delete("/checklist/:checklistId", authenticateToken, (req, res) => {
  const { checklistId } = req.params;
  checklists = checklists.filter(
    (checklist) => checklist.id !== parseInt(checklistId)
  );
  delete checklistItems[parseInt(checklistId)];
  res.json({ message: "Checklist deleted successfully" });
});

app.get("/checklist/:checklistId/item", authenticateToken, (req, res) => {
  const { checklistId } = req.params;
  const items = checklistItems[parseInt(checklistId)] || [];
  res.json(items);
});

app.post("/checklist/:checklistId/item", authenticateToken, (req, res) => {
  const { checklistId } = req.params;
  const { itemName } = req.body;
  const newItem = {
    id: checklistItems[parseInt(checklistId)].length + 1,
    name: itemName,
    completed: false,
  };
  checklistItems[parseInt(checklistId)].push(newItem);
  res.status(201).json({ message: "New checklist item created successfully" });
});

app.get(
  "/checklist/:checklistId/item/:checklistItemId",
  authenticateToken,
  (req, res) => {
    const { checklistId, checklistItemId } = req.params;
    const item = checklistItems[parseInt(checklistId)].find(
      (item) => item.id === parseInt(checklistItemId)
    );
    res.json(item);
  }
);

app.put(
  "/checklist/:checklistId/item/:checklistItemId",
  authenticateToken,
  (req, res) => {
    const { checklistId, checklistItemId } = req.params;
    const { completed } = req.body;
    const itemToUpdate = checklistItems[parseInt(checklistId)].find(
      (item) => item.id === parseInt(checklistItemId)
    );
    itemToUpdate.completed = completed;
    res.json({ message: "Checklist item updated successfully" });
  }
);

app.delete(
  "/checklist/:checklistId/item/:checklistItemId",
  authenticateToken,
  (req, res) => {
    const { checklistId, checklistItemId } = req.params;
    checklistItems[parseInt(checklistId)] = checklistItems[
      parseInt(checklistId)
    ].filter((item) => item.id !== parseInt(checklistItemId));
    res.json({ message: "Checklist item deleted successfully" });
  }
);

app.put(
  "/checklist/:checklistId/item/rename/:checklistItemId",
  authenticateToken,
  (req, res) => {
    const { checklistId, checklistItemId } = req.params;
    const { itemName } = req.body;
    const itemToRename = checklistItems[parseInt(checklistId)].find(
      (item) => item.id === parseInt(checklistItemId)
    );
    itemToRename.name = itemName;
    res.json({ message: "Checklist item renamed successfully" });
  }
);

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (user) {
    const token = jwt.sign({ username: user.username }, "rahasia-rahasia", {
      expiresIn: "1h",
    });
    res.json({ token });
  } else {
    res.status(401).json({ message: "Authentication failed" });
  }
});

app.post("/register", (req, res) => {
  const { email, username, password } = req.body;

  const newUser = { email, username, password };
  users.push(newUser);

  res.status(201).json({ message: "User registered successfully" });
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
