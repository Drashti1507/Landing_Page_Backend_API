const Service = require("../Models/serviceModel");

// Get all services
exports.getServices = async (req, res) => {
  const services = await Service.find();
  res.json(services);
};

// Create service (Admin)
exports.createService = async (req, res) => {
  const service = await Service.create(req.body);
  res.json(service);
};

// Update service
exports.updateService = async (req, res) => {
  const service = await Service.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(service);
};

// Delete service
exports.deleteService = async (req, res) => {
  await Service.findByIdAndDelete(req.params.id);
  res.json({ msg: "Service deleted" });
};