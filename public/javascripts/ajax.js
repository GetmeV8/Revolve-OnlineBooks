function cartAdd(ProdId){
console.log();
$.ajax({
    url:`/add-to-cart/${ProdId}`,
    method: 'get',
    success: (response)=>{
        if(response.status){
            location.reload()
    }
    },
    error:(err)=>{
        console.log(err)
    }
})
}