
  const deleteFromWishlist = (productId) =>{
    $.ajax({
      url:"/user-wishlist/remove-item/"+productId,
      type:"DELETE",
      success:(response) =>{
        if(response.acknowledged){
          location.reload()
        } else {
          Swal.fire({
            text:"Oops! Something went wrong",
            showConfirmButton:true,
          })
        }
      },
      error:(response) =>{
        Swal.fire({
          text:"Oops! Something went wrong",
          showConfirmButton:true,
        })
      }
    })
  }
function cartAdd(ProdId) {
    console.log(">>>>>>>>>>>>>>>");
    console.log(ProdId)
    $.ajax({
        url: `/add-to-cart/${ProdId}`,
        method: 'get',
        success: (response) => {
            console.log("+++++");
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

function removeDollarAndParseInt(amount) {
    const withoutDollar = amount.replace('$', ''); // remove the dollar sign
    const parsedInt = parseInt(withoutDollar); // parse the string into an integer
    return parsedInt;
}

const changeQuantity = (cartId, productId, userId, count) => {
    const quantity = parseInt(document.getElementById(`quantity-${productId}`).innerHTML)
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
            console.log(response)
            if (response.removed) {
                // Show the "Product Removed" modal
                $('#productRemovedModal').modal('show')

                // Reload the page after the modal is closed
                $('#productRemovedModal').on('hidden.bs.modal', function () {
                    location.reload()
                })
            } else if (!response.status) {
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
                document.getElementById(`quantity-${productId}`).innerHTML = quantity + count
                const quantityml = document.getElementById(`quantity-${productId}`).innerHTML
                const productprice = removeDollarAndParseInt(document.getElementById(`productprice-${productId}`).innerHTML);
                const subtotal = quantityml * productprice
                document.getElementById(`subtotal-${productId}`).innerHTML = `$${subtotal}`
                document.getElementById(`totalAmount`).innerHTML = response.total.total


                console.log("++++++", subtotal, quantity, total, productprice)
            }
        },
        error: function (data) {
            alert(data)
            console.log(JSON.stringify(data))
        }
    })
}
const deleteCartProduct = (cartId, productId) => {
    Swal.fire({
        title: 'Are you sure?',
        text: 'You will not be able to recover this item!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel',
        reverseButtons: true
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                type: 'PUT',
                url: '/remove-cart-product',
                data: {
                    cartId,
                    productId
                },
                success: (response) => {
                    if (response.removed) {
                        Swal.fire(
                            'Deleted!',
                            'Your item has been deleted.',
                            'success'
                        ).then(() => {
                            location.reload();
                        });
                    } else {
                        Swal.fire(
                            'Deletion failed',
                            'The item could not be deleted.',
                            'error'
                        );
                    }
                },
                error: (err) => {
                    Swal.fire(
                        'Error',
                        'There was an error deleting the item.',
                        'error'
                    );
                }
            });
        }
    });
};
function Cartget(cartId) {
    $.ajax({
        url: `/user-cart/${cartId}`,
        method: 'get',
        data: {
            cartId,
            productId,
        },
        sucess: (response) => {
            const data = JSON.parse(response);
        }
    })
}
function cancelOrder(orderId) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to revert this!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, cancel it!'
    }).then((result) => {
      if (result.isConfirmed) {
        $.ajax({
          url: '/cancel-order',
          method: 'post',
          data: {
            orderId,
          },
          success: (response) => {
            Swal.fire({
              title: 'Cancelled!',
              text: 'Your order has been cancelled.',
              icon: 'success',
              timer: 2000
            }).then(() => {
              location.reload();
            });
          },
          error: (err) => {
            Swal.fire({
              title: 'Error!',
              text: 'Something went wrong. Please try again.',
              icon: 'error',
              timer: 2000
            });
          }
        });
      }
    });
  }

  const refundAmount = (orderId, userId, amount) => {
    console.log(">>>>",orderId, userId, amount)
    $.ajax({
        url: '/admin/refund-amount',
        data: {
            orderId,
            userId,
            amount
        },
        method: 'post',
        success: (response) => {
            console.log(response)
            if (response.status) {
                Swal.fire({
                    imageUrl: 'https://media.giphy.com/media/2u11zpzwyMTy8/giphy.gif',
                    title: 'Transferring Money...',
                    text: 'Please wait while we process your money transfer.',
                    showConfirmButton: true,
                    confirmButtonText: 'Close'
                }).then((result) => {
                    if (result.isConfirmed) {
                        location.reload();
                    }
                });
            } else {
                Swal.fire({
                    imageUrl: 'https://media.giphy.com/media/Km2YiI2mzRKgw/giphy.gif',
                    title: 'Transfer Failed',
                    text: 'Sorry, we were unable to process your money transfer. Please check your account balance and try again later.',
                    showConfirmButton: true,
                    confirmButtonText: 'Close'
                });
            }
        },
        error: (err) => {
            console.log(err)
        }
    })
}
  

  