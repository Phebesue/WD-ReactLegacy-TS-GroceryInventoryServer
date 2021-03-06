let express = require("express");
let router = express.Router();
let validateSession = require("../middleware/validate-session");
const Grocery = require("../db").import("../models/grocery");
const User = require("../db").import("../models/user");
const LocationX = require("../db").import("../models/location");
const Vendor = require("../db").import("../models/vendor");

// Endpoints
// POST:  http://localhost:3020/grocery/create
// GET:   http://localhost:3020/grocery/all
// GET:   http://localhost:3020/grocery/:id
// PUT:   http://localhost:3020/grocery/:id
// DEL:   http://localhost:3020/grocery/:id

// -----  grocery Create  -----
// POST:  http://localhost:3020/grocery/create
router.post("/create", (req, res) => {
  const groceryEntry = {
    upc: req.body.grocery.upc,
    groceryName: req.body.grocery.groceryName,
    storageType: req.body.grocery.storageType,
    storageContainer: req.body.grocery.storageContainer,
    quantity: req.body.grocery.quantity,
    unitOfMeasure: req.body.grocery.unitOfMeasure,
    onHand: req.body.grocery.onHand,
    locationId: req.body.grocery.locationId,
    vendorId: req.body.grocery.vendorId,
    groceryNotes: req.body.grocery.groceryNotes,
    userId: req.user.id,
  };
  Grocery.create(groceryEntry)
    .then((grocery) =>
      res.status(200).json({
        message: "Grocery Item Created",
        grocery,
      })
    )
    .catch((err) => res.status(500).json({ error: err }));
});

// -----  Get All grocery -----
// GET:   http://localhost:3020/grocery/all
router.get("/all", (req, res) => {
  Grocery.findAll({ include: ["vendor", "location"] })
    .then((grocery) =>
      res.status(200).json({
        message: "Groceries Retrieved",
        grocery,
      })
    )
    .catch((err) => res.status(500).json({ error: err }));
});

// Consider search by name, storageType quantity, etc?
// -----Get Grocery by Id  -----
// GET:   http://localhost:3020/grocery/
router.get("/one/:id", (req, res) => {
  Grocery.findOne({
    where: { id: req.params.id },
    // include: ["vendor", "location"],
  })
    .then((grocery) =>
      res.status(200).json({
        message: "Grocery Item Retrieved",
        grocery,
      })
    )
    .catch((err) => res.status(500).json({ error: err }));
});

// -----  Update grocery  -----
// PUT:   http://localhost:3020/grocery/:id
router.put("/update/:id", (req, res) => {
  const updateGrocery = {
    upc: req.body.grocery.upc,
    groceryName: req.body.grocery.groceryName,
    storageType: req.body.grocery.storageType,
    storageContainer: req.body.grocery.storageContainer,
    quantity: req.body.grocery.quantity,
    unitOfMeasure: req.body.grocery.unitOfMeasure,
    onHand: req.body.grocery.onHand,
    locationId: req.body.grocery.locationId,
    vendorId: req.body.grocery.vendorId,
    groceryNotes: req.body.grocery.groceryNotes,
  };
  // Do I need userId here?
  const query = { where: { id: req.params.id } };
  //   const query = { where: { id: req.params.id, userId: req.user.id} };

  Grocery.update(updateGrocery, query)
    .then((grocery) =>
      res.status(200).json({ message: "Grocery Item Updated" })
    )
    .catch((err) => res.status(500).json({ error: err }));
});

// -----  Delete a grocery Entry  -----
// DEL:   http://localhost:3020/grocery/:id
router.delete("/:id", (req, res) => {
  if (!req.err && req.user.admin) {
    Grocery.destroy({ where: { id: req.params.id } })
      .then((grocery) =>
        res.status(200).json({ message: "Grocery Item Deleted" })
      )
      .catch((err) => res.json(req.errors));
  } else {
    return res.status(500).send({ message: "Not Authorized" });
  }
});

module.exports = router;
