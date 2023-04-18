var db = require('../config/connection')
var collection = require('../config/collections')
const { ObjectId } = require('bson');
let objectId = require('mongodb').ObjectId;
module.exports = {
    allUsers: () => {
        return new Promise(async (resolve, reject) => {
            let admin = await db.get().collection(collection.USER_COLLECTION).find({}).toArray()
            if (admin) {
                resolve(admin);
                console.log(admin)
            }
            else {
                resolve({ satus: false })
            }
        })
    },
    adminLogin: async (adminInfo) => {
        try {
            const response = {}
            const admin = await db
                .get()
                .collection(collection.ADMIN_COLLECTION)
                .findOne({ email: adminInfo.email })
            if (admin) {
                if (adminInfo.password === admin.password) {
                    console.log("login successful")
                    response.admin = admin
                    response.status = true
                    return response
                } else {
                    console.log("login error")
                    return { status: false }
                }
            } else {
                console.log("login failed")
                return { notExist: true }
            }
        } catch (error) {
            console.log("login error", error)
            throw new Error("Login failed")
        }
    },
    blockUsers: (userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(userId) }, { $set: { access: false } }).then(() => {
                resolve({ status: true });
            })
        })
    },
    unblockUser: (userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(userId) }, { $set: { access: true } }).then(() => {
                resolve({ status: true });
            })
        })
    },
    addProduct: (product, urls) => {
        return new Promise((resolve, reject) => {
            product.price = parseInt(product.price)
            product.quantity = parseInt(product.quantity)
            product.image = urls;
            product.isActive = true;
            let data = db.get().collection(collection.PRODUCT_COLLECTION).insertOne(product)
            resolve(data)
        })
    },

    viewProduct: () => {
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray();
            resolve(products);
        })

    },

    editProduct: (id) => {
        return new Promise(async (resolve, reject) => {
            let document = await db.get().collection(collection.PRODUCT_COLLECTION).find({ _id: ObjectId(id) }).toArray()
            resolve(document)

        })
    },

    updateProduct: (id, product, urls) => {
        return new Promise((resolve, reject) => {
            product.price = parseInt(product.price)
            product.quantity = parseInt(product.quantity)
            product.image = urls
            product.isActive = true

            db.get().collection(collection.PRODUCT_COLLECTION)
                .updateOne({ _id: ObjectId(id) }, {
                    $set: {
                        name: product.name,
                        category: product.category,
                        description: product.description,
                        image: product.image,
                        quantity: product.quantity,
                        price: product.price,
                    },
                })
                .then(() => {
                    resolve(null) // success
                })
                .catch((err) => {
                    reject(err) // error
                })
        })
    },

    getAllUserOrders: async () => {
        try {
            const orders = await db
                .get()
                .collection(collection.ORDER_COLLECTION)
                .find({})
                .sort([("date", 1)])
                .toArray()
            console.log(orders);
            return orders
        } catch (error) {
            console.log(error)
            throw new Error(error)
        }
    },

    changeOrderStatus: async (orderInfo) => {
        try {
            const { orderId, newStatus } = orderInfo
            const order = await db
                .get()
                .collection(collection.ORDER_COLLECTION)
                .find({ _id: objectId(orderId) })
                .toArray()
            const response = db
                .get()
                .collection(collection.ORDER_COLLECTION)
                .updateOne(
                    { _id: objectId(orderId) },
                    {
                        $set: {
                            status: newStatus,
                        },
                    }
                )
            if (response) {
                const now = new Date()
                const dateString = now.toDateString() // e.g. "Sun Mar 07 2023"
                const timeString = now.toLocaleTimeString() // e.g. "2:37:42 PM"
                const dateTimeString = `${timeString} ${dateString}` // e.g. "Sun Mar 07 2023 2:37:42 PM"
                const key = `${newStatus}`
                const status = { [key]: dateTimeString, orderId }
                if (order) {
                    db.get()
                        .collection(collection.ORDER_STATUS)
                        .updateOne(
                            { orderId },
                            {
                                $set: {
                                    [key]: dateTimeString,
                                },
                            },
                            { upsert: true }
                        )
                } else {
                    db.get().collection(collection.ORDER_STATUS).insertOne({ status })
                }
                return response
            }
        } catch (error) {
            console.log(error)
            throw new Error(error)
        }
    },

    getCurrentProducts: async (orderId) => {
        try {
            console.log("///////////////////////////////");
            const order = await db
                .get()
                .collection(collection.ORDER_COLLECTION)
                .aggregate([
                    {
                        $match: {
                            _id: objectId(orderId),
                        },
                    },
                    {
                        $addFields: {
                            deliveryAddressId: { $toObjectId: "$deliveryAddressId" },
                        },
                    },
                    {
                        $lookup: {
                            from: collection.ADDRESS_COLLECTION,
                            localField: "deliveryAddressId",
                            foreignField: "_id",
                            as: "deliveryAddress",
                        },
                    },
                    {
                        $addFields: {
                            deliveryDetails: {
                                $mergeObjects: {
                                    $arrayElemAt: ["$deliveryAddress", 0],
                                },
                            },
                        },
                    },
                    {
                        $project: {
                            deliveryAddress: 0,
                        },
                    },
                    {
                        $unwind: "$products",
                    },
                    {
                        $lookup: {
                            from: collection.PRODUCT_COLLECTION,
                            localField: "products.item",
                            foreignField: "_id",
                            as: "products.item",
                        },
                    },
                    {
                        $addFields: {
                            "products.item": {
                                $arrayElemAt: ["$products.item", 0],
                            },
                        },
                    },
                    {
                        $group: {
                            _id: "$_id",
                            userId: { $first: "$userId" },
                            name: { $first: "$address.name" },
                            mobile: { $first: "$address.mobile" },
                            deliveryAddressId: { $first: "$address._id" },
                            paymentMethod: { $first: "$paymentMethod" },
                            totalPrice: { $first: "$totalAmount.total" },
                            offerTotal: { $first: "$offerTotal" },
                            priceAfterDiscount: { $first: "$priceAfterDiscount" },
                            paymentStatus: { $first: "$paymentStatus" },
                            status: { $first: "$status" },
                            date: { $first: "$date" },
                            deliveryDetails: { $first: "$address" },
                            returnStatus: { $first: "$returnStatus" },
                            refundStatus: { $first: "$refundStatus" },
                            products: { $push: "$products" },
                        },
                    },
                ])
                .toArray()
            console.log("======");
            return order[0]
        } catch (error) {
            throw new Error(error)
        }
    },
    getallCategories: () => {
        return new Promise(async (resolve, reject) => {
            let categories = await db.get().collection(collection.CATEGORY_COLLECTION).find({}).toArray()
            resolve(categories)
        })
    },

    addCategories: async (category) => {
        try {
            const existingCategory = await db.get().collection(collection.CATEGORY_COLLECTION).findOne({ name: category.name });
            if (existingCategory) {
                return { message: "Category already exists." };
            } else {
                const response = await db.get().collection(collection.CATEGORY_COLLECTION).insertOne(category);
                return response;
            }
        } catch (error) {
            throw new Error(error);
        }
    },

    allCategory: async () => {
        try {
            const category = await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray();
            return category;
        } catch (error) {
            throw new Error(error);
        }
    },
    getCurrentCategory: async (catId) => {
        try {
            const category = await db
                .get()
                .collection(collection.CATEGORY_COLLECTION)
                .findOne({ _id: objectId(catId) })
            return category
        } catch (error) {
            throw new Error(error)
        }
    },
    updateCurrentCategory: async (catId, category) => {
        try {
            const response = await db
                .get()
                .collection(collection.CATEGORY_COLLECTION)
                .updateOne(
                    { _id: objectId(catId) },
                    {
                        $set: {
                            product_name: category.product_name,
                            product_slug: category.product_slug,
                            product_parent: category.product_parent,
                            product_description: category.product_description,
                        },
                    }
                )
            return response
        } catch (error) {
            throw new Error("Error updating category")
        }
    },
    createCoupon: async (coupon) => {
        console.log(coupon);
        let applyCoupon = false;
        if (coupon.type == 'product') {
            coupon.percentage = parseInt(coupon.percentage);
            coupon.isoDateEnd = new Date(coupon.endDate);
            coupon.id = ObjectId(coupon.id);

            const offerField = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ $and: [{ _id: coupon.id }, { offer: { $exists: true } }] });
            if (offerField) {
                const data = await db.get().collection(collection.COUPON_COLLECTION).findOne({ $and: [{ type: 'category' }, { category: offerField.category }] });
                console.log(data);
                if (data) {
                    if (coupon.percentage > data.percentage) {
                        applyCoupon = true;
                    }
                }
            } else {
                applyCoupon = true;
            }
        } else {
            coupon.limit = parseInt(coupon.limit);
            coupon.code = coupon.code.toUpperCase();
            coupon.percentage = parseInt(coupon.percentage);
            coupon.isoDateStart = new Date(coupon.startDate);
            coupon.isoDateEnd = new Date(coupon.endDate);
        }
        if (coupon.type == 'category') {
            coupon.categoryOption = true;
        }
        return new Promise(async (resolve, reject) => {
            db.get().collection(collection.COUPON_COLLECTION).insertOne(coupon);
            if (coupon.type == 'category') {
                var samp = await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([
                    {
                        $match: { category: coupon.category },
                    },
                    {
                        $project: { price: 1 },
                    },

                    {
                        $addFields: {
                            offer: { $subtract: ['$price', { $divide: [{ $multiply: ['$price', coupon.percentage] }, 100] }] },

                        },
                    },
                ]).forEach((element) => {
                    db.get().collection(collection.PRODUCT_COLLECTION).updateMany({ _id: element._id }, {
                        $set: {
                            offer: element.offer,
                        },
                    });
                });
            } else if (coupon.type == 'product' && applyCoupon) {
                var samp = await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([
                    {
                        $match: { _id: coupon.id },
                    },
                    {
                        $project: { price: 1 },
                    },

                    {
                        $addFields: {
                            offer: { $subtract: ['$price', { $divide: [{ $multiply: ['$price', coupon.percentage] }, 100] }] },

                        },
                    },
                ]).toArray();
                console.log(samp, '>>>>>>>>>>>>>>>>>>>>>>');
                db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: coupon.id }, {
                    $set: {
                        offer: samp[0].offer,
                    },
                });
            }
            resolve();
        });
    },
    calculateTotalRevenue: async () => {
        try {
            const revenue = await db
                .get()
                .collection(collection.ORDER_COLLECTION)
                .aggregate([
                    {
                        $match: {
                            status: "completed",
                        },
                    },
                    {
                        $group: {
                            _id: null,
                            totalRevenue: { $sum: "$totalAmount.total" },
                        },
                    },
                ])
                .toArray()
            if (revenue.length) {
                return revenue[0]?.totalRevenue
            } else {
                return 0
            }
        } catch (error) {
            throw new Error(error)
        }
    },
    calculateTotalRevenueByDate: async (from, to) => {
        try {
            const isoFromDate = new Date(from).toISOString()
            const isoToDate = new Date(to).toISOString()
            const revenue = await db
                .get()
                .collection(collection.ORDER_COLLECTION)
                .aggregate([
                    {
                        $match: {
                            status: "completed",
                            returnReason: { $exists: false },
                            date: {
                                $gte: new Date(isoFromDate),
                                $lt: new Date(isoToDate),
                            },
                        },
                    },
                    {
                        $group: {
                            _id: null,
                            totalRevenue: { $sum: "$offerTotal" },
                        },
                    },
                ])
                .toArray()
            if (revenue.length) {
                return revenue[0]?.totalRevenue
            } else {
                return 0
            }
        } catch (error) {
            throw new Error(error)
        }
    },
    calculateTotalOrders: async () => {
        try {
            const orders = await db
                .get()
                .collection(collection.ORDER_COLLECTION)
                .countDocuments()
            return orders
        } catch (error) {
            throw new Error(error)
        }
    },
    calculateTotalOrdersByDate: async (from, to) => {
        try {
            const fromDate = new Date(from)
            const toDate = new Date(to)
            const orders = await db
                .get()
                .collection(collection.ORDER_COLLECTION)
                .aggregate([
                    {
                        $match: {
                            date: {
                                $gte: fromDate,
                                $lt: toDate,
                            },
                        },
                    },
                    {
                        $count: "totalOrders",
                    },
                ])
                .toArray()
            return orders[0] ? orders[0].totalOrders : 0
        } catch (error) {
            throw new Error(error)
        }
    },
    calculateTotalNumberOfProducts: async () => {
        try {
            const products = await db
                .get()
                .collection(collection.PRODUCT_COLLECTION)
                .countDocuments()
            return products
        } catch (error) {
            throw new Error(error)
        }
    },
    calculateTotalNumberOfProductsByDate: async (from, to) => {
        try {
            const products = await db
                .get()
                .collection(collection.PRODUCT_COLLECTION)
                .countDocuments({
                    addedAt: { $gte: new Date(from), $lte: new Date(to) },
                })
            return products
        } catch (error) {
            throw new Error(error)
        }
    },
    calculateMonthlyEarnings: async () => {
        try {
            const monthlyIncome = await db
                .get()
                .collection(collection.ORDER_COLLECTION)
                .aggregate([
                    {
                        $match: {
                            status: "completed",
                            returnReason: { $exists: false },
                            date: {
                                $gte: new Date(
                                    new Date().getFullYear(),
                                    new Date().getMonth(),
                                    1
                                ),
                                $lt: new Date(
                                    new Date().getFullYear(),
                                    new Date().getMonth() + 1,
                                    1
                                ),
                            },
                        },
                    },
                    {
                        $group: {
                            _id: null,
                            monthlyRevenue: { $sum: "$offerTotal" },
                        },
                    },
                ])
                .toArray()
            if (monthlyIncome.length) {
                return monthlyIncome[0].monthlyRevenue
            } else {
                return 0
            }
        } catch (error) {
            throw new Error(error)
        }
    },




    //Graph Helpers




    calculateMonthlySalesForGraph: async () => {
        try {
            const sales = await db
                .get()
                .collection(collection.ORDER_COLLECTION)
                .aggregate([
                    {
                        $group: {
                            _id: {
                                month: { $month: "$date" },
                                year: { $year: "$date" },
                            },
                            totalRevenue: { $sum: "$totalAmount.total" },
                        },
                    },
                    {
                        $project: {
                            _id: 0,
                            month: "$_id.month",
                            year: "$_id.year",
                            totalRevenue: 1,
                        },
                    },
                    {
                        $sort: {
                            year: 1,
                            month: 1,
                        },
                    },
                ])
                .toArray()
            const revenueByMonth = Array(12).fill(0)
            sales.forEach(({ month, totalRevenue }) => {
                revenueByMonth[month - 1] = totalRevenue
            })
            return revenueByMonth
        } catch (error) {
            throw new Error(error)
        }
    },
    NumberOfProductsAddedInEveryMonth: async () => {
        try {
            const products = await db
                .get()
                .collection(collection.PRODUCT_COLLECTION)
                .aggregate([
                    {
                        $project: {
                            addedAt: {
                                $dateFromString: {
                                    dateString: "$addedAt",
                                    format: "%Y-%m-%dT%H:%M:%S.%LZ"
                                }
                            }
                        }
                    },
                    {
                        $group: {
                            _id: {
                                month: { $month: "$addedAt" },
                                year: { $year: "$addedAt" },
                            },
                            count: { $sum: 1 },
                        },
                    },
                    {
                        $project: {
                            _id: 0,
                            month: "$_id.month",
                            year: "$_id.year",
                            count: 1,
                        },
                    },
                    {
                        $sort: {
                            year: 1,
                            month: 1,
                        },
                    },
                ])
                .toArray()
                console.log("++++++++",products);
            const productsByMonth = Array(12).fill(0)
            products.forEach(({ month, count }) => {
                productsByMonth[month - 1] = count
            })
            return productsByMonth
        } catch (error) {
            throw new Error(error)
        }
    },
    findNumberOfMonthlyVisitors: async () => {
        try {
            const visitors = await db
                .get()
                .collection(collection.VISITORS)
                .aggregate([
                    {
                        $group: {
                            _id: {
                                year: { $toInt: { $substr: ["$month", 0, 4] } },
                                month: { $toInt: { $substr: ["$month", 5, 2] } },
                            },
                            count: { $sum: 1 },
                        },
                    },
                    {
                        $project: {
                            _id: 0,
                            month: "$_id.month",
                            year: "$_id.year",
                            count: 1,
                        },
                    },
                    {
                        $sort: {
                            year: 1,
                            month: 1,
                        },
                    },
                ])
                .toArray()
          console.log("))))))",visitors);
            const visitorsByMonth = Array(12).fill(0)
            visitors.forEach(({ month, count }) => {
                visitorsByMonth[month - 1] = count
            })
            console.log("+++",visitorsByMonth);
            return visitorsByMonth
        } catch (error) {
            throw new Error(error)
        }
    },
    orderStatitics: async () => {
        try {
            const orderStat = await db
                .get()
                .collection(collection.ORDER_COLLECTION)
                .aggregate([
                    {
                        $group: {
                            _id: null,
                            placedCount: {
                                $sum: {
                                    $cond: [
                                        {
                                            $and: [
                                                { $eq: ["$status", "placed"] },
                                                { $not: [{ $ifNull: ["$reasonTocancell", false] }] },
                                                { $not: [{ $ifNull: ["$returnReason", false] }] },
                                            ],
                                        },
                                        1,
                                        0,
                                    ],
                                },
                            },
                            confirmedCount: {
                                $sum: {
                                    $cond: [
                                        {
                                            $and: [
                                                { $eq: ["$status", "confirmed"] },
                                                { $not: [{ $ifNull: ["$reasonTocancell", false] }] },
                                                { $not: [{ $ifNull: ["$returnReason", false] }] },
                                            ],
                                        },
                                        1,
                                        0,
                                    ],
                                },
                            },
                            shippedCount: {
                                $sum: {
                                    $cond: [
                                        {
                                            $and: [
                                                { $eq: ["$status", "shipped"] },
                                                { $not: [{ $ifNull: ["$reasonTocancell", false] }] },
                                                { $not: [{ $ifNull: ["$returnReason", false] }] },
                                            ],
                                        },
                                        1,
                                        0,
                                    ],
                                },
                            },
                            outForDeliveryCount: {
                                $sum: {
                                    $cond: [
                                        {
                                            $and: [
                                                { $eq: ["$status", "delivery"] },
                                                { $not: [{ $ifNull: ["$reasonTocancell", false] }] },
                                                { $not: [{ $ifNull: ["$returnReason", false] }] },
                                            ],
                                        },
                                        1,
                                        0,
                                    ],
                                },
                            },
                            completedCount: {
                                $sum: {
                                    $cond: [
                                        {
                                            $and: [
                                                { $eq: ["$status", "completed"] },
                                                { $not: [{ $ifNull: ["$reasonTocancell", false] }] },
                                                { $not: [{ $ifNull: ["$returnReason", false] }] },
                                            ],
                                        },
                                        1,
                                        0,
                                    ],
                                },
                            },
                            reasonToCancelCount: {
                                $sum: {
                                    $cond: [{ $ifNull: ["$reasonTocancell", false] }, 1, 0],
                                },
                            },
                            returnReasonCount: {
                                $sum: { $cond: [{ $ifNull: ["$returnReason", false] }, 1, 0] },
                            },
                        },
                    },
                    {
                        $project: {
                            _id: 0,
                            placedCount: 1,
                            confirmedCount: 1,
                            shippedCount: 1,
                            outForDeliveryCount: 1,
                            completedCount: 1,
                            reasonToCancelCount: 1,
                            returnReasonCount: 1,
                        },
                    },
                ])
                .toArray()
            const valuesArray = Object.values(orderStat[0])
            console.log(valuesArray);
            return valuesArray
        } catch (error) {
            throw new Error(error)
        }
    },
    paymentStat: async () => {
        try {
            const payment = await db
                .get()
                .collection(collection.ORDER_COLLECTION)
                .aggregate([
                    {
                        $group: {
                            _id: null,
                            codCount: {
                                $sum: { $cond: [{ $eq: ["$paymentMethod", "cod"] }, 1, 0] },
                            },
                            walletCount: {
                                $sum: { $cond: [{ $eq: ["$paymentMethod", "wallet"] }, 1, 0] },
                            },
                            razorpayCount: {
                                $sum: {
                                    $cond: [{ $eq: ["$paymentMethod", "razorpay"] }, 1, 0],
                                },
                            },
                        },
                    },
                    {
                        $project: {
                            _id: 0,
                            codCount: 1,
                            walletCount: 1,
                            razorpayCount: 1,
                        },
                    },
                ])
                .toArray()
            const valuesArray = Object.values(payment[0])
            valuesArray[1] = 49
            return valuesArray
        } catch (error) {
            throw new Error(error)
        }
    },
    mostSellingProducts: async (startDate, endDate) => {
        try {

            const mostSelling = await db
                .get()
                .collection(collection.ORDER_COLLECTION)
                .aggregate([
                    {
                        $match: {
                            date: {
                                $gte: new Date(
                                    startDate + "T00:00:00.000Z"
                                ),
                                $lt: new Date(
                                    endDate + "T23:59:59.999Z"
                                ),
                            },
                        },
                    },
                    { $unwind: "$products" },
                    {
                        $group: {
                            _id: "$products.item",
                            sold: { $sum: "$products.quantity" },
                        },
                    },
                    { $sort: { sold: -1 } },
                    { $limit: 5 },
                    {
                        $lookup: {
                            from: collection.PRODUCT_COLLECTION,
                            localField: "_id",
                            foreignField: "_id",
                            as: "product_details",
                        },
                    },

                ])
                .toArray()
            return mostSelling.map((product) => {
                return {
                    name: product.product_details[0].product_title,
                    price: product.product_details[0].product_price,
                    offerPrice: product.product_details[0].offerPrice,
                    sold: product.sold,
                    revenue: product.product_details[0].offerPrice * product.sold
                }
            })
        } catch (error) {
            throw new Error(error)
        }
    },


}

