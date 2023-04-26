const adminHelper = require('../helpers/admin-helpers')
const generateReport = require("../middlewares/salesreport.js");
const fs = require("fs");

module.exports = {
    makeReportGet: async (req, res) => {
        try {
            // Get the current date
            const currentDate = new Date()
            // Format the date as YYYY-MM-DD string
            const formattedCurrDay = currentDate.toISOString().slice(0, 10) // "YYYY-MM-DD"
            // Set the date to the first day of the month
            const firstDayOfMonth = new Date(
                currentDate.getFullYear(),
                currentDate.getMonth(),
                1
            )
            // Format the date as YYYY-MM-DD string
            const formattedFirstDay = firstDayOfMonth.toISOString().slice(0, 10) // "YYYY-MM-DD"
            const [
                totalProducts,
                totalRevenue,
                totalOrders,
            ] = await Promise.allSettled([
                adminHelper.calculateTotalNumberOfProductsByDate(
                    formattedFirstDay,
                    formattedCurrDay
                ),
                adminHelper.calculateTotalRevenueByDate(
                    formattedFirstDay,
                    formattedCurrDay
                ),
                adminHelper.calculateTotalOrdersByDate(
                    formattedFirstDay,
                    formattedCurrDay
                ),
                adminHelper.calculateMonthlyEarnings(
                    formattedFirstDay,
                    formattedCurrDay
                ),
                adminHelper.mostSellingProducts(formattedFirstDay, formattedCurrDay),
                adminHelper.calculateMonthlySalesForGraph()
            ])
            const response = {
                totalRevenue,
                totalProducts,
                totalOrders,
            }
            res.render("admin/create-report", { response })
        } catch (err) {
            res.status(500).send("Internal Server Error")
        }
    },
    makeReport: async (req, res) => {
        const {
            format,
            totalRevenue,
            averageOrderValue,
            monthlyEarnings,
            totalOrders,
            numberOfProducts,
        } = req.body
        let { from, to } = req.body
        // Check if format field is present
        if (!format) {
            return res.status(400).send("Format field is required")
        }
        if (from.trim().length == 0) {
            // Get the current date
            const currentDate = new Date()
            // Format the date as YYYY-MM-DD string
            const formattedCurrDay = currentDate.toISOString().slice(0, 10) // "YYYY-MM-DD"
            // Set the date to the first day of the month
            const firstDayOfMonth = new Date(
                currentDate.getFullYear(),
                currentDate.getMonth(),
                1
            )
            // Format the date as YYYY-MM-DD string
            const formattedFirstDay = firstDayOfMonth.toISOString().slice(0, 10) // "YYYY-MM-DD"
            from = formattedFirstDay
            to = formattedCurrDay
        }
        const mostSold = await adminHelper.mostSellingProducts(from, to)
        const salesBasedOnMonth = await adminHelper.calculateMonthlySalesForGraph()
        const salesData = {
            totalRevenue,
            averageOrderValue,
            monthlyEarnings,
            totalOrders,
            numberOfProducts,
            salesBasedOnMonth
        }
        const date = {
            from,
            to,
        }

        try {
            // Convert the report into the selected file format and get the name of the generated file
            const reportFile = await generateReport(format, salesData, date).catch(
                (err) => {
                    throw new Error(err)
                }
            )
            // Set content type and file extension based on format
            let contentType, fileExtension
            if (format === "pdf") {
                contentType = "application/pdf"
                fileExtension = "pdf"
            } else if (format === "excel") {
                contentType =
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                fileExtension = "xlsx"
            } else {
                return res.status(400).send("Invalid format specified")
            }
            // Send the report back to the client and download it
            res.setHeader(
                "Content-Disposition",
                `attachment; filename=sales-report.${fileExtension}`
            )
            res.setHeader("Content-Type", contentType)
            const fileStream = fs.createReadStream(reportFile)
            fileStream.pipe(res)
            fileStream.on("end", () => {
                // Remove the file from the server
                fs.unlink(reportFile, (err) => {
                    if (err) {
                        throw new Error(err)
                    }
                })
            })
        } catch (err) {
            return res.status(500).send("Error generating report")
        }
    },
    filterReportData: async (req, res) => {
        try {
          const { from, to } = req.body
          const [
            totalRevenue,
            totalOrders,
            totalProducts,
            monthlyEarnings,
            averageOrderValue,
            mostSold
          ] =await Promise.allSettled([
            adminHelper.calculateTotalRevenue(from, to),
            adminHelper.calculateTotalOrders(from, to),
            adminHelper.calculateTotalNumberOfProducts(from, to),
            adminHelper.calculateMonthlyEarnings(),
            adminHelper.calculateAverageOrderValue(),
            adminHelpers.mostSellingProducts(from,to)
          ]).then((results) =>
          results
            .filter((result) => result.status === "fulfilled")
            .map((result) => result.value)
        )
          const response = {
            totalRevenue,
            totalProducts,
            totalOrders,
            averageOrderValue,
            monthlyEarnings,
            mostSold,
            from,
            to,
          }
          res.json(response)
        } catch (error) {
          res.status(500).json({ Message: "Internal Server Error" })
        }
      },
}