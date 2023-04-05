function cartAdd(ProdId) {
    console.log();
    $.ajax({
        url: `/add-to-cart/${ProdId}`,
        method: 'get',
        success: (response) => {
            if (response.status) {
                Swal.fire({
                    position: "top-right",
                    icon: "success",
                    title: "Product Added to Cart",
                    showConfirmButton: false,
                    timer: 1500
                });
            }
        },
        error: (err) => {
            console.log(err);
        }
    });
}

function wishlistAdd(ProdId) {
    console.log();
    $.ajax({
        url: `/add-to-wishlist/${ProdId}`,
        method: 'get',
        success: (response) => {
            if (response.status) {
                Swal.fire({
                    position: "top-right",
                    icon: "success",
                    title: "Product Wishlisted",
                    showConfirmButton: false,
                    timer: 1500
                });
            }
        },
        error: (err) => {
            console.log(err);
        }
    });
}

// const changeQuantity = (cartId, productId, userId, count) => {
//     console.log(cartId, productId, userId, count);
//     const quantity = parseInt(document.getElementById(productId).value)
//     console.log(quantity);
//     $.ajax({
//         type: 'POST',
//         url: '/change-quantity',
//         data: {
//             cartId,
//             productId,
//             count,
//             quantity,
//             userId
//         },
//         success: (response) => {
//             console.log(response);
//             if (response.removed) {
//                 alert('Product remove from your cart')
//                 location.reload()
//             } else {
//                 document.getElementById(productId).innerHTML = quantity + count
//                 const total = response.total.total
//                 document.getElementById('totalAmount').innerHTML = `$${total}`
//                 console.log(response.total.total)



//                 // const subtotalArr = response.subtotal
//                 // for (let i = 0; i < subtotalArr.length; i++) {
//                 //     const subtotal = subtotalArr[i].subtotal
//                 //     const productId = subtotalArr[i]._id.toString()
//                 //     // document.getElementById(`${productId}-subtotal`).innerHTML = `$${subtotal}`
//                 // }
//             }
//         },
//         error: function (data) {
//             alert(data)
//             console.log(JSON.stringify(data))
//         }
//     })
// }
const changeQuantity = (cartId, productId, userId, count) => {
    const quantity = parseInt(document.getElementById(productId).innerHTML)
    $.ajax({
      type: 'POST',
      url: '/change-quantity',
      data: {
        cartId,
        productId,
        count,
        quantity,
        userId
      },
      success: (response) => {
        if (response.removed) {
          // Show the "Product Removed" modal
          $('#productRemovedModal').modal('show')
  
          // Reload the page after the modal is closed
          $('#productRemovedModal').on('hidden.bs.modal', function () {
            location.reload()
          })
        }else if (!response.status){
          Swal.fire({
            icon: 'warning',
            title: 'Out of stock!',
            text: 'The requested quantity is not available.',
            confirmButtonText: 'OK',
            confirmButtonColor: '#8B4000',
            focusConfirm: '#FF0000',
            timer: 3000
          })
        } else {
          document.getElementById(productId).innerHTML = quantity + count
          let total = response.total.total
          total = formatMoney(total)
          document.getElementById('totalAmout').innerHTML = total
          const subtotalArr = response.subtotal
          for (let i = 0; i < subtotalArr.length; i++) {
            let subtotal = subtotalArr[i].subtotal
            subtotal = formatMoney(subtotal)
            const productId = subtotalArr[i]._id.toString()
  
            document.getElementById(`${productId}-subtotal`).innerHTML = subtotal
          }
        }
      },
      error: function (data) {
        alert(data)
        console.log(JSON.stringify(data))
      }
    })
  }

const deleteCartProduct = (cartId, productId) => {
    $.ajax({
        type: 'PUT',
        url: '/remove-cart-product',
        data: {
            cartId,
            productId
        },
        success: (response) => {
            if (response.removed) {
                alert('deleted item')
                location.reload()
            } else {
                alert('deletion failed')
            }
        },
        error: (err) => {
            alert(err)
        }
    })
}

function Cartget(cartId){
    $.ajax({
        url:`/user-cart/${cartId}`,
        method:'get',
        data:{
            cartId,
            productId,
        },
        sucess:(response)=>{
          const data = JSON.parse(response);
        }

    })
}