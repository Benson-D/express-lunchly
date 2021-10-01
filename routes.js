"use strict";

/** Routes for Lunchly */

const express = require("express");

const Customer = require("./models/customer");
const Reservation = require("./models/reservation");

const { BadRequestError } = require("./expressError");

const router = new express.Router();

/** Homepage: show list of customers. */

router.get("/", async function (req, res, next) {
  const customers = await Customer.all();

  return res.render("customer_list.html", { customers });
});

// /** Search homepage: redirects to homepage when search submitted. */

router.get("/search/", async function (req, res, next) {
  const searchTerm = req.query.searchTerm;
  const searchTermArr = searchTerm.split(" ");
  const customers = await Customer.searchDb(searchTermArr.join(""));

  return res.render("customer_list.html", { customers });
});

/** Homepage: show list of top customers. */

router.get("/top-ten/", async function (req, res, next) {
  const customers = await Customer.topCustomers();
  return res.render("top_customers.html", { customers });
});

/** Form to add a new customer. */

router.get("/add/", async function (req, res, next) {
  return res.render("customer_new_form.html");
});

/** Handle adding a new customer. */

router.post("/add/", async function (req, res, next) {
  const { firstName, lastName, phone, notes } = req.body;
  const customer = new Customer({ firstName, lastName, phone, notes });
  await customer.save();

  return res.redirect(`/${customer.id}/`);
});

/** Show a customer, given their ID. */

router.get("/:id/", async function (req, res, next) {
  const customer = await Customer.get(req.params.id);

  const reservations = await customer.getReservations();

  return res.render("customer_detail.html", { customer, reservations });
});

/** Show form to edit a customer. */

router.get("/:id/edit/", async function (req, res, next) {
  const customer = await Customer.get(req.params.id);

  res.render("customer_edit_form.html", { customer });
});

/** Handle editing a customer. */

router.post("/:id/edit/", async function (req, res, next) {
  const customer = await Customer.get(req.params.id);
  customer.firstName = req.body.firstName;
  customer.lastName = req.body.lastName;
  customer.phone = req.body.phone;
  customer.notes = req.body.notes;
  await customer.save();

  return res.redirect(`/${customer.id}/`);
});

/** Handle adding a new reservation. */

router.post("/:id/add-reservation/", async function (req, res, next) {
  // if (req.body.startAt === undefined || req.body.numGuests === undefined) {
  //   throw new BadRequestError("Invalid Response");
  // }
  // let startAt;
  // try {
  //   startAt = new Date(req.body.startAt);
  // } catch (err) {
  //   console.log(err.message);
  //   throw new BadRequestError("Format Date");
  // }
  const { startAtDate, startAtTime } = req.body;
  // startAtDate + ' ' + startAttime + ':00';

  const customerId = req.params.id;
  // const startAt = new Date(req.body.startAtDate);
  const startAt = `${startAtDate} ${startAtTime}:00`;
  console.log(startAtDate, "Date", startAtTime, "Time");
  const numGuests = req.body.numGuests;
  const notes = req.body.notes;

  const reservation = new Reservation({
    customerId,
    startAt,
    numGuests,
    notes,
  });
  await reservation.save();

  return res.redirect(`/${customerId}/`);
});

module.exports = router;
