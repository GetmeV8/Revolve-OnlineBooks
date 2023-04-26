(function ($) {
    "use strict"
  fetch("/admin/data-for-other-graphs-and-chart")
  .then((response)=> response.json())
  .then((data) => {
    const {
      sales,
      products,
      visitors,
      orderStat,
      paymentStat
    } = data
  
    /* Sale statistics Chart */
    if ($("#myChart").length) {
      const ctx = document.getElementById("myChart").getContext("2d")
      // var sales = $("#sales").val().split(",")
      // var products = $("#products").val().split(",")
      // const visitors = $("#visitors").val().split(",")
      const chart = new Chart(ctx, {
        // The type of chart we want to create
        type: "line",
  
        // The data for our dataset
        data: {
          labels: [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ],
          datasets: [
            {
              label: "Sales",
              tension: 0.3,
              fill: true,
              backgroundColor: "rgba(44, 120, 220, 0.2)",
              borderColor: "rgba(44, 120, 220)",
              data: sales,
            },
            {
              label: "Visitors",
              tension: 0.3,
              fill: true,
              backgroundColor: "rgba(4, 209, 130, 0.2)",
              borderColor: "rgb(4, 209, 130)",
              data: visitors,
            },
            // {
            //   label: "Products",
            //   tension: 0.3,
            //   fill: true,
            //   backgroundColor: "rgba(380, 200, 230, 0.2)",
            //   borderColor: "rgb(380, 200, 230)",
            //   data: products,
            // },
          ],
        },
        options: {
          plugins: {
            legend: {
              labels: {
                usePointStyle: true,
              },
            },
          },
        },
      })
    } //End if
  
  //Polar area
  //   /* Order statitics */
    if ($("#orderStatitics").length) {
      const canvas = document.getElementById("orderStatitics")
      canvas.width = 400 // Set the width of the canvas to 400 pixels
      canvas.height = 400 // Set the height of the canvas to 400 pixels
  
      const ctx = document.getElementById("orderStatitics").getContext("2d")
    //    const chartData = $("#chartData").val().split(",")
      const labels = [
        "Placed",
        "Confirmed",
        "Shipped",
        "Delivery",
        "Completed",
        "Cancelled",
        "Returned",
      ] // example labels
  
      const chart = new Chart(ctx, {
        type: "polarArea",
  
        data: {
          labels: labels,
          datasets: [
            {
              label: "My Dataset",
              backgroundColor: [
                "rgba(23, 162, 82, 0.8)", // dark green
                "rgba(54, 162, 235, 0.8)", // blue
                "rgba(255, 206, 86, 0.8)", // yellow
                "rgba(75, 192, 192, 0.8)", // green
                "rgba(153, 102, 255, 0.8)", // purple
                "rgba(255, 240, 0, 0.8)", // dark yellow
                "rgba(204, 0, 0, 0.8)", // dark red
              ],
              data: orderStat,
            },
          ],
        },
        options: {
          plugins: {
            legend: {
              labels: {
                usePointStyle: true,
              },
            },
          },
          scale: {
            ticks: {
              beginAtZero: true,
            },
            reverse: false,
          },
        },
      })
    }
  
  //Donoght chart  
   /* Order statitics */
    if ($("#payment-statitics").length) {
      const canvas = document.getElementById("payment-statitics")
      canvas.width = 400 // Set the width of the canvas to 400 pixels
      canvas.height = 400 // Set the height of the canvas to 400 pixels
  
      const ctx = document.getElementById("payment-statitics").getContext("2d")
      const chart = new Chart(ctx, {
        type: "doughnut",
        data: {
          labels: ["Cod", "Wallet", "Razorpay"],
          datasets: [
            {
              label: "My Dataset",
              backgroundColor: [
                "#ff9076", // dark green
                "rgba(54, 162, 235, 0.8)", // blue
                "rgba(255, 240, 0, 0.8)", // dark yellow
                "rgba(75, 192, 192, 0.8)",
              ],
              borderColor: [
                "#ff9076", // dark green
                "rgba(54, 162, 235, 0.8)", // blue
                "rgba(255, 240, 0, 0.8)", // dark yellow
                "rgba(75, 192, 192, 0.8)",
              ],
              borderWidth: 1,
              data: paymentStat,
            },
          ],
        },
        options: {
          plugins: {
            legend: {
              labels: {
                usePointStyle: true,
              },
            },
          },
          radius: "70%",
        },
      })
    }
  
  })
  
    /*Bar chart most selling proudcts*/
    if ($("#most-selling").length) {
      const canvas = document.getElementById("most-selling")
      canvas.width = 400 // Set the width of the canvas to 400 pixels
      canvas.height = 400 // Set the height of the canvas to 400 pixels
    
      const ctx = document.getElementById("most-selling").getContext("2d")
      fetch("/admin/data-for-most-selling-product")
        .then((response) => response.json())
        .then((data) => {
          const chartData = data.chartData
          const chartLabels = chartData.map((product) => product.name)
          const chartValues = chartData.map((product) => product.sold)
          const chart = new Chart(ctx, {
            type: "bar",
            data: {
              labels: chartLabels,
              datasets: [
                {
                  label: "Most Selling Products",
                  backgroundColor: "#4B8BBE",
                  data: chartValues,
                },
              ],
            },
            options: {
              scales: {
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: "Number of products sold",
                  },
                },
                x: {
                  title: {
                    display: true,
                    text: "Product name",
                  },
                },
              },
              plugins: {
                legend: {
                  display: false,
                },
              },
            },
          })
        })
        .catch((error) => {
        })
    }
  })(jQuery)