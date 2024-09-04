import { prisma } from "..";
import { queueRequest } from "./QueueServiceTypes";
import { Request, Response } from "express";

// Retrieves the queue for a specific doctor, appointment date, and hospital.
export const getDoctorQueue = async (req: Request, res: Response) => {
  // Validate the request body
  if (!queueRequest.safeParse(req.body).success) {
    return res.status(400).json({ message: 'Invalid request' });
  }

  const { doctorId } = req.params;
  const { appointmentDate, hospitalId } = req.body;

  try {
    // Query the queue table with the specified filters
    const queues = await prisma.queue.findMany({
      where: {
        doctorId: Number(doctorId),
        appointmentDate: new Date(appointmentDate).toISOString(),
        hospitalId,
      },
      orderBy: { position: "asc" },
      include: {
        ticket: true,
      },
    });

    // Send the queue data as a JSON response
    res.json(queues);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Can't retrieve Queue data" });
  }
};

/**
 * Retrieves the current position of a patient in a doctor's queue.
 *
 * @param req The Express request object.
 * @param res The Express response object.
 */
export const getPatientQueuePosition = async (req: Request, res: Response) => {
  // Validate the request body
  if (!queueRequest.safeParse(req.body).success) {
    return res.status(400).json({ message: 'Invalid request' });
  }

  const { doctorId } = req.query;
  const { appointmentDate, hospitalId } = req.body;

  try {
    // Query the queue table for the specified filters and select only the position
    const order = await prisma.queue.findMany({
      select: { position: true },
      where: {
        doctorId: Number(doctorId),
        appointmentDate: new Date(appointmentDate).toISOString(),
        hospitalId,
        pending: false,
      },
      orderBy: { position: "asc" },
    });

    // Get the first position in the queue
    const position = order[0];

    // Send the position as a JSON response
    res.json(position);
  } catch (error) {
    res.status(500).json({ message: "Can't retrieve Queue status data" });
  }
};

/**
 * Retrieves the total number of patients in a doctor's queue for a given date.
 *
 * @param req The Express request object.
 * @param res The Express response object.
 */
export const getQueueTotal = async (req: Request, res: Response) => {
  // Validate the request body
  if (!queueRequest.safeParse(req.body).success) {
    return res.status(400).json({ message: 'Invalid request' });
  }

  const { doctorId } = req.query;
  const { appointmentDate, hospitalId } = req.body;

  try {
    // Query the queue table for the specified filters and count the entries
    const order = await prisma.queue.findMany({
      select: { position: true },
      where: {
        doctorId: Number(doctorId),
        appointmentDate: new Date(appointmentDate).toISOString(),
        hospitalId,
      },
    });
    const total = order.length;

    // Send the total count as a JSON response
    res.json({ total });
  } catch (error) {
    res.status(500).json({ message: "Can't retrieve Queue status data" });
  }
};

/**
 * Deletes a patient from a doctor's queue.
 *
 * @param req The Express request object.
 * @param res The Express response object.
 */
export const deleteQueueEntry = async (req: Request, res: Response) => {
  // Validate the request body
  if (!queueRequest.safeParse(req.body).success) {
    return res.status(400).json({ message: 'Invalid request' });
  }

  const { doctorId, position } = req.query;
  const { appointmentDate, hospitalId } = req.body;

  try {
    // Delete the queue entry matching the specified criteria
    await prisma.queue.deleteMany({
      where: {
        doctorId: Number(doctorId),
        appointmentDate: new Date(appointmentDate).toISOString(),
        hospitalId,
        position: Number(position),
      },
    });

    // Send a success message as a JSON response
    res.status(200).json({ message: 'Queue deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: "Can't delete Queue status data" });
  }
};

/**
 * Creates a new future appointment reference.
 *
 * @param req The Express request object.
 * @param res The Express response object.
 */
export const createFutureAppointment = async (req: Request, res: Response) => {
  const { doctorId, patientId, nextdate, notes } = req.body;

  try {
    // Create a new future reference record in the database
    const futureReference = await prisma.futureReference.create({
      data: {
        doctorId,
        patientId,
        futureAppointmentDate: new Date(nextdate).toISOString(),
        notes,
      },
    });

    // Send the newly created future reference as a JSON response
    res.status(201).json(futureReference);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Marks a patient's queue entry as pending.
 *
 * @param req The Express request object.
 * @param res The Express response object.
 */
export const markQueueEntryPending = async (req: Request, res: Response) => {
    // Validate the request body
    if (!queueRequest.safeParse(req.body).success) {
      return res.status(400).json({ message: 'Invalid request' });
    }
  
    const { doctorId, position } = req.query;
    const { appointmentDate, hospitalId } = req.body;
  
    try {
      // Update the queue entry to mark it as pending
      await prisma.queue.updateMany({
        data: { pending: true },
        where: {
          doctorId: Number(doctorId),
          appointmentDate: new Date(appointmentDate).toISOString(),
          hospitalId: Number(hospitalId),
          position: Number(position),
        },
      });
  
      // Send a success message as a JSON response
      res.status(200).json({ message: 'Queue entry marked as pending successfully' });
    } catch (error) {
      res.status(500).json({ message: "Can't update Queue status data" });
    }
  };