module.exports = {
    inc: (value) => {
        return parseInt(value) + 1
    },
    eq: (a, b) => {
        return a === b
    },
    or: function (a, b, options) {
        if (a || b) {
            return options.fn(this)
        } else {
            return options.inverse(this)
        }
    },
    not: function (value) {
        return !value
    },
    notNull: (value, options) => {
        if (value !== null) {
            return options.fn(this)
        } else {
            return options.inverse(this)
        }
    },
    formatDate: function (dateString) {
        const date = new Date(dateString)
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true }
        return date.toLocaleString('en-US', options)
    }, multiply: (a, b) => {
        const price = convertRupeeStringToNumber(a)
        return price * b
      },
      subtract: (a, b) => {
        return a - b
      },
}
function convertRupeeStringToNumber(rupeeString) {
    // Convert the string to a String object and remove the rupee symbol and any commas
    const numericString = String(rupeeString).replace(/₹|,/g, '')
}  
