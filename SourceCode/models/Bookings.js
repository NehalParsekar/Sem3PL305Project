const Sequelize = require("sequelize");
const db = require("../config/dbConfig");
const Trains = require("./Trains");

const Bookings = db.define("Booking", {
    id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
    },
    bookingDate: {
        type: Sequelize.DATEONLY,
    },
    routeId: {
        type: Sequelize.STRING,
    },
    trainId: {
        type: Sequelize.STRING,
    },
    scheduleId: {
        type: Sequelize.STRING,
    },
    aGeneralSeats: {
        type: Sequelize.INTEGER,
    },
    aAcSeats: {
        type: Sequelize.INTEGER,
    },
    bGeneralSeats: {
        type: Sequelize.INTEGER,
    },
    bAcSeats: {
        type: Sequelize.INTEGER,
    },
});

module.exports = Bookings;

module.exports.getBookings = (routeId, scheduleId, trainId, bookingDate) => {
    return new Promise((resolve, reject) => {
        var sendData = {
            exists: false,
        };
        Bookings.findOne({
            where: {
                routeId,
                scheduleId,
                trainId,
                bookingDate,
            },
        })
            .then((data) => {
                if (data == null) {
                    return resolve(sendData);
                } else {
                    var booking = data.dataValues;
                    sendData.exists = true;
                    sendData.data = booking;
                    return resolve(sendData);
                }
            })
            .catch((e) => {
                return reject(e);
            });
    });
};
