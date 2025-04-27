const bcrypt = require('bcrypt');
const crypto = require("crypto");

const studentModel = require('../models/studentModel.js');
const adminModel = require('../models/adminModel.js');
const driverModel = require('../models/driverModel.js');
const busRouteModel = require('../models/busRouteModel.js');

const Mails = require('../utils/email.js');
const JWT = require('../utils/tokens.js');


const roleModels = {
    Admin: adminModel,
    Student: studentModel,
    Driver: driverModel,
    Route: busRouteModel,
};


const getRoutes = async (req, res) => {
    try {
        const routes = await busRouteModel.find();
        res.status(200).send({routes: routes});
    } catch (error) {
        console.error('Error fetching routes:', error);
        res.status(500).json({ message: 'Failed to fetch routes.' });
    }
};


const routeByDriverId = async (req, res) => {
    try {
       // console.log(req.params.driverId)
        const route = await busRouteModel.find({ "driver.driverId": req.params.driverId });

        if (!route) {
            return res.status(404).send({ message: 'Route not found.' });
        }

        res.status(200).send({route: route});
    } catch (error) {
        console.error('Error fetching route:', error);
        res.status(500).json({ message: 'Failed to fetch route.' });
    }
};

const fetchProfie = async (req,res) => {
    try {
        const userId = req.query.username; 
        const user = await studentModel.findOne({username: userId}).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ message: 'Failed to fetch profile.' });
    }
}

const updateProfile = async (req,res) => {
    try {
            const userId = req.query.username;
            const { firstName, lastName, class: studentClass, busStop, addressLine1, city, zipCode, fatherName, motherName } = req.body;
    
  
            let user = await studentModel.findOne({username: userId});
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
    
            user.firstName = firstName || user.firstName;
            user.lastName = lastName || user.lastName;
            user.class = studentClass || user.class;
            user.busStop = busStop || user.busStop;
            user.addressLine1 = addressLine1 || user.addressLine1;
            user.city = city || user.city;
            user.zipCode = zipCode || user.zipCode;
            user.fatherName = fatherName || user.fatherName;
            user.motherName = motherName || user.motherName;
    
           /* if (password) {
                const bcrypt = require("bcryptjs");
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(password, salt);
            } */
    
            await user.save();
            res.status(200).json({ message: "Profile updated successfully!" });
    
    } catch{
        console.error('Error updating profile route:', error);
        res.status(500).json({ message: 'Failed to update profile.' });
    }
}

const studentRoute = async (req, res) => {
    try {
        const username = req.params.username;

        const student = await studentModel.findOne({ username: username });

        if (!student) {
            return res.status(404).json({ message: 'Student not found.' });
        }

        const routeId = student.routeId;

        if (!routeId) {
            return res.status(400).json({ message: 'Route ID not assigned to this student.' });
        }

        const route = await busRouteModel.findOne({ routeId: routeId });

        if (!route) {
            return res.status(404).json({ message: 'Route not found.' });
        }

        res.status(200).json({ route });
    } catch (error) {
        console.error('Error fetching student route:', error);
        res.status(500).json({ message: 'Failed to fetch student route.' });
    }
};

const getAssignedDriverByRoute = async (req, res) => {
    const { routeId } = req.query;

    if (!routeId) {
        return res.status(400).json({ message: "Missing routeId in query" });
    }

    try {
        const route = await busRouteModel.findOne({ routeId });

        if (!route) {
            return res.status(404).json({ message: "Route not found" });
        }

        if (!route.driver || !route.driver.driverId) {
            return res.status(404).json({ message: "No driver assigned to this route" });
        }

        return res.status(200).json({
            message: "Driver fetched successfully",
            driver: route.driver
        });
    } catch (error) {
        console.error("Error fetching driver for route:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};


const getStudentRouteId = async (req, res) => {
    try {
        const { username } = req.query;

        if (!username) {
            return res.status(400).json({ message: "Missing username in query" });
        }

        const student = await studentModel.findOne({ username }).select("routeId");

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        res.status(200).json({ routeId: student.routeId });
    } catch (error) {
        console.error("Error fetching student's routeId:", error);
        res.status(500).json({ message: "Failed to fetch routeId", error: error.message });
    }
};



module.exports = {
    getRoutes,
    routeByDriverId,
    fetchProfie,
    updateProfile,
    studentRoute,
    getAssignedDriverByRoute,
    getStudentRouteId
}