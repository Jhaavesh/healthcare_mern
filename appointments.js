// routes/appointments.js
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const { body, validationResult } = require('express-validator');

// create appointment (patient)
router.post('/', [
  auth,
  body('doctor').notEmpty(),
  body('date').notEmpty()
], async (req, res) => {
  const errors = validationResult(req); if(!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const { doctor, date, notes } = req.body;
    const doc = await User.findById(doctor);
    if (!doc || doc.role !== 'doctor') return res.status(400).json({ msg: 'Invalid doctor id' });

    const appt = await Appointment.create({
      patient: req.user.id,
      doctor,
      date,
      notes
    });
    res.status(201).json(appt);
  } catch (err) { console.error(err); res.status(500).send('Server error'); }
});

// list appointments (role aware)
router.get('/', auth, async (req, res) => {
  try {
    const role = req.user.role;
    let appts;
    if (role === 'doctor') {
      appts = await Appointment.find({ doctor: req.user.id }).populate('patient', 'name email');
    } else if (role === 'patient') {
      appts = await Appointment.find({ patient: req.user.id }).populate('doctor', 'name specialization email');
    } else {
      appts = await Appointment.find().populate('patient doctor', 'name email specialization');
    }
    res.json(appts);
  } catch (err) { console.error(err); res.status(500).send('Server error'); }
});

// update appointment (status/notes/date)
router.put('/:id', auth, async (req, res) => {
  try {
    const { status, notes, date } = req.body;
    const appt = await Appointment.findById(req.params.id);
    if (!appt) return res.status(404).json({ msg: 'Appointment not found' });

    // permission: patient who created OR doctor assigned OR admin
    if (req.user.role !== 'admin' && appt.patient.toString() !== req.user.id && appt.doctor.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Forbidden' });
    }

    if (status) appt.status = status;
    if (notes) appt.notes = notes;
    if (date) appt.date = date;
    await appt.save();
    res.json(appt);
  } catch (err) { console.error(err); res.status(500).send('Server error'); }
});

module.exports = router;
