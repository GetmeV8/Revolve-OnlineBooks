function cartAdd(ProdId) {
    console.log();
    $.ajax({
        url: `/add-to-cart/${ProdId}`,
        method: 'get',
        success: (response) => {
            if (response.status) {
                location.reload()
            }
        },
        error: (err) => {
            console.log(err)
        }
    })
}
const changeQuantity = (cartId, productId, userId, count) => {
    console.log(cartId, productId, userId, count);
    const quantity = parseInt(document.getElementById(productId).value)
    console.log(quantity);
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
            console.log(response);
            if (response.removed) {
                alert('Product remove from your cart')
                location.reload()
            } else {
                document.getElementById(productId).innerHTML = quantity + count
                const total = response.total.total
                document.getElementById('totalAmount').innerHTML = `$${total}`
                console.log(response.total.total)

                // const subtotalArr = response.subtotal
                // for (let i = 0; i < subtotalArr.length; i++) {
                //     const subtotal = subtotalArr[i].subtotal
                //     const productId = subtotalArr[i]._id.toString()
                //     // document.getElementById(`${productId}-subtotal`).innerHTML = `$${subtotal}`
                // }
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