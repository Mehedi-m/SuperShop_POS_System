
import {
  getCountersByBranch,
  createCounter,
  updateCounter,
  toggleCounterStatus,
} from "../services/counter.service.js";

export const getCounters = async (req, res) => {
  const counters = await getCountersByBranch(req.params.branchId);

  res.status(200).json({
    success: true,
    data: counters,
  });
};

export const createNewCounter = async (req, res) => {
  const counter = await createCounter(
    req.params.branchId,
    req.body
  );

  res.status(201).json({
    success: true,
    message: "Counter created successfully",
    data: counter,
  });
};

export const updateExistingCounter = async (req, res) => {
  const counter = await updateCounter(
    req.params.counterId,
    req.body
  );

  res.status(200).json({
    success: true,
    message: "Counter updated successfully",
    data: counter,
  });
};

export const changeCounterStatus = async (req, res) => {
  const counter = await toggleCounterStatus(req.params.counterId);

  res.status(200).json({
    success: true,
    message: "Counter status updated successfully",
    data: counter,
  });
};
