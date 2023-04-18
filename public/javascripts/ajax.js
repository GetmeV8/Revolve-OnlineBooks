
function cartAdd(ProdId) {
    console.log(">>>>>>>>>>>>>>>");
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
const setOrderCancellData = (orderId) => {
    document.getElementById('orderId').value = orderId
}
const cancellOrderModal = () => {
    const orderId = document.getElementById('orderId').value
    const reason = document.getElementById('reason').value
    cancelOrder(orderId, reason)
}

const cancelOrder = (orderId, reason) => {
    $.ajax({
        url: '/cancel-order',
        data: {
            orderId,
            reason
        },
        method: 'post',
        success: (res) => {
            location.reload()
        }
    })
}